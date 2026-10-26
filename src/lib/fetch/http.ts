import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signValue, unsignValue } from "@/lib/fetch/crypto";
import { InputError } from "./policy";
import { SERVER_LIMITS } from "@/lib/fetch/limits";
import { isIP } from "node:net";

export const SESSION_COOKIE = "hdl_fetch_session";
export const GATE_COOKIE = "hdl_fetch_gate";
export const OAUTH_COOKIE = "hdl_fetch_oauth";

export class FetchError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof FetchError || error instanceof InputError) {
    return NextResponse.json({ error: error.code, message: error.message }, { status: error.status });
  }
  console.error("Fetch request failed", error instanceof Error ? error.name : "unknown");
  return NextResponse.json({ error: "server", message: "Something went wrong." }, { status: 500 });
}

export function clientIp(request: Request) {
  const trusted = process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : process.env.FETCH_TRUSTED_IP_HEADER;
  const value = trusted ? request.headers.get(trusted)?.trim() : null;
  if (value && isIP(value)) return value;
  if (process.env.NODE_ENV === "production") throw new FetchError(503, "source_unavailable", "The connection check is unavailable. Please try again later.");
  return null;
}

export async function readJsonObject(request: Request, maxBytes = 8192): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new InputError("body", "Send a JSON request.");
  const reader = request.body?.getReader();
  if (!reader) throw new InputError("body", "The request is empty.");
  let size = 0;
  let timedOut = false;
  const deadline = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}); }, 10_000);
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new InputError("body", "The request is too large.", 413); }
      chunks.push(value);
    }
    if (timedOut) throw new InputError("body_timeout", "The request took too long.", 408);
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof InputError) throw error;
    throw new InputError("body", "The request is not valid JSON.");
  } finally { clearTimeout(deadline); reader.releaseLock(); }
}

function cookieSuffix(maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function setSignedCookie(response: NextResponse, name: string, value: string, maxAge: number) {
  response.cookies.set(name, signValue(value), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function readSignedCookie(name: string) {
  const store = await cookies();
  const raw = store.get(name)?.value;
  if (!raw) return null;
  return unsignValue(raw);
}

export function gateCookieValue() {
  return String(Date.now() + SERVER_LIMITS.gateTtlMs);
}

export function gateIsValid(value: string | null) {
  if (!value) return false;
  const exp = Number(value);
  return Number.isFinite(exp) && exp > Date.now();
}

export { cookieSuffix };
