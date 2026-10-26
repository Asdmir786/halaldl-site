import { NextResponse } from "next/server";
import { createSession } from "@/lib/fetch/service";
import { clientIp, gateCookieValue, jsonError, readSignedCookie, SESSION_COOKIE, setSignedCookie, GATE_COOKIE } from "@/lib/fetch/http";
import { SERVER_LIMITS } from "@/lib/fetch/limits";
import { verifyTurnstile } from "@/lib/fetch/turnstile";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const turnstile = await verifyTurnstile(body.token ?? "", clientIp(request));
    if (!turnstile.ok) return NextResponse.json({ error: "turnstile", message: turnstile.message }, { status: 400 });
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
