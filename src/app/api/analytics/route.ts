import crypto from "node:crypto";
import { userAgent } from "next/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ensureAnalyticsSchema, getSql, isAnalyticsEnabled } from "@/lib/analytics-db";

const VISITOR_COOKIE = "halaldl_visitor";
const SESSION_COOKIE = "halaldl_session";
const SESSION_TTL_SECONDS = 60 * 30;
const VISITOR_TTL_SECONDS = 60 * 60 * 24 * 365;

type AnalyticsRequestBody = {
  data?: Record<string, string>;
  eventName?: string;
  eventType?: "cta_click" | "command_copy" | "page_view" | "section_view";
  pagePath?: string;
  referrer?: string;
};

function getOrCreateCookieValue(value: string | undefined) {
  return value ?? crypto.randomUUID();
}

function getSourceHost(referrer: string | undefined) {
  if (!referrer) {
    return null;
  }

  try {
    return new URL(referrer).host;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!isAnalyticsEnabled()) {
    return NextResponse.json({ tracked: false, reason: "analytics-disabled" }, { status: 202 });
  }

  const body = (await request.json().catch(() => null)) as AnalyticsRequestBody | null;
  if (!body?.eventName || !body?.eventType) {
    return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
  }

  await ensureAnalyticsSchema();

  const sql = getSql();
  const ua = userAgent(request);
  const cookieVisitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const cookieSession = request.cookies.get(SESSION_COOKIE)?.value;
  const visitorId = getOrCreateCookieValue(cookieVisitor);
  const sessionId = getOrCreateCookieValue(cookieSession);
  const response = NextResponse.json({ tracked: true }, { status: 202 });
  const metadata = body.data ?? {};

  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VISITOR_TTL_SECONDS,
  });
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  await sql`
    insert into analytics_events (
      event_type,
      event_name,
      page_path,
      referrer,
      source_host,
      visitor_id,
      session_id,
      country,
      device_type,
      browser,
      os,
      cta,
      section,
      command,
      metadata
    ) values (
      ${body.eventType},
      ${body.eventName},
      ${body.pagePath ?? null},
      ${body.referrer ?? null},
      ${getSourceHost(body.referrer)},
      ${visitorId},
      ${sessionId},
      ${request.headers.get("x-vercel-ip-country") ?? null},
      ${ua.device.type ?? "desktop"},
      ${ua.browser.name ?? null},
      ${ua.os.name ?? null},
      ${metadata.cta ?? null},
      ${metadata.section ?? null},
      ${metadata.command ?? null},
      ${sql.json(metadata)}
    )
  `;

  return response;
}
