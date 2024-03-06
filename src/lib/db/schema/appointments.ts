import { appointmentSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getAppointments } from "@/lib/api/appointments/queries";


// Schema for appointments - used to validate API requests
const baseSchema = appointmentSchema.omit(timestamps)

export const insertAppointmentSchema = baseSchema.omit({ id: true });
export const insertAppointmentParams = baseSchema.extend({
  slotId: z.coerce.string().min(1)
}).omit({ 
  id: true
});

export const updateAppointmentSchema = baseSchema;
export const updateAppointmentParams = updateAppointmentSchema.extend({
  slotId: z.coerce.string().min(1)
})
export const appointmentIdSchema = baseSchema.pick({ id: true });

// Types for appointments - used to type API request params and within Components
export type Appointment = z.infer<typeof appointmentSchema>;
export type NewAppointment = z.infer<typeof insertAppointmentSchema>;
export type NewAppointmentParams = z.infer<typeof insertAppointmentParams>;
export type UpdateAppointmentParams = z.infer<typeof updateAppointmentParams>;
export type AppointmentId = z.infer<typeof appointmentIdSchema>["id"];
    
// this type infers the return from getAppointments() - meaning it will include any joins
export type CompleteAppointment = Awaited<ReturnType<typeof getAppointments>>["appointments"][number];

