import { bookAppointment, cancelAppointmentByTrackingId, rescheduleAppointment } from "@/lib/api/appointments"
import { getAllSlotsByDate } from "@/lib/api/slots"
import { format } from "date-fns"
import { NextResponse } from "next/server"
import { getSlotByDateAndTime } from '../../../../lib/api/slots/queries';
import { Appointment } from "@/lib/db/schema/appointments"
import { getAppointment } from "@/lib/api/appointments/queries";

// dialogflow webhook
export const POST = async (req: Request) => {
    try {
        const apiKey = req.headers.get("x-api-key")?.trim()
        if (!apiKey)
            return new Response("Unauthorized", { status: 401 })
        if (apiKey !== process.env.DIALOGFLOW_API_KEY)
            return new Response("Forbidden", { status: 403 })

        const body = await req.json()
        const intent = body.queryResult.intent.displayName
        const parameters = body.queryResult.parameters
        const context = body.queryResult.outputContexts as Contexts

        switch (intent) {
            case "booking.initiate":
                return fetchSlots(parameters)
                
            case 'booking.get-time':
                return verifyTimeSlot(parameters, context.find(c => c.name.split('/').pop() === 'ongoing-booking'))
                
            case 'booking.finalize':
                return finalizeBooking(parameters, context)
                
            case "cancellation.finalize":
                return cancelAppointment(parameters)
                
            case 'reschdule.verify':
                return verifyAppointment(parameters)
                
            case 'reschdule.get-slots':
                return fetchSlots(parameters)
                
            // case 'reschdule.confirm-slots':
            //     return verifyTimeSlot(parameters, context.find(c => c.name.split('/').pop() === 'reschedule'))


            case 'reschdule.finalize':
                return reschedule(parameters, context.find(c => c.name.split('/').pop() === 'reschedule'))
                
            default:
                return NextResponse.json({
                    fulfillmentText: "Sorry, I'm having trouble processing your request. Please try again later."
                })
        }

    } catch (error) {
        return NextResponse.json({
            fulfillmentText: "Sorry, I'm having trouble processing your request. Please try again later."
        })
    }
}

async function fetchSlots(parameters: Parameters = {}) {

    let from = parameters.date ? new Date(parameters.date) : new Date() // if date is not provided, set from to tomorrow
    let to = new Date(from)

    // get slots for next two days
    if (!parameters.date) {
        from.setDate(from.getDate() + 1)
        from.setHours(0, 0, 0, 0)

        to.setDate(to.getDate() + 2)
        to.setHours(23, 59, 59, 999)
    } else {

        // if from is greater then a week, return error
        if (from > new Date(new Date().setDate(new Date().getDate() + 7))) {
            return NextResponse.json({
                fulfillmentText: `Sorry, you can only book appointments for the next 7 days.`
            })
        }

        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
    }

    const slots = await getAllSlotsByDate({ from: new Date(from), to: new Date(to) })

    if (!slots || Object.keys(slots).length === 0) {
        return NextResponse.json({
            fulfillmentText: parameters.date ? `Sorry, no slots available on ${from.toDateString()}` : "Sorry, no slots available for next two days."
        })
    }

    const message = (
        parameters.date ?
            `Here are the available slots for ${format(new Date(parameters.date), 'EEE, d MMM')}: ` :
            `Here are the available slots for next two days: `
    ) +
        `${Object.entries(slots).map(([date, slots]) => {
            return `${!parameters.date ? `On ${format(date, 'EEE, d MMM')}:: ` : ''}` +
                slots.flatMap(slot => {
                    return slot.isAvailable ? new Date(slot.startTime).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit' }) : []
                }).join(", ")
        }).join(" and ")
        }`

    return NextResponse.json({
        fulfillmentText: message
    })
}

async function verifyTimeSlot(parameters: Parameters = {}, context: Context = {}) {
    try {
        const time = parameters.time

        if (!time) {
            return NextResponse.json({
                fulfillmentText: `Please enter a valid time.`
            })
        }

        const { date: dateString } = context?.parameters || {}

        const date = new Date(dateString)
        date.setHours(0, 0, 0, 0)

        const s = await getSlotByDateAndTime(date, new Date(time))

        if (s.slot && !s.slot?.isAvailable) {
            return NextResponse.json({
                fulfillmentText: `Sorry, the slot is not available. Please choose another slot.`
            })
        }

        return NextResponse.json({
            fulfillmentText: `Great! Please provide your name and email to finalize the booking.`
        })
    } catch (err: any) {
        return NextResponse.json({
            fulfillmentText: `Sorry, I'm having trouble processing your request. Please try again later.`
        })
    }
}

async function finalizeBooking(parameters: Parameters = {}, context: Contexts = []) {

    const { name, email } = parameters

    // get date and time context array
    const bookingContext = context.find(c => c.name.split('/').pop() === 'ongoing-booking')
    const { date, time } = bookingContext?.parameters || {}

    for (
        const p of Object.entries({ name, email, date, time })
    ) {
        if (!p)
            return NextResponse.json({
                fulfillmentText: `'Something went wrong. Please re-start the booking process.'`
            })
    }
    const appointment = await bookAppointment({
        name,
        email,
        date: new Date(date),
        startTime: new Date(time),
    }) as Appointment | { error: string }

    if ('error' in appointment) {
        return NextResponse.json({
            fulfillmentText: appointment.error
        })
    }

    // console.log(appointment)

    const msg = `Your appointment is booked successfully. Your tracking id is "${appointment.trackingId}". Please use this tracking id for any future reference.`

    return NextResponse.json({
        fulfillmentText: msg
    })
}

async function cancelAppointment(parameters: Parameters = {}): Promise<any> {

    const { trackingid: trackingId, email } = parameters

    const response = await cancelAppointmentByTrackingId(trackingId, email)

    if ('error' in response)
        return NextResponse.json({
            fulfillmentText: response.error
        })

    return NextResponse.json({
        fulfillmentText: `Your appointment with tracking id ${trackingId} has been cancelled.`
    })
}


const rescheuleDatePropmts = [
    "Excellent, now share your preferred day or date with me.",
    "Awesome! Can you let me know your preferred day or date?",
    "Sure thing! Please specify your preferred day or date.",
    "Fantastic! What day or date works best for you?",
    "Perfect! Could you share your preferred day or date for the appointment?"
]

async function verifyAppointment(parameters: Parameters) {
    const { trackingid: trackingId, email } = parameters

    const { appointment } = await getAppointment({
        trackingId,
        email
    })

    if (!appointment) 
        return NextResponse.json({
            fulfillmentText: `Appointment with tracking-id: ${trackingId} and email: ${email} not found`
        })
        
    return NextResponse.json({
        fulfillmentText: rescheuleDatePropmts[Math.floor(Math.random() * 5)]
    })
}

async function reschedule (_parameters: Parameters = {}, context: Context = {} ) {
    const { date, time, trackingid: trackingId, email } = context?.parameters ?? {}

    console.log({ date, time, trackingId, email })

    const result = await rescheduleAppointment({
        trackingId, 
        email,
        date: new Date(date),
        time: new Date(time) 
    }) 

    if ('error' in result) 
        return NextResponse.json({
            fulfillmentText: result.error ?? 'Failed to reschedule your appointment, please try again later'
        })
        
    return NextResponse.json({
        fulfillmentText: `Your appointment with trackin-id ${trackingId} has been rescheduled to ${
            new Date(time).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit' })
        } - ${
            format(new Date(date), 'do MMMM')
        }`
    })
    
}

type Object = Record<string, any>

type Parameters = Object
type Context = Object
type Contexts = Array<Object>



/*

*/