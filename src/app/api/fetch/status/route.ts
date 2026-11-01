import { NextResponse } from "next/server";
import { hasClearance, jsonError, readSignedCookie, SESSION_COOKIE } from "@/lib/fetch/http";
import { browserStatus, sessionJobId } from "@/lib/fetch/service";

export async function GET() {
  try {
    const [status, sessionId, cleared] = await Promise.all([
      browserStatus(),
      readSignedCookie(SESSION_COOKIE),
      hasClearance(),
    ]);
    return NextResponse.json({ ...status, cleared, jobId: await sessionJobId(sessionId) });
  } catch (error) {
    return jsonError(error);
  }
}
