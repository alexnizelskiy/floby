/**
 * Before/after gallery — data access.
 * Rows are created by executors (pending) or staff (published), curated in the
 * admin panel, and the published ones are shown on the homepage.
 *
 * Server-only.
 */
import { query } from "@/lib/db";
import { newId } from "@/lib/auth";

export interface GalleryItem {
  id: string;
  before_url: string;
  after_url: string;
  title: string | null;
  cleaning_type: string | null;
  published: boolean;
  created_at: string;
}

const COLUMNS =
  "id, before_url, after_url, title, cleaning_type, published, created_at";

export async function getPublishedGallery(limit = 12): Promise<GalleryItem[]> {
  return query<GalleryItem>(
    `SELECT ${COLUMNS} FROM gallery WHERE published = true ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
}

export async function getAllGallery(limit = 200): Promise<GalleryItem[]> {
  return query<GalleryItem>(
    `SELECT ${COLUMNS} FROM gallery ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
}

export async function createGalleryItem(input: {
  beforeUrl: string;
  afterUrl: string;
  title?: string | null;
  cleaningType?: string | null;
  bookingId?: string | null;
  createdBy?: string | null;
  published?: boolean;
}): Promise<string> {
  const id = newId();
  await query(
    `INSERT INTO gallery (id, booking_id, before_url, after_url, title, cleaning_type, published, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      input.bookingId ?? null,
      input.beforeUrl,
      input.afterUrl,
      input.title ?? null,
      input.cleaningType ?? null,
      input.published ?? false,
      input.createdBy ?? null,
    ]
  );
  return id;
}

export async function setGalleryPublished(id: string, published: boolean): Promise<void> {
  await query("UPDATE gallery SET published = $1 WHERE id = $2", [published, id]);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await query("DELETE FROM gallery WHERE id = $1", [id]);
}
