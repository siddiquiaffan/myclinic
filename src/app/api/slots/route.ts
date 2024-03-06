import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createSlot,
  deleteSlot,
  updateSlot,
} from "@/lib/api/slots/mutations";
import { 
  slotIdSchema,
  insertSlotParams,
  updateSlotParams 
} from "@/lib/db/schema/slots";

export async function POST(req: Request) {
  try {
    const validatedData = insertSlotParams.parse(await req.json());
    const { slot } = await createSlot(validatedData);

    revalidatePath("/slots"); // optional - assumes you will have named route same as entity

    return NextResponse.json(slot, { status: 201 });
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

    const validatedData = updateSlotParams.parse(await req.json());
    const validatedParams = slotIdSchema.parse({ id });

    const { slot } = await updateSlot(validatedParams.id, validatedData);

    return NextResponse.json(slot, { status: 200 });
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

    const validatedParams = slotIdSchema.parse({ id });
    const { slot } = await deleteSlot(validatedParams.id);

    return NextResponse.json(slot, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

/*

*/