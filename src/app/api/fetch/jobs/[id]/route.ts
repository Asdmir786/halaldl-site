import { queueWorkerWake } from "@/lib/fetch/wake-after";
import { NextResponse } from "next/server";
import { clientIp, grantClearance, jsonError, readJsonObject, readSignedCookie, SESSION_COOKIE } from "@/lib/fetch/http";
import { InputError } from "@/lib/fetch/policy";
import { cancelJob, downloadLink, jobForSession, restartJob, throttleSource } from "@/lib/fetch/service";
import { ensureClearance } from "@/lib/fetch/turnstile";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const sessionId = await readSignedCookie(SESSION_COOKIE);
    if (!sessionId) return NextResponse.json({ error: "session", message: "Complete the page check first." }, { status: 401 });
    return NextResponse.json(await jobForSession(sessionId, id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const sessionId = await readSignedCookie(SESSION_COOKIE);
    if (!sessionId) return NextResponse.json({ error: "session", message: "Complete the page check first." }, { status: 401 });
    return NextResponse.json(await downloadLink(sessionId, id, new URL(request.url).searchParams.get("preview") === "1"));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const sessionId = await readSignedCookie(SESSION_COOKIE);
    if (!sessionId) return NextResponse.json({ error: "session", message: "Open this page again." }, { status: 401 });
    return NextResponse.json(await cancelJob(sessionId, (await context.params).id));
  } catch (error) { return jsonError(error); }
}

export async function PATCH(request: Request, context: Context) {
  let grant = false;
  try {
    const sessionId = await readSignedCookie(SESSION_COOKIE);
    if (!sessionId) return NextResponse.json({ error: "session", message: "Open this page again." }, { status: 401 });
    const body = await readJsonObject(request);
    if (!["retry", "change_quality"].includes(String(body.action))) throw new InputError("action", "Choose retry or change quality.");
    const ip = clientIp(request);
    grant = await ensureClearance(body.token, ip);
    await throttleSource(ip);
    const result = await restartJob(sessionId, (await context.params).id, ip, queueWorkerWake);
    const response = NextResponse.json(result);
    if (grant) grantClearance(response);
    return response;
  } catch (error) {
    const response = jsonError(error);
    if (grant) grantClearance(response);
    return response;
  }
}
