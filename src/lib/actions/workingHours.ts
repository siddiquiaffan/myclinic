"use server";

import { revalidatePath } from "next/cache";
import {
  createWorkingHour,
  deleteWorkingHour,
  updateWorkingHour,
} from "@/lib/api/workingHours/mutations";
import {
  WorkingHourId,
  NewWorkingHourParams,
  UpdateWorkingHourParams,
  workingHourIdSchema,
  insertWorkingHourParams,
  updateWorkingHourParams,
} from "@/lib/db/schema/workingHours";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateWorkingHours = () => revalidatePath("/working-hours");

export const createWorkingHourAction = async (input: NewWorkingHourParams) => {
  try {
    const payload = insertWorkingHourParams.parse(input);
    await createWorkingHour(payload);
    revalidateWorkingHours();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateWorkingHourAction = async (input: UpdateWorkingHourParams) => {
  try {
    const payload = updateWorkingHourParams.parse(input);
    await updateWorkingHour(payload.id, payload);
    revalidateWorkingHours();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteWorkingHourAction = async (input: WorkingHourId) => {
  try {
    const payload = workingHourIdSchema.parse({ id: input });
    await deleteWorkingHour(payload.id);
    revalidateWorkingHours();
  } catch (e) {
    return handleErrors(e);
  }
};