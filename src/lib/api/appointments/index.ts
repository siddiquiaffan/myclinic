// options type definition, if slotId is passed date, startTime & endTime should not be passed

import { Slot } from "@/lib/db/schema/slots";
import { createSlot, updateSlot } from "../slots/mutations";
import { getSlotByDateAndTime, getSlotById } from "../slots/queries";
import { createAppointment, updateAppointment } from "./mutations";
import { getAppointment, getAppointmentByTrackingId } from "./queries";
import { resend } from "@/lib/email";
import { db } from "@/lib/db/index";
import { Appointment as OrgAppointment } from "@/lib/db/schema/appointments";
import { findOrCreateSlot } from "../slots";
import console from "console";

type Appointment = {
    slotId?: string;
    date?: Date;
    startTime?: Date;
    endTime?: Date;
    name: string;
    email: string
}

export async function bookAppointment(options: Appointment) {
    try {

        // create appointment
        const appointment = db.$transaction(async (db: any) => {

            const { slot, new: isNewSlot, error } = await findOrCreateSlot(options)
            if (!slot)
                throw new Error(error ?? 'Failed to schedule an appointment')

            const a = await createAppointment({
                slotId: slot.id!,
                name: options.name,
                email: options.email
            })

            if (isNewSlot) {
                await db.slot.update({
                    where: { id: slot.id },
                    data: { isAvailable: false }
                })
            }

            if (!a.appointment)
                throw new Error('Error creating appointment');

            resend.emails.send({
                from: "DoClinic <onboarding@resend.dev'>",
                to: options.email,
                subject: "Appointment Booked",
                text: `Your appointment with tracking id ${a.appointment.trackingId} has been booked.
                Please use this tracking id for any future reference.

                Date: ${options.date?.toDateString()}
                Time: ${options.startTime?.toTimeString()} - ${options.endTime?.toTimeString()}

                Regards,
                DoClinic Team
                `
            })

            return a.appointment
        })

        return appointment;

    } catch (err) {
        console.log(err)
        throw err;
    }
}

export async function cancelAppointmentByTrackingId(
    trackingId: OrgAppointment['trackingId'],
    email: OrgAppointment['email']
): Promise<{ appointment?: any, error?: string }> {
    try {
        const appointment = await db.appointment.findFirst({
            where: {
                trackingId,
                email: {
                    equals: email
                }
            },
        })

        if (!appointment) {
            return { error: `Sorry, I couldn't find any appointment with tracking id ${trackingId}` }
        }

        // cancel appointment
        const res = await db?.$transaction(async (db: any) => {
            const deletedAppointment = await db.appointment.delete({
                where: { id: appointment.id }
            })

            if (!deletedAppointment)
                throw new Error('Error deleting appointment');

            const updatedSlot = await db.slot.update({
                where: { id: appointment.slotId },
                data: { isAvailable: true }
            })

            if (!updatedSlot.isAvailable)
                throw new Error('Error updating slot');

            // send email to user
            resend.emails.send({
                from: "DoClinic <onboarding@resend.dev>",
                to: appointment.email,
                subject: "Appointment Cancelled",
                text: `Your appointment with tracking id ${trackingId} has been cancelled.
                
                Regards,
                DoClinic Team
                `
            })

            return { appointment: deletedAppointment }
        })

        return res as { appointment: any }

    } catch (err: any) {
        return { error: err.message ?? 'Error cancelling appointment' }
    }
}

type RescheduleAppointment = {
    trackingId: OrgAppointment['trackingId']
    email: OrgAppointment['email']
    date: Date
    time: Date
}

export async function rescheduleAppointment1(d: RescheduleAppointment): Promise<{ appointment?: OrgAppointment, error?: string }> {
    try {

        // get exisiting appointment, return error if not found
        // start db.$transaction, get or create slot based on time, update previous slot with as available, add new slotId in existing appointment




        return { appointment: {} as OrgAppointment }
    } catch (err) {
        return { error: 'Failed to reschedule your appointment' }
    }
}


export async function rescheduleAppointment(d: RescheduleAppointment): Promise<{ appointment?: OrgAppointment, error?: string }> {
    try {

        const { trackingId, email } = d

        // Start a transaction
        const appointment = await db.$transaction(async (db: any) => {

            // Get the existing appointment
            // const { appointment } = await getAppointment({ trackingId, email })
            const appointment = await db.appointment.findFirstOrThrow({
                where: {
                    trackingId: {
                        equals: trackingId
                    },
                    email: {
                        equals: email
                    }
                }
            })
            if (!appointment) {
                return { error: 'Appointment not found' };
            }

            // Get or create a new slot
            const { slot, new: isNewSlot, error } = await findOrCreateSlot({
                startTime: new Date(d.time),
                date: new Date(d.date)
            })
            if (!slot)
                throw new Error(error ?? 'Failed to schedule the appointment')

            if (isNewSlot)
                await db.slot.update({
                    where: { id: appointment.slotId },
                    data: { isAvailable: true }
                })

            const updatedAppointment = await db.appointment.update({
                where: { id: appointment.id },
                data: { slotId: slot.id }
            })

            if (!updateAppointment)
                throw new Error('Failed to reschedule the appointment')

            return appointment as OrgAppointment

        });


        return { appointment: appointment as any };
    } catch (err) {
        console.log(err)
        return { error: 'Failed to reschedule your appointment' };
    }
}
