"use client";

import { useEffect, useState } from "react";
import { authApi, type UserMeResponse } from "@/lib/api";
import Cookies from "js-cookie";
import { User, Mail, Coins, Shield, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getMe()
      .then((r) => setUser(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="glass rounded-2xl h-32 animate-pulse" />
        <div className="glass rounded-2xl h-20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-3xl bg-orange/10 border-2 border-orange/25 flex items-center justify-center mx-auto mb-4">
          <User size={36} className="text-orange" />
        </div>
        <h1 className="text-2xl font-black text-white">{user?.nome || "—"}</h1>
        <p className="text-white/40 text-sm mt-1">{user?.email}</p>

        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mt-3 ${
          user?.role === "ROLE_ADMIN" || user?.role === "ADMIN"
            ? "bg-orange/10 border border-orange/20"
            : "bg-blue-500/10 border border-blue-500/20"
        }`}>
          <Shield size={12} className={user?.role?.includes("ADMIN") ? "text-orange" : "text-blue-400"} />
          <span className={`text-xs font-bold ${user?.role?.includes("ADMIN") ? "text-orange" : "text-blue-400"}`}>
            {user?.role?.includes("ADMIN") ? "Administrador" : "Usuário"}
          </span>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <Mail size={18} className="text-white/30 mb-2" />
          <p className="text-white/40 text-xs mb-1">E-mail</p>
          <p className="text-white text-sm font-semibold truncate">{user?.email || "—"}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <Coins size={18} className="text-orange/70 mb-2" />
          <p className="text-white/40 text-xs mb-1">Créditos</p>
          <p className="text-white text-lg font-black">
            {user?.creditos?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "R$ 0,00"}
          </p>
        </div>
      </div>

      {/* Seções futuras placeholder */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-3 orange-line">Histórico de Pontos</h3>
        <p className="text-white/25 text-xs text-center py-4">Em breve: gráfico de evolução de pontos</p>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </div>
  );
}
