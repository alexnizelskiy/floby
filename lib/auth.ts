import { cookies } from "next/headers";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { query, queryOne } from "@/lib/db";

const COOKIE = "floby_session";
const SESSION_DAYS = 30;

export type Role = "client" | "executor" | "manager" | "admin";

export interface User {
  id: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  role: Role;
  avatar: string | null;
}

/** Phones that are auto-promoted to admin on login (comma-separated env). */
function adminPhones(): string[] {
  return (process.env.ADMIN_PHONES ?? "")
    .split(",")
    .map((p) => normalizePhone(p.trim()))
    .filter((p): p is string => !!p);
}

export function isStaff(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "manager";
}
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
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
  const row = await queryOne<{
    id: string; phone: string | null; name: string | null; email: string | null;
    role: Role; avatar_url: string | null; expires_at: string;
  }>(
    `SELECT u.id, u.phone, u.name, u.email, u.role, u.avatar_url, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = $1`,
    [token]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await query("DELETE FROM sessions WHERE token = $1", [token]);
    return null;
  }
  return {
    id: row.id, phone: row.phone, name: row.name, email: row.email,
    role: row.role, avatar: row.avatar_url,
  };
}

type UserRow = {
  id: string; phone: string | null; name: string | null; email: string | null;
  role: Role; avatar_url: string | null;
};
const USER_COLUMNS = "id, phone, name, email, role, avatar_url";
function rowToUser(r: UserRow): User {
  return { id: r.id, phone: r.phone, name: r.name, email: r.email, role: r.role, avatar: r.avatar_url };
}

/** Find or create a user by phone. Auto-promotes ADMIN_PHONES to admin. */
export async function upsertUserByPhone(phone: string): Promise<User> {
  const wantsAdmin = adminPhones().includes(phone);
  const existing = await queryOne<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE phone = $1`,
    [phone]
  );
  if (existing) {
    if (wantsAdmin && existing.role !== "admin") {
      await query("UPDATE users SET role = 'admin' WHERE id = $1", [existing.id]);
      existing.role = "admin";
    }
    return rowToUser(existing);
  }
  const id = newId();
  const role: Role = wantsAdmin ? "admin" : "client";
  await query("INSERT INTO users (id, phone, role) VALUES ($1, $2, $3)", [id, phone, role]);
  return { id, phone, name: null, email: null, role, avatar: null };
}

export type OAuthProvider = "vk" | "yandex";

/**
 * Find or create a user from an OAuth profile and link the provider.
 * Match order: existing provider link → same email → new account (no phone).
 */
export async function upsertUserByOAuth(input: {
  provider: OAuthProvider;
  providerId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}): Promise<{ user: User; isNew: boolean }> {
  const { provider, providerId, email, name, avatarUrl } = input;

  // 1. Already linked?
  const link = await queryOne<{ user_id: string }>(
    "SELECT user_id FROM user_oauth_providers WHERE provider = $1 AND provider_id = $2",
    [provider, providerId]
  );
  if (link) {
    if (avatarUrl) {
      await query("UPDATE users SET avatar_url = $1 WHERE id = $2 AND avatar_url IS NULL", [avatarUrl, link.user_id]);
    }
    const row = await queryOne<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [link.user_id]);
    return { user: rowToUser(row as UserRow), isNew: false };
  }

  // 2. Same email → attach provider to that account.
  let userId: string | null = null;
  let isNew = false;
  if (email) {
    const byEmail = await queryOne<{ id: string }>(
      "SELECT id FROM users WHERE lower(trim(email)) = lower(trim($1)) LIMIT 1",
      [email]
    );
    if (byEmail) userId = byEmail.id;
  }

  // 3. Otherwise create a fresh account (phone left null).
  if (!userId) {
    userId = newId();
    isNew = true;
    await query(
      "INSERT INTO users (id, phone, name, email, avatar_url, role) VALUES ($1, NULL, $2, $3, $4, 'client')",
      [userId, name, email, avatarUrl]
    );
  }

  await query(
    "INSERT INTO user_oauth_providers (id, user_id, provider, provider_id) VALUES ($1, $2, $3, $4) ON CONFLICT (provider, provider_id) DO NOTHING",
    [newId(), userId, provider, providerId]
  );

  const row = await queryOne<UserRow>(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [userId]);
  return { user: rowToUser(row as UserRow), isNew };
}
