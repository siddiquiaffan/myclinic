import { db } from "@/lib/db/index";
import { type AppointmentId, appointmentIdSchema, Appointment, CompleteAppointment } from "@/lib/db/schema/appointments";

export const getAppointments = async () => {
  const a = await db.appointment.findMany({include: { slot: true}});
  return { appointments: a };
};


export const getAppointment = async (data: Partial<Appointment>) => {
  const a = await db.appointment.findFirst({
    where: data
  })

  return { appointment: a }; 
}

export const getAppointmentById = async (id: AppointmentId) => {
  const { id: appointmentId } = appointmentIdSchema.parse({ id });
  const a = await db.appointment.findFirst({
    where: { id: appointmentId},
    include: { slot: true }
  });
  return { appointment: a };
};


interface GetAppointmentByTrackingId {
  includeSlot?: boolean;
}

export const getAppointmentByTrackingId = async (trackingId: Appointment['trackingId'], { includeSlot }: GetAppointmentByTrackingId = {
  includeSlot: true
}) => {
  const a = await db.appointment.findFirst({
    where: { trackingId },
    include: { slot: includeSlot }
  });
  return { appointment: a };
}

type GetAppointmentsByDate = {
  till?: Date;
}

export const getAppointmentsByDate = async (date: Date, options: GetAppointmentsByDate = {
}): Promise<{
  appointments: CompleteAppointment[];
}> => {

  const { till } = options;

  const s = await db.appointment.findMany({
    where: {
      // get complete appointments
      slot: {
        date: {
          gte: date,
          lte: till ? till : new Date(new Date(date).setHours(23, 59, 59))
        },
      },
    },
    include: { slot: true }
  });
  return { appointments: s };
}