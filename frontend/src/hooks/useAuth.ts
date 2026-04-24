"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, clearToken, isAuthenticated } from "@/lib/api";
import type { User, Token } from "@/types/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    api
      .get<User>("/api/v1/auth/me")
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const token = await api.post<Token>("/api/v1/auth/login", { email, password });
    setToken(token.access_token);
    const me = await api.get<User>("/api/v1/auth/me");
    setUser(me);
    router.push("/app");
  }

  async function register(email: string, password: string, full_name?: string) {
    await api.post("/api/v1/auth/register", { email, password, full_name });
    await login(email, password);
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push("/login");
  }

  return { user, loading, login, register, logout };
}
