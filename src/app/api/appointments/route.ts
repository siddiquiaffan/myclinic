import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "@/lib/api/appointments/mutations";
import { 
  appointmentIdSchema,
  insertAppointmentParams,
  updateAppointmentParams 
} from "@/lib/db/schema/appointments";
import { bookAppointment } from "@/lib/api/appointments";

export async function POST(req: Request) {
  try {
    const res = await bookAppointment(await req.json());
    return NextResponse.json(res, { status: 200 });
  } catch (err: any) {
    if (err.cause === "INVALID_OPTIONS") 
      return NextResponse.json({ error: "Invalid options" }, { status: 400 });

    return NextResponse.json(err, { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const validatedData = updateAppointmentParams.parse(await req.json());
    const validatedParams = appointmentIdSchema.parse({ id });

    const { appointment } = await updateAppointment(validatedParams.id, validatedData);

    return NextResponse.json(appointment, { status: 200 });
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

    const validatedParams = appointmentIdSchema.parse({ id });
    const { appointment } = await deleteAppointment(validatedParams.id);

    return NextResponse.json(appointment, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}



// async function 