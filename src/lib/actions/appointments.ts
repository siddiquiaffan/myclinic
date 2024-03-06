"use server";

import { revalidatePath } from "next/cache";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "@/lib/api/appointments/mutations";
import {
  AppointmentId,
  NewAppointmentParams,
  UpdateAppointmentParams,
  appointmentIdSchema,
  insertAppointmentParams,
  updateAppointmentParams,
} from "@/lib/db/schema/appointments";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateAppointments = () => revalidatePath("/appointments");

export const createAppointmentAction = async (input: NewAppointmentParams) => {
  try {
    const payload = insertAppointmentParams.parse(input);
    await createAppointment(payload);
    revalidateAppointments();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateAppointmentAction = async (input: UpdateAppointmentParams) => {
  try {
    const payload = updateAppointmentParams.parse(input);
    await updateAppointment(payload.id, payload);
    revalidateAppointments();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteAppointmentAction = async (input: AppointmentId) => {
  try {
    const payload = appointmentIdSchema.parse({ id: input });
    await deleteAppointment(payload.id);
    revalidateAppointments();
  } catch (e) {
    return handleErrors(e);
  }
};