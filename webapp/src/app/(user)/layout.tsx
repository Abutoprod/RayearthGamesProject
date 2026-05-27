"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Home, CalendarDays, Trophy, User, Receipt } from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/app/ranking", label: "Ranking", icon: Trophy },
  { href: "/app/comandas", label: "Comandas", icon: Receipt },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    if (!token) {
      router.replace("/");
    } else if (role === "ROLE_ADMIN" || role === "ADMIN") {
      router.replace("/admin");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Conteúdo principal */}
      <main className="flex-1 pb-20 overflow-y-auto">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5"
           style={{ background: "rgba(13,11,17,0.96)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                  active ? "text-orange" : "text-white/35 hover:text-white/60"
                }`}
              >
                <div className={`relative ${active ? "after:content-[''] after:absolute after:inset-0 after:bg-orange/15 after:rounded-full after:scale-150" : ""}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-semibold ${active ? "text-orange" : ""}`}>
                  {label}
                </span>
                {active && (
                  <span className="absolute top-0 w-6 h-0.5 bg-orange rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
