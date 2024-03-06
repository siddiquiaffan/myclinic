import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createWorkingHour,
  deleteWorkingHour,
  updateWorkingHour,
} from "@/lib/api/workingHours/mutations";
import { 
  workingHourIdSchema,
  insertWorkingHourParams,
  updateWorkingHourParams 
} from "@/lib/db/schema/workingHours";

export async function POST(req: Request) {
  try {
    const validatedData = insertWorkingHourParams.parse(await req.json());
    const { workingHour } = await createWorkingHour(validatedData);

    revalidatePath("/workingHours"); // optional - assumes you will have named route same as entity

    return NextResponse.json(workingHour, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }
}


export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedData = updateWorkingHourParams.parse(await req.json());
    const validatedParams = workingHourIdSchema.parse({ id });

    const { workingHour } = await updateWorkingHour(validatedParams.id, validatedData);

    return NextResponse.json(workingHour, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedParams = workingHourIdSchema.parse({ id });
    const { workingHour } = await deleteWorkingHour(validatedParams.id);

    return NextResponse.json(workingHour, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}
