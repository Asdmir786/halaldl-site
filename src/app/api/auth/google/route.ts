import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { OAUTH_COOKIE, setSignedCookie } from "@/lib/fetch/http";

export async function GET(request: Request) {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  if (!clientId) return NextResponse.json({ error: "auth", message: "Google sign-in is not configured." }, { status: 503 });
  const state = randomUUID();
  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  setSignedCookie(response, OAUTH_COOKIE, state, 10 * 60);
  return response;
}
