import { query, queryOne } from "@/lib/db";

export interface PublicReview {
  id: string;
  name: string;
  initials: string;
  rating: number;
  text: string | null;
  service: string | null;
  date: string;
}

function initials(name: string | null, phone: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  return phone.slice(-4, -2); // fallback from phone
}

function maskName(name: string | null): string {
  if (!name) return "Клиент";
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const lastInitial = parts[1] ? ` ${parts[1][0]}.` : "";
  return `${first}${lastInitial}`;
}

export async function getReviewStats(): Promise<{ avg: number; count: number }> {
  const row = await queryOne<{ avg: string | null; count: number }>(
    "SELECT AVG(rating)::numeric(3,1) AS avg, count(*)::int AS count FROM reviews"
  );
  return { avg: row?.avg ? Number(row.avg) : 0, count: row?.count ?? 0 };
}

export async function getPublicReviews(limit = 12): Promise<PublicReview[]> {
  const rows = await query<{
    id: string; rating: number; text: string | null; service: string | null;
    created_at: string; name: string | null; phone: string;
  }>(
    `SELECT r.id, r.rating, r.text, r.service, r.created_at, u.name, u.phone
       FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.text IS NOT NULL AND length(trim(r.text)) > 0
      ORDER BY r.created_at DESC
      LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({
    id: r.id,
    name: maskName(r.name),
    initials: initials(r.name, r.phone).toUpperCase(),
    rating: r.rating,
    text: r.text,
    service: r.service,
    date: r.created_at,
  }));
}
