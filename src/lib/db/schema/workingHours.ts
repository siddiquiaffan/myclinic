import { workingHourSchema } from "@/zodAutoGenSchemas";
import { z } from "zod";
import { timestamps } from "@/lib/utils";
import { getWorkingHours } from "@/lib/api/workingHours/queries";


// Schema for workingHours - used to validate API requests
const baseSchema = workingHourSchema.omit(timestamps)

export const insertWorkingHourSchema = baseSchema.omit({ id: true });
export const insertWorkingHourParams = baseSchema.extend({
  dayOfWeek: z.coerce.number(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
}).omit({ 
  id: true
});

export const updateWorkingHourSchema = baseSchema;
export const updateWorkingHourParams = updateWorkingHourSchema.extend({
  dayOfWeek: z.coerce.number(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
})
export const workingHourIdSchema = baseSchema.pick({ id: true });

// Types for workingHours - used to type API request params and within Components
export type WorkingHour = z.infer<typeof workingHourSchema>;
export type NewWorkingHour = z.infer<typeof insertWorkingHourSchema>;
export type NewWorkingHourParams = z.infer<typeof insertWorkingHourParams>;
export type UpdateWorkingHourParams = z.infer<typeof updateWorkingHourParams>;
export type WorkingHourId = z.infer<typeof workingHourIdSchema>["id"];
    
// this type infers the return from getWorkingHours() - meaning it will include any joins
export type CompleteWorkingHour = Awaited<ReturnType<typeof getWorkingHours>>["workingHours"][number];

