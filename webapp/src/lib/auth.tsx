"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { authApi, type UserMeResponse } from "./api";

interface AuthContextType {
  token: string | null;
  role: string | null;
  user: UserMeResponse | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ role: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data);
    } catch {
      // Token inválido ou expirado
      setUser(null);
    }
  }, []);

  // Carrega sessão do cookie ao montar
  useEffect(() => {
    const savedToken = Cookies.get("token");
    const savedRole = Cookies.get("role");
    if (savedToken) {
      setToken(savedToken);
      setRole(savedRole || null);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, senha: string) => {
    const res = await authApi.login(email, senha);
    const { token: t, role: r } = res.data;

    Cookies.set("token", t, { expires: 7, sameSite: "lax" });
    Cookies.set("role", r, { expires: 7, sameSite: "lax" });

    setToken(t);
    setRole(r);

    // Busca dados do usuário após login
    try {
      const me = await authApi.getMe();
      setUser(me.data);
    } catch {}

    return { role: r };
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    setToken(null);
    setRole(null);
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ token, role, user, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

// Hook para proteger rotas (redireciona se não autenticado)
export function useRequireAuth(requiredRole?: "ADMIN" | "USER") {
  const { token, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!token) {
      window.location.href = "/";
      return;
    }
    if (requiredRole && role !== requiredRole) {
      window.location.href = role === "ADMIN" ? "/admin" : "/app";
    }
  }, [token, role, loading, requiredRole]);

  return { token, role, loading };
}
