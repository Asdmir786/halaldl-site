import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) throw new Error("AUTH_SECRET is not set.");
  return value;
}

export function signValue(value: string) {
  const mac = createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${mac}`;
}

export function unsignValue(token: string) {
  const split = token.lastIndexOf(".");
  if (split <= 0) return null;
  const value = token.slice(0, split);
  const mac = token.slice(split + 1);
  const expected = createHmac("sha256", secret()).update(value).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return value;
}

export function hashClient(ip: string) {
  return createHmac("sha256", secret()).update(`fetch-source:${ip}`).digest("hex");
}
