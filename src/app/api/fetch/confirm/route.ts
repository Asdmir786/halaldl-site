import { queueWorkerWake } from "@/lib/fetch/wake-after";
import { NextResponse } from "next/server";
import { clientIp, grantClearance, jsonError, readJsonObject, readSignedCookie, SESSION_COOKIE } from "@/lib/fetch/http";
import { confirmDownload } from "@/lib/fetch/service";
import { InputError } from "@/lib/fetch/policy";
import { ensureClearance } from "@/lib/fetch/turnstile";

export async function POST(request: Request) {
  let grant = false;
  try {
    const sessionId = await readSignedCookie(SESSION_COOKIE);
    if (!sessionId) return NextResponse.json({ error: "session", message: "Paste the link again." }, { status: 401 });
    const body = await readJsonObject(request);
    if (typeof body.jobId !== "string" || typeof body.formatId !== "string") throw new InputError("body", "Choose a download option.");
    grant = await ensureClearance(body.token, clientIp(request));
    const response = NextResponse.json(await confirmDownload(sessionId, body.jobId, body.formatId, queueWorkerWake));
    if (grant) grantClearance(response);
    return response;
  } catch (error) {
    const response = jsonError(error);
    if (grant) grantClearance(response);
    return response;
  }
}
