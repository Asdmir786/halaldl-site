import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/fetch/http";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/account", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
