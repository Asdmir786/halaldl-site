import { NextResponse } from "next/server";
import { authenticateWorker, flagJob } from "@/lib/fetch/service";
import { jsonError, readJsonObject } from "@/lib/fetch/http";
import { InputError } from "@/lib/fetch/policy";

export async function POST(request: Request) {
  try {
    authenticateWorker(request);
    const body = await readJsonObject(request);
    if (typeof body.id !== "string") throw new InputError("job", "A download ID is required.");
    await flagJob(request, body.id);
    return NextResponse.json({ ok: true });
  } catch (error) { return jsonError(error); }
}
