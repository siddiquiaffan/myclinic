import { slotSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getSlots } from "@/lib/api/slots/queries";


// Schema for slots - used to validate API requests
const baseSchema = slotSchema.omit(timestamps)

export const insertSlotSchema = baseSchema.omit({ id: true });
export const insertSlotParams = baseSchema.extend({
  date: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  isAvailable: z.coerce.boolean()
}).omit({ 
  id: true
});

export const updateSlotSchema = baseSchema;
export const updateSlotParams = updateSlotSchema.extend({
  date: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
})
export const slotIdSchema = baseSchema.pick({ id: true });

// Types for slots - used to type API request params and within Components
export type Slot = z.infer<typeof slotSchema>;
export type NewSlot = z.infer<typeof insertSlotSchema>;
export type NewSlotParams = z.infer<typeof insertSlotParams>;
export type UpdateSlotParams = z.infer<typeof updateSlotParams>;
export type SlotId = z.infer<typeof slotIdSchema>["id"];
    
// this type infers the return from getSlots() - meaning it will include any joins
export type CompleteSlot = Awaited<ReturnType<typeof getSlots>>["slots"][number];

