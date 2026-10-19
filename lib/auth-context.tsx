"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  ApiEnvelope,
  NAME_KEY,
  TOKEN_KEY,
  apiFetch,
} from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  profile?: {
    fitnessGoal?: string | null;
    weightKg?: number | null;
    heightCm?: number | null;
  } | null;
  streak?: {
    currentStreak: number;
    longestStreak: number;
    totalXP: number;
  } | null;
}

interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const data = await apiFetch<ApiEnvelope<AuthUser>>("/api/auth/me");
    setUser(data.data);
    localStorage.setItem(NAME_KEY, data.data.name ?? "");
  }, []);

  // Restore the session on mount when a token exists.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(NAME_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [fetchMe]);

  const persistAndLoad = useCallback(
    async (payload: ApiEnvelope<AuthResponse>) => {
      localStorage.setItem(TOKEN_KEY, payload.data.token);
      localStorage.setItem(NAME_KEY, payload.data.user.name);
      await fetchMe();
    },
    [fetchMe],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const payload = await apiFetch<ApiEnvelope<AuthResponse>>(
        "/api/auth/login",
        { method: "POST", body: { email, password } },
      );
      await persistAndLoad(payload);
    },
    [persistAndLoad],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const payload = await apiFetch<ApiEnvelope<AuthResponse>>(
        "/api/auth/register",
        { method: "POST", body: { name, email, password } },
      );
      await persistAndLoad(payload);
    },
    [persistAndLoad],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  const refresh = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
