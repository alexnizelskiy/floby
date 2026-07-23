/**
 * Unified Postgres access.
 * - Prod: real Postgres via `pg` when DATABASE_URL is set.
 * - Dev:  embedded Postgres (PGlite) persisted to `.pglite/` — zero setup,
 *   same SQL ($1 placeholders), so switching to prod is only a driver swap.
 *
 * Server-only: never import from Client Components.
 */

type QueryResult<T> = { rows: T[] };
interface Client {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'searching',
  total INT NOT NULL DEFAULT 0,
  paid BOOLEAN NOT NULL DEFAULT false,
  payment_id TEXT,
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bonus_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  booking_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  value INT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  max_uses INT NOT NULL DEFAULT 0,
  used_count INT NOT NULL DEFAULT 0,
  min_order INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- idempotent migrations for existing databases
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_balance INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ref_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_credited BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS users_ref_code_idx ON users(ref_code);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bonus_used INT NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_discount INT NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_spawned BOOLEAN NOT NULL DEFAULT false;
`;

// Prepared statements can't run multiple commands at once — split & run each.
async function ensureSchema(client: Client) {
  for (const stmt of SCHEMA.split(";")) {
    const sql = stmt.trim();
    if (sql) await client.query(sql);
  }
}

// Cache across Next.js hot reloads
const g = globalThis as unknown as { __flobyDb?: Promise<Client> };

async function createClient(): Promise<Client> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url });
    const client: Client = {
      query: (text, params) => pool.query(text, params as unknown[]) as never,
    };
    await ensureSchema(client);
    return client;
  }

  // No DATABASE_URL: only allowed outside production (embedded Postgres has no
  // persistent storage on serverless hosts like Vercel).
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is required in production. Set it to a real Postgres (e.g. Neon)."
    );
  }

  // Dev: embedded Postgres
  const { PGlite } = await import("@electric-sql/pglite");
  const pg = new PGlite(".pglite");
  const client: Client = {
    query: (text, params) => pg.query(text, params) as never,
  };
  await ensureSchema(client);
  return client;
}

export function db(): Promise<Client> {
  if (!g.__flobyDb) {
    g.__flobyDb = createClient().catch((err) => {
      g.__flobyDb = undefined; // don't cache a failed init — allow retry
      throw err;
    });
  }
  return g.__flobyDb;
}

/** Convenience: run a query and get rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = await db();
  const res = await client.query<T>(text, params);
  return res.rows;
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
