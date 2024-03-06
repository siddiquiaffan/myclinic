import { NextResponse } from "next/server";
import { z } from "zod";

export function handleRestError (err: Error | unknown) {
    if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
        return NextResponse.json(err, { status: 500 });
    }
}