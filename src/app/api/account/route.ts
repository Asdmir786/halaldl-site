import { NextResponse } from "next/server";
import { jsonError, readSignedCookie, SESSION_COOKIE } from "@/lib/fetch/http";
import { accountSnapshot } from "@/lib/fetch/service";

export async function GET() {
  try {
    return NextResponse.json(await accountSnapshot(await readSignedCookie(SESSION_COOKIE)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST() {
  return NextResponse.json({ error: "retired", message: "Cookie and proxy uploads are no longer available." }, { status: 410 });
}
