import { db } from "@/lib/db/index";
import { 
  AppointmentId, 
  NewAppointmentParams,
  UpdateAppointmentParams, 
  updateAppointmentSchema,
  insertAppointmentSchema, 
  appointmentIdSchema 
} from "@/lib/db/schema/appointments";

export const createAppointment = async (appointment: Omit<NewAppointmentParams, 'trackingId'>) => {
  const newAppointment = insertAppointmentSchema.parse(appointment);
  try {
    const a = await db.appointment.create({ data: newAppointment });
    return { appointment: a };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateAppointment = async (id: AppointmentId, appointment: UpdateAppointmentParams) => {
  const { id: appointmentId } = appointmentIdSchema.parse({ id });
  const newAppointment = updateAppointmentSchema.parse(appointment);
  try {
    const a = await db.appointment.update({ where: { id: appointmentId }, data: newAppointment})
    return { appointment: a };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteAppointment = async (id: AppointmentId) => {
  const { id: appointmentId } = appointmentIdSchema.parse({ id });
  try {
    const a = await db.appointment.delete({ where: { id: appointmentId }})
    return { appointment: a };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};
