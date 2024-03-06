import * as z from "zod"
import { CompleteSlot, relatedSlotSchema } from "./index"

export const appointmentSchema = z.object({
  id: z.string(),
  trackingId: z.number().int(),
  slotId: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteAppointment extends z.infer<typeof appointmentSchema> {
  slot: CompleteSlot
}

/**
 * relatedAppointmentSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedAppointmentSchema: z.ZodSchema<CompleteAppointment> = z.lazy(() => appointmentSchema.extend({
  slot: relatedSlotSchema,
}))
