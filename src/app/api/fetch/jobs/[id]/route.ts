import { NextResponse } from "next/server";
import { jsonError, readSignedCookie, SESSION_COOKIE } from "@/lib/fetch/http";
import { downloadLink, jobForSession } from "@/lib/fetch/service";

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

export async function POST(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const sessionId = await readSignedCookie(SESSION_COOKIE);
    if (!sessionId) return NextResponse.json({ error: "session", message: "Complete the page check first." }, { status: 401 });
    return NextResponse.json(await downloadLink(sessionId, id));
  } catch (error) {
    return jsonError(error);
  }
}
