import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "stream";

let r2Client: S3Client | null = null;

function getEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function isR2Configured() {
  return Boolean(
    getEnv("R2_ACCOUNT_ID") &&
    getEnv("R2_ACCESS_KEY_ID") &&
    getEnv("R2_SECRET_ACCESS_KEY") &&
    getEnv("R2_BUCKET_NAME")
  );
}

function getR2Client() {
  if (!isR2Configured()) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${getEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: getEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: getEnv("R2_SECRET_ACCESS_KEY")
      }
    });
  }

  return r2Client;
}

export async function uploadR2Object({
  key,
  body,
  contentType,
  cacheControl = "private, max-age=31536000, immutable"
}: {
  key: string;
  body: Buffer | Uint8Array | string | Readable;
  contentType: string;
  cacheControl?: string;
}) {
  await getR2Client().send(new PutObjectCommand({
    Bucket: getEnv("R2_BUCKET_NAME"),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl
  }));
}

export async function createSignedR2DownloadUrl(key: string, filename?: string, expiresIn = 300) {
  const command = new GetObjectCommand({
    Bucket: getEnv("R2_BUCKET_NAME"),
    Key: key,
    ResponseContentDisposition: filename ? `attachment; filename="${filename.replace(/"/g, "")}"` : undefined
  });

  return getSignedUrl(getR2Client(), command, { expiresIn });
}

export async function createSignedR2ViewUrl(key: string, expiresIn = 300) {
  const command = new GetObjectCommand({
    Bucket: getEnv("R2_BUCKET_NAME"),
    Key: key
  });

  return getSignedUrl(getR2Client(), command, { expiresIn });
}

export async function getR2Object(key: string) {
  return getR2Client().send(new GetObjectCommand({
    Bucket: getEnv("R2_BUCKET_NAME"),
    Key: key
  }));
}

export async function listR2ObjectsByPrefix(prefix: string) {
  if (!prefix || prefix === "/") {
    throw new Error("Refusing to list R2 objects without a specific prefix.");
  }

  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await getR2Client().send(new ListObjectsV2Command({
      Bucket: getEnv("R2_BUCKET_NAME"),
      Prefix: prefix,
      ContinuationToken: continuationToken
    }));

    for (const object of response.Contents || []) {
      if (object.Key) keys.push(object.Key);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

export async function deleteR2Objects(keys: string[]) {
  if (!keys.length) return 0;

  let deleted = 0;
  for (let index = 0; index < keys.length; index += 1000) {
    const batch = keys.slice(index, index + 1000);
    const response = await getR2Client().send(new DeleteObjectsCommand({
      Bucket: getEnv("R2_BUCKET_NAME"),
      Delete: {
        Objects: batch.map((key) => ({ Key: key })),
        Quiet: true
      }
    }));

    deleted += batch.length - (response.Errors?.length || 0);
  }

  return deleted;
}
