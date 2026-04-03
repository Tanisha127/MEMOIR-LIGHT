"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home, BookOpen, Users, Bell, Zap, MapPin, Phone,
  Settings, Wind, BarChart2, LogOut, ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { CompanionChat } from "@/components/chat/CompanionChat";

const navItems = [
  { href: "/dashboard",  icon: Home,      label: "Home",           emoji: "🏡" },
  { href: "/journal",    icon: BookOpen,  label: "Memory Journal", emoji: "📖" },
  { href: "/family",     icon: Users,     label: "My Family",      emoji: "👨‍👩‍👧" },
  { href: "/reminders",  icon: Bell,      label: "Reminders",      emoji: "🔔" },
  { href: "/activities", icon: Zap,       label: "Activities",     emoji: "✨" },
  { href: "/mood",       icon: BarChart2, label: "Mood Garden",    emoji: "🌸" },
  { href: "/breathing",  icon: Wind,      label: "Calm Breathing", emoji: "🌬️" },
  { href: "/timeline",   icon: MapPin,    label: "Life Timeline",  emoji: "🗺️" },
  { href: "/emergency",  icon: Phone,     label: "Emergency",      emoji: "🆘" },
  { href: "/settings",   icon: Settings,  label: "Settings",       emoji: "⚙️" },
];

export function Sidebar() {
  const pathname  = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside
        className={`
          relative flex flex-col bg-sidebar border-r border-sidebar-border h-screen transition-all duration-300
          ${collapsed ? "w-[72px]" : "w-[240px]"}
        `}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full border border-stone-lighter shadow-soft flex items-center justify-center z-10 hover:bg-cream-100 transition-colors"
        >
          <ChevronLeft
            size={12}
            className={`text-stone-warm transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Logo */}
        <div className={`flex items-center gap-3 p-5 border-b border-sidebar-border ${collapsed ? "justify-center px-3" : ""}`}>
          <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-sage-100 to-cream-200 rounded-2xl flex items-center justify-center">
            <span className="text-xl">🌿</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-display font-bold text-sidebar text-sm leading-tight">Memoir</div>
              <div className="font-display font-bold text-terracotta text-sm leading-tight">Light</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, emoji }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`
                  flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 group
                  ${active
                    ? "bg-terracotta/10 text-terracotta"
                    : "text-sidebar-icon hover:bg-sidebar-hover hover:text-terracotta"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span className="text-base flex-shrink-0">{emoji}</span>
                {!collapsed && (
                  <span className="font-ui text-sm font-medium text-sidebar">{label}</span>
                )}
                {active && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-terracotta" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className={`p-3 border-t border-sidebar-border ${collapsed ? "flex justify-center" : ""}`}>
          {!collapsed && (
            <div className="mb-2 px-2">
              <div className="font-ui text-xs text-sidebar-icon">Signed in as</div>
              <div className="font-ui text-sm font-medium text-sidebar truncate">
                {session?.user?.name || session?.user?.email}
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center gap-2 w-full rounded-2xl px-3 py-2 text-sidebar-icon hover:text-terracotta hover:bg-terracotta/10 transition-all font-ui text-sm ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Companion chat — renders over everything, fixed position */}
      <CompanionChat />
    </>
  );
}