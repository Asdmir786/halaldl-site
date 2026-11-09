import { NextResponse } from "next/server";
import { createSession } from "@/lib/fetch/service";
import { clientIp, gateCookieValue, jsonError, readJsonObject, readSignedCookie, SESSION_COOKIE, setSignedCookie, GATE_COOKIE } from "@/lib/fetch/http";
import { SERVER_LIMITS } from "@/lib/fetch/limits";
import { ensureClearance } from "@/lib/fetch/turnstile";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    // Existing verified clearance is valid here too. Establish the session in
    // its own response before a slower probe can commit a recoverable job.
    await ensureClearance(body.token, clientIp(request));
    let sessionId = await readSignedCookie(SESSION_COOKIE);
    if (!sessionId) sessionId = await createSession();
    const response = NextResponse.json({ ok: true });
    setSignedCookie(response, GATE_COOKIE, gateCookieValue(), SERVER_LIMITS.gateTtlMs / 1000);
    setSignedCookie(response, SESSION_COOKIE, sessionId, 30 * 24 * 60 * 60);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
