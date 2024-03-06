import { db } from "@/lib/db/index";
import { 
  WorkingHourId, 
  NewWorkingHourParams,
  UpdateWorkingHourParams, 
  updateWorkingHourSchema,
  insertWorkingHourSchema, 
  workingHourIdSchema 
} from "@/lib/db/schema/workingHours";

export const createWorkingHour = async (workingHour: NewWorkingHourParams) => {
  const newWorkingHour = insertWorkingHourSchema.parse(workingHour);
  try {
    const w = await db.workingHour.create({ data: newWorkingHour });
    return { workingHour: w };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateWorkingHour = async (id: WorkingHourId, workingHour: UpdateWorkingHourParams) => {
  const { id: workingHourId } = workingHourIdSchema.parse({ id });
  const newWorkingHour = updateWorkingHourSchema.parse(workingHour);
  try {
    const w = await db.workingHour.update({ where: { id: workingHourId }, data: newWorkingHour})
    return { workingHour: w };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteWorkingHour = async (id: WorkingHourId) => {
  const { id: workingHourId } = workingHourIdSchema.parse({ id });
  try {
    const w = await db.workingHour.delete({ where: { id: workingHourId }})
    return { workingHour: w };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

