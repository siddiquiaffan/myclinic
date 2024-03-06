import * as z from "zod"

export const workingHourSchema = z.object({
  id: z.string(),
  dayOfWeek: z.number().int(),
  startTime: z.date(),
  endTime: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
