"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, ShoppingCart, Package, Zap,
  CalendarDays, Bell, Trophy, LogOut, Menu, X,
  ChevronRight, MapPin
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/comandas", label: "Comandas", icon: ShoppingCart },
  { href: "/admin/pdv", label: "PDV Rápido", icon: Zap },
  { href: "/admin/estoque", label: "Estoque", icon: Package },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/avisos", label: "Avisos / Carrossel", icon: Bell },
  { href: "/admin/ranking", label: "Ranking", icon: Trophy },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    if (!token) {
      router.replace("/");
    } else if (role !== "ROLE_ADMIN" && role !== "ADMIN") {
      router.replace("/app");
    }
  }, [router]);

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    router.replace("/");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <Image
          src="/logo.png"
          alt="Rayearth Games"
          width={40}
          height={40}
          className="rounded-xl shrink-0"
        />
        <div>
          <p className="text-white font-black text-sm">Rayearth</p>
          <p className="text-white/30 text-xs">Painel Admin</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                active
                  ? "bg-orange/15 text-orange border border-orange/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-sm font-semibold">{label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 pt-4 mt-4">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <MapPin size={14} className="text-white/20" />
          <span className="text-white/20 text-xs truncate">Filial selecionada</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">Sair</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 border-r border-white/10"
           style={{ background: "#110e18" }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 border-r border-white/10"
               style={{ background: "#110e18" }}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-4 px-4 h-14 border-b border-white/10"
                style={{ background: "#110e18" }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/50 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Rayearth Games" width={28} height={28} className="rounded-lg" />
            <span className="text-white font-bold text-sm">Rayearth Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
