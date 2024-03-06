import { db } from "@/lib/db/index";
import { type WorkingHourId, workingHourIdSchema } from "@/lib/db/schema/workingHours";

export const getWorkingHours = async () => {
  const w = await db.workingHour.findMany({});
  return { workingHours: w };
};

export const getWorkingHourById = async (id: WorkingHourId) => {
  const { id: workingHourId } = workingHourIdSchema.parse({ id });
  const w = await db.workingHour.findFirst({
    where: { id: workingHourId}});
  return { workingHour: w };
};


