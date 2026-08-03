/**
 * Image storage abstraction.
 * - Prod: Vercel Blob when BLOB_READ_WRITE_TOKEN is set (public URLs, CDN-backed).
 * - Dev:  writes under public/uploads/ (gitignored) so the feature works with
 *         zero external setup. Serverless hosts have an ephemeral/read-only FS,
 *         so in production a Blob token is required.
 *
 * Server-only.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export class StorageError extends Error {}

/** Persist an uploaded image and return its public URL. */
export async function saveImage(file: File, prefix = "gallery"): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new StorageError("unsupported_type");
  if (file.size > MAX_BYTES) throw new StorageError("too_large");

  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const { put } = await import("@vercel/blob");
    const { url } = await put(key, file, {
      access: "public",
      token,
      contentType: file.type,
    });
    return url;
  }

  if (process.env.NODE_ENV === "production") {
    // No Blob token in prod → nowhere durable to write.
    throw new StorageError("storage_unavailable");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const relative = path.join("uploads", key);
  const absolute = path.join(process.cwd(), "public", relative);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, buffer);
  return "/" + relative.split(path.sep).join("/");
}
