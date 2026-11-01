import { NextResponse } from "next/server";
import { clientIp, grantClearance, jsonError, readJsonObject, readSignedCookie, SESSION_COOKIE, setSignedCookie } from "@/lib/fetch/http";
import { createSession, probeUrl, throttleSource } from "@/lib/fetch/service";
import { assertPublicRequest, InputError } from "@/lib/fetch/policy";
import { ensureClearance } from "@/lib/fetch/turnstile";

export async function POST(request: Request) {
  let grant = false;
  try {
    const body = await readJsonObject(request);
    assertPublicRequest(body.privatePost);
    if (typeof body.url !== "string" || typeof body.rights !== "boolean") throw new InputError("body", "Enter a link and confirm your right to download it.");
    const ip = clientIp(request);
    grant = await ensureClearance(body.token, ip);
    await throttleSource(ip);
    let sessionId = await readSignedCookie(SESSION_COOKIE);
    const created = !sessionId;
    if (!sessionId) sessionId = await createSession();
    const job = await probeUrl(sessionId, body.url, body.rights, false, ip);
    const response = NextResponse.json(job);
    if (created) setSignedCookie(response, SESSION_COOKIE, sessionId, 30 * 24 * 60 * 60);
    if (grant) grantClearance(response);
    return response;
  } catch (error) {
    const response = jsonError(error);
    if (grant) grantClearance(response);
    return response;
  }
}
