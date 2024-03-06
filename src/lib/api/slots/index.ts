import { Slot } from "@/lib/db/schema/slots";
import { getSlotByDateAndTime, getSlots, getSlotsByDate } from "../slots/queries";
import { createSlot } from "./mutations";

export function formatSlotTime(slot: Slot) {
    return new Date(slot.startTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + " - " + new Date(slot.endTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
}

export function formatSlotDate(slot: Slot) {
    return slot.date.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
}


// ================= { Slot } ================= 

interface GetAllSlotsByDate {
    from: Date;
    to: Date;
}

function generate30MinSlots(date: Date = new Date()) {
    date.setHours(9, 0, 0, 0);

    const slots = [];
    for (let i = 9; i < 17; i++) {
        // one slot per hour
        const slot = {
            date,
            startTime: new Date(date.setHours(i, 0, 0)),
            endTime: new Date(date.setHours(i+1, 0, 0)),
            isAvailable: true,
        };
        slots.push(slot);
    }
    return slots;
}


export async function getAllSlotsByDate({ from, to }: GetAllSlotsByDate) : Promise<Record<string, Slot[]>>{

    const { slots: slotsFromDb } = await getSlotsByDate(from, {
        till: to,
    });

    // group slots by date
    const groupedSlots: Record<string, Slot[]> = slotsFromDb.reduce((acc: Record<string, Slot[]>, slot: Slot) => {
        const date = slot.date.toDateString();

        if (!acc[date])
            acc[date] = [] as Slot[];

        acc[date].push(slot);
        return acc;
    }, {});

    for (let currDate = new Date(from); currDate <= to; currDate.setDate(currDate.getDate() + 1)) {
        const date = currDate.toDateString();
        if (!groupedSlots[date]) {
            groupedSlots[date] = [];
        }
    }

    // add missing slots for each date
    Object.entries(groupedSlots).forEach(([date, slots]) => {
        const allSlots = generate30MinSlots(new Date(date)).map((slot) => {
            const slotFromDb = slots.find((s) => {
                // match hours and minutes only
                return s.startTime.getHours() === slot.startTime.getHours() && s.startTime.getMinutes() === slot.startTime.getMinutes();
            });

            if (slotFromDb)
                return slotFromDb;

            return slot;
        });

        // return allSlots;
        groupedSlots[date as string] = allSlots as Slot[];
    });

    return groupedSlots
}


export async function findOrCreateSlot(d : {
    id?: Slot['id']
    date?: Date
    startTime?: Date
    endTime?: Date
}): Promise<{
    slot?: Slot
    error?: string
    new?: boolean
}> {

    const { id, date, startTime, endTime } = d

    let slot: Slot | null = null;

    if (!id) {
        if (date && startTime) {

            // get existing slot
            const existing = await getSlotByDateAndTime(new Date(date), new Date(startTime));

            if (existing.slot) {
                if (!existing.slot.isAvailable)
                    return { error: 'Slot not available.' }

                slot = existing.slot;
            }
        } else {
            return { error: 'Invalid options' }
        }
    }

    
    if (!slot) {
        const slotRes = await createSlot({
            date: date!,
            startTime: startTime!,
            endTime: endTime ?? new Date(startTime!.getTime() + 60 * 60000),
            isAvailable: false
        })

        if (!slotRes.slot)
            return { error: 'Failed to create slot' }
        else 
            return { slot: slotRes.slot, new: true }
    }

    return { slot: slot! }

}

// getAllSlotsByDate({ from: new Date('2024-03-09'), to: new Date(new Date('2024-03-09').setHours(23, 59, 59, 999))}).then((x) => {
//     Object.entries(x).forEach(([date, slots]) => {

//         slots.forEach((s) => {
//             console.log(formatSlotTime(s), s.isAvailable)
//         })

//         console.log('slots', slots.length)

//         console.log('unavailable slots', slots.filter((s) => !s.isAvailable).length)    
//     })
// })

// getSlots().then((x: any) => {
//     console.log(x.slots.map((s: any) => {
//         return {
//             // ...s,
//             dateString: s.date.toDateString(),
//         }
//     }));
// })