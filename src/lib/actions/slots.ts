"use server";

import { revalidatePath } from "next/cache";
import {
  createSlot,
  deleteSlot,
  updateSlot,
} from "@/lib/api/slots/mutations";
import {
  SlotId,
  NewSlotParams,
  UpdateSlotParams,
  slotIdSchema,
  insertSlotParams,
  updateSlotParams,
} from "@/lib/db/schema/slots";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateSlots = () => revalidatePath("/slots");

export const createSlotAction = async (input: NewSlotParams) => {
  try {
    const payload = insertSlotParams.parse(input);
    await createSlot(payload);
    revalidateSlots();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateSlotAction = async (input: UpdateSlotParams) => {
  try {
    const payload = updateSlotParams.parse(input);
    await updateSlot(payload.id, payload);
    revalidateSlots();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteSlotAction = async (input: SlotId) => {
  try {
    const payload = slotIdSchema.parse({ id: input });
    await deleteSlot(payload.id);
    revalidateSlots();
  } catch (e) {
    return handleErrors(e);
  }
};