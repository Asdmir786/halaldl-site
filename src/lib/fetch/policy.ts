export type Owner = { session_id: string; user_id: string | null };
const HOSTED_PLATFORMS = ["youtube", "instagram", "tiktok", "facebook", "x", "reddit", "vimeo", "dailymotion", "soundcloud"];

export function hostedPlatforms() {
  return [...HOSTED_PLATFORMS];
}

export function ownsJob(job: Owner, session: { id: string; user_id: string | null }) {
  return job.session_id === session.id || (session.user_id !== null && job.user_id === session.user_id);
}

export function effectiveTier(userId: string | null): "anonymous" | "free" {
  return userId ? "free" : "anonymous";
}

export class InputError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function assertPublicRequest(privatePost: unknown) {
  if (privatePost !== undefined && privatePost !== false) {
    throw new InputError("public_only", "Only supported public links are available.");
  }
}

export function assertJobId(id: string) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) throw new InputError("job", "That download ID is invalid.");
}
