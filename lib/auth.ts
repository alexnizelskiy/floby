import { cookies } from "next/headers";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { query, queryOne } from "@/lib/db";

const COOKIE = "floby_session";
const SESSION_DAYS = 30;

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
}

/** Normalize RU phone to +7XXXXXXXXXX. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.length === 11 && (d[0] === "8" || d[0] === "7")) d = "7" + d.slice(1);
  else if (d.length === 10) d = "7" + d;
  if (d.length !== 11 || d[0] !== "7") return null;
  return "+" + d;
}

export function hashCode(phone: string, code: string): string {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export function newId(): string {
  return randomUUID();
}

/** Create a session for a user and set the cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
    [token, userId, expires.toISOString()]
  );
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await query("DELETE FROM sessions WHERE token = $1", [token]);
  store.delete(COOKIE);
}

/** Current logged-in user (or null). */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const row = await queryOne<User & { expires_at: string }>(
    `SELECT u.id, u.phone, u.name, u.email, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = $1`,
    [token]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await query("DELETE FROM sessions WHERE token = $1", [token]);
    return null;
  }
  return { id: row.id, phone: row.phone, name: row.name, email: row.email };
}

/** Find or create a user by phone. */
export async function upsertUserByPhone(phone: string): Promise<User> {
  const existing = await queryOne<User>(
    "SELECT id, phone, name, email FROM users WHERE phone = $1",
    [phone]
  );
  if (existing) return existing;
  const id = newId();
  await query("INSERT INTO users (id, phone) VALUES ($1, $2)", [id, phone]);
  return { id, phone, name: null, email: null };
}
