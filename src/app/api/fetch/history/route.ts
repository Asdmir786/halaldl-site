import { NextResponse } from "next/server";
import { jsonError, readSignedCookie, SESSION_COOKIE } from "@/lib/fetch/http";
import { recentJobs } from "@/lib/fetch/service";

export async function GET() {
  try { return NextResponse.json({ jobs: await recentJobs(await readSignedCookie(SESSION_COOKIE)) }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch (error) { return jsonError(error); }
}
