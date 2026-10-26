import { NextResponse } from "next/server";
import { clientIp, jsonError, readJsonObject, readSignedCookie, SESSION_COOKIE, setSignedCookie } from "@/lib/fetch/http";
import { createSession, probeUrl, throttleSource } from "@/lib/fetch/service";
import { assertPublicRequest, InputError } from "@/lib/fetch/policy";
import { verifyTurnstile } from "@/lib/fetch/turnstile";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    assertPublicRequest(body.privatePost);
    if (typeof body.url !== "string" || typeof body.token !== "string" || typeof body.rights !== "boolean") throw new InputError("body", "Enter a link and confirm your right to download it.");
    const ip = clientIp(request);
    const turnstile = await verifyTurnstile(body.token, ip);
    if (!turnstile.ok) return NextResponse.json({ error: "turnstile", message: turnstile.message }, { status: 400 });
    await throttleSource(ip);
    let sessionId = await readSignedCookie(SESSION_COOKIE);
    const created = !sessionId;
    if (!sessionId) sessionId = await createSession();
    const job = await probeUrl(sessionId, body.url, body.rights, false, ip);
    const response = NextResponse.json(job);
    if (created) setSignedCookie(response, SESSION_COOKIE, sessionId, 30 * 24 * 60 * 60);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
