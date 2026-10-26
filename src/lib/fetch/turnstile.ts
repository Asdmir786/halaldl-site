const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { ok: false as const, message: "Turnstile is not configured." };
  if (typeof token !== "string" || token.length > 2048 || !token.trim()) return { ok: false as const, message: "Complete the check and try again." };

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const response = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) return { ok: false as const, message: "The check could not be verified." };
  const payload = (await response.json()) as { success?: boolean };
  if (!payload.success) return { ok: false as const, message: "The check failed. Try it again." };
  return { ok: true as const };
}
