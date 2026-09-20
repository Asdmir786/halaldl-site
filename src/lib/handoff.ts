export const MAX_HANDOFF_URL_LENGTH = 4096;

export type HandoffValidationResult =
  | { ok: true; normalizedUrl: string; deepLink: string }
  | { ok: false; error: string };

export function buildHalalDlQueueLink(input: string): HandoffValidationResult {
  const candidate = input.trim();

  if (!candidate) {
    return { ok: false, error: "Paste an HTTP or HTTPS media link first." };
  }

  if (candidate.length > MAX_HANDOFF_URL_LENGTH) {
    return {
      ok: false,
      error: `The link must be ${MAX_HANDOFF_URL_LENGTH.toLocaleString("en-US")} characters or fewer.`,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: "Enter a complete, valid web address." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only HTTP and HTTPS links can be opened in HalalDL." };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: "Links containing embedded usernames or passwords are not accepted." };
  }

  if (!parsed.hostname) {
    return { ok: false, error: "The link must include a valid hostname." };
  }

  const normalizedUrl = parsed.toString();
  return {
    ok: true,
    normalizedUrl,
    deepLink: `halaldl://download?url=${encodeURIComponent(normalizedUrl)}`,
  };
}
