import assert from "node:assert/strict";
import test from "node:test";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

test("page media policy permits the actual SDK-generated storage URL without allowing all R2 accounts", async () => {
  const account = "1".repeat(32), bucket = "halaldl-test-bucket";
  process.env.R2_ACCOUNT_ID = account;
  process.env.R2_BUCKET = bucket;
  const { default: config } = await import("../next.config.ts");
  const rules = await config.headers!();
  const csp = rules[0].headers.find(h => h.key === "Content-Security-Policy")!.value;
  const sources = csp.split(";").map(s => s.trim()).find(s => s.startsWith("media-src "))!.split(" ").slice(1);
  const client = new S3Client({ region: "auto", endpoint: `https://${account}.r2.cloudflarestorage.com`, credentials: { accessKeyId: "test-access", secretAccessKey: "test-secret" } });
  try {
    const link = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: "fetch/test", ResponseContentDisposition: "inline" }), { expiresIn: 60 });
    assert.ok(sources.includes(new URL(link).origin));
    assert.deepEqual(sources, ["'self'", `https://${account}.r2.cloudflarestorage.com`, `https://${bucket}.${account}.r2.cloudflarestorage.com`]);
  } finally { client.destroy(); }
});
