import { db } from "@/lib/db/index";
import { type SlotId, slotIdSchema } from "@/lib/db/schema/slots";

export const getSlots = async () => {
  const s = await db.slot.findMany({});
  return { slots: s };
};

export const getSlotById = async (id: SlotId) => {
  const { id: slotId } = slotIdSchema.parse({ id });
  const s = await db.slot.findFirst({
    where: { id: slotId}});
  return { slot: s };
};

type GetSlotsByDate =  {
  isAvailable?: boolean;
  till?: Date;
}

export const getSlotsByDate = async (date: Date, options: GetSlotsByDate = {
  // isAvailable: true,
}) => {
  const { till, isAvailable } = options;

  const s = await db.slot.findMany({
    where: {
      ...(isAvailable !== undefined && { isAvailable }),
      date: {
        gte: date,
        lte: till ? till : new Date(new Date(date).setHours(23, 59, 59))
      }
     },
  });
  return { slots: s };
}


export const getSlotByDateAndTime = async (date: Date, startTime: Date) => {
  date.setHours(0,0,0)
  startTime.setSeconds(0, 0)

  // tillTime = startTime + 10 minutes
  const tillTime = new Date(startTime.getTime() + 10 * 60000);

  const s = await db.slot.findFirst({
    where: { 
      date: {
        gte: date,
        lte: new Date(new Date(date).setHours(23, 59, 59))
      }, 
      startTime: {
        gte: startTime,
        lte: tillTime
      }
    }
  });
  return { slot: s };
}