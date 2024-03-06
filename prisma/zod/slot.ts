import * as z from "zod"
import { CompleteAppointment, relatedAppointmentSchema } from "./index"

export const slotSchema = z.object({
  id: z.string(),
  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  isAvailable: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteSlot extends z.infer<typeof slotSchema> {
  Appointment: CompleteAppointment[]
}

/**
 * relatedSlotSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedSlotSchema: z.ZodSchema<CompleteSlot> = z.lazy(() => slotSchema.extend({
  Appointment: relatedAppointmentSchema.array(),
}))
