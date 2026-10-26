import { NextResponse } from "next/server";
import { clientIp, jsonError, readJsonObject, readSignedCookie, SESSION_COOKIE } from "@/lib/fetch/http";
import { confirmDownload } from "@/lib/fetch/service";
import { InputError } from "@/lib/fetch/policy";
import { verifyTurnstile } from "@/lib/fetch/turnstile";

export async function POST(request: Request) {
  try {
    const sessionId = await readSignedCookie(SESSION_COOKIE);
    if (!sessionId) return NextResponse.json({ error: "session", message: "Paste the link again." }, { status: 401 });
    const body = await readJsonObject(request);
    if (typeof body.token !== "string" || typeof body.jobId !== "string" || typeof body.formatId !== "string") throw new InputError("body", "Choose a download option.");
    const turnstile = await verifyTurnstile(body.token ?? "", clientIp(request));
    if (!turnstile.ok) return NextResponse.json({ error: "turnstile", message: turnstile.message }, { status: 400 });
    return NextResponse.json(await confirmDownload(sessionId, body.jobId ?? "", body.formatId ?? ""));
  } catch (error) {
    return jsonError(error);
  }
}
