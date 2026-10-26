import { NextResponse } from "next/server";
import { jsonError, OAUTH_COOKIE, readSignedCookie, SESSION_COOKIE, setSignedCookie } from "@/lib/fetch/http";
import { upsertGoogleUser } from "@/lib/fetch/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const expected = await readSignedCookie(OAUTH_COOKIE);
    if (!code || !state || !expected || state !== expected) {
      return NextResponse.redirect(new URL("/account?error=state", url.origin));
    }
    const clientId = process.env.AUTH_GOOGLE_ID?.trim();
    const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
    if (!clientId || !clientSecret) return NextResponse.redirect(new URL("/account?error=config", url.origin));

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${url.origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResponse.ok) return NextResponse.redirect(new URL("/account?error=token", url.origin));
    const token = (await tokenResponse.json()) as { access_token?: string };
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    if (!profileResponse.ok) return NextResponse.redirect(new URL("/account?error=profile", url.origin));
    const profile = (await profileResponse.json()) as { sub?: string; email?: string; name?: string };
    const sub = profile.sub;
    if (!sub) return NextResponse.redirect(new URL("/account?error=profile", url.origin));

    const sessionId = await upsertGoogleUser({ sub, email: profile.email, name: profile.name }, await readSignedCookie(SESSION_COOKIE));
    const response = NextResponse.redirect(new URL("/account", url.origin));
    setSignedCookie(response, SESSION_COOKIE, sessionId, 30 * 24 * 60 * 60);
    response.cookies.set(OAUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
