import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/client";
import type { PublicUser } from "../types";

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: PublicUser }>("/api/auth/me");
      setUser(data.user);
    } catch {
      await setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: PublicUser }>("/api/auth/login", {
      email,
      password,
    });
    await setAuthToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data } = await api.post<{ token: string; user: PublicUser }>("/api/auth/register", {
      email,
      password,
      name,
      role: "agent",
    });
    await setAuthToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
