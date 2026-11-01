import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SERVER_LIMITS } from "@/lib/fetch/limits";

export function storageConfigured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET?.trim(),
  );
}

function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function presignDownload(objectKey: string, filename: string, expiresAt: Date | null, preview = false) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: objectKey,
    ResponseContentDisposition: `${preview ? "inline" : "attachment"}; filename="${filename.replace(/[^A-Za-z0-9._-]+/g, "_")}"`,
    ...(preview ? { ResponseContentType: ({ mp4: "video/mp4", m4v: "video/mp4", mov: "video/quicktime", webm: "video/webm", m4a: "audio/mp4", mp3: "audio/mpeg", opus: "audio/ogg", ogg: "audio/ogg", aac: "audio/aac", wav: "audio/wav", flac: "audio/flac", mkv: "video/x-matroska" } as Record<string, string>)[filename.split(".").at(-1)!] ?? "application/octet-stream" } : {}),
  });
  const seconds = expiresAt ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000) : 0;
  if (seconds < 1) throw new Error("File expired");
  return getSignedUrl(client(), command, { expiresIn: Math.min(SERVER_LIMITS.linkTtlSeconds, seconds) });
}

export async function deleteMediaObject(key: string) {
  if (!/^fetch\/[a-f0-9-]+$/.test(key)) throw new Error("Invalid media object key");
  await client().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }), { abortSignal: AbortSignal.timeout(8000) });
}
