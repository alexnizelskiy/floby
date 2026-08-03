"use client";

import * as React from "react";

export interface AuthUser {
  id: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  role: string;
  avatar: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return React.useContext(AuthContext);
}

/**
 * Role-derived flags for the UI. Guests and clients may order a cleaning;
 * staff and executors are routed to their work panel instead.
 */
export function useRoleFlags() {
  const { user, loading } = useAuth();
  const role = user?.role ?? null;
  const isStaff = role === "admin" || role === "manager";
  const isExecutor = role === "executor";
  const canOrder = !user || role === "client";
  const dashboardPath = isStaff ? "/admin" : isExecutor ? "/profile" : null;
  return { role, isStaff, isExecutor, canOrder, dashboardPath, loading };
}

/**
 * App-wide auth state. Fetches /api/auth/me once and shares the user with the
 * header, hero and calculator so they can switch between logged-in / guest UI.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const data = await fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json());
      setUser((data?.user as AuthUser) ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
