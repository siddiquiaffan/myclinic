import { db } from "@/lib/db/index";
import { 
  SlotId, 
  NewSlotParams,
  UpdateSlotParams, 
  updateSlotSchema,
  insertSlotSchema, 
  slotIdSchema 
} from "@/lib/db/schema/slots";

export const createSlot = async (slot: NewSlotParams) => {
  const newSlot = insertSlotSchema.parse(slot);
  try {
    const s = await db.slot.create({ data: newSlot });
    return { slot: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateSlot = async (id: SlotId, slot: UpdateSlotParams) => {
  const { id: slotId } = slotIdSchema.parse({ id });
  const newSlot = updateSlotSchema.parse(slot);
  try {
    const s = await db.slot.update({ where: { id: slotId }, data: newSlot})
    return { slot: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteSlot = async (id: SlotId) => {
  const { id: slotId } = slotIdSchema.parse({ id });
  try {
    const s = await db.slot.delete({ where: { id: slotId }})
    return { slot: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

