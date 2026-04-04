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
import { useLanguage } from "@/context/LanguageContext";

const NAV_LABELS_EN: Record<string, string> = {
  "/dashboard":  "Home",
  "/journal":    "Memory Journal",
  "/family":     "My Family",
  "/reminders":  "Reminders",
  "/activities": "Activities",
  "/mood":       "Mood Garden",
  "/breathing":  "Calm Breathing",
  "/timeline":   "Life Timeline",
  "/emergency":  "Emergency",
  "/settings":   "Settings",
};

const NAV_LABELS_HI: Record<string, string> = {
  "/dashboard":  "होम",
  "/journal":    "स्मृति डायरी",
  "/family":     "मेरा परिवार",
  "/reminders":  "अनुस्मारक",
  "/activities": "गतिविधियाँ",
  "/mood":       "मूड गार्डन",
  "/breathing":  "शांत साँस",
  "/timeline":   "जीवन यात्रा",
  "/emergency":  "आपातकाल",
  "/settings":   "सेटिंग्स",
};

const navItems = [
  { href: "/dashboard",  emoji: "🏡" },
  { href: "/journal",    emoji: "📖" },
  { href: "/family",     emoji: "👨‍👩‍👧" },
  { href: "/reminders",  emoji: "🔔" },
  { href: "/activities", emoji: "✨" },
  { href: "/mood",       emoji: "🌸" },
  { href: "/breathing",  emoji: "🌬️" },
  { href: "/timeline",   emoji: "🗺️" },
  { href: "/emergency",  emoji: "🆘" },
  { href: "/settings",   emoji: "⚙️" },
];

export function Sidebar() {
  const pathname           = usePathname();
  const { data: session }  = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const { lang, setLang }  = useLanguage();
  const navLabels          = lang === "hi" ? NAV_LABELS_HI : NAV_LABELS_EN;

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
          {navItems.map(({ href, emoji }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            const label  = navLabels[href] ?? href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`
                  flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200
                  ${active
                    ? "bg-terracotta/10 text-terracotta"
                    : "text-sidebar-icon hover:bg-cream-100 hover:text-terracotta"
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

        {/* Bottom section */}
        <div className="p-3 border-t border-sidebar-border">

          {/* ── Language toggle (expanded) ── */}
          {!collapsed && (
            <div className="mb-3">
              <p className="font-ui text-xs text-sidebar-icon mb-2 px-1">
                {lang === "hi" ? "भाषा" : "Language"}
              </p>
              {/* ✅ solid visible background, no opacity classes */}
              <div
                className="flex gap-1 rounded-2xl p-1"
                style={{ backgroundColor: "var(--stone-light)" }}
              >
                <button
                  onClick={() => setLang("en")}
                  style={lang === "en" ? {
                    backgroundColor: "var(--terracotta)",
                    color: "#fff",
                    borderRadius: "10px",
                    flex: 1,
                    padding: "6px 0",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  } : {
                    backgroundColor: "transparent",
                    color: "var(--stone)",
                    borderRadius: "10px",
                    flex: 1,
                    padding: "6px 0",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("hi")}
                  style={lang === "hi" ? {
                    backgroundColor: "var(--terracotta)",
                    color: "#fff",
                    borderRadius: "10px",
                    flex: 1,
                    padding: "6px 0",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  } : {
                    backgroundColor: "transparent",
                    color: "var(--stone)",
                    borderRadius: "10px",
                    flex: 1,
                    padding: "6px 0",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  हिं
                </button>
              </div>
            </div>
          )}

          {/* ── Language toggle (collapsed) ── */}
          {collapsed && (
            <div className="flex flex-col gap-1 items-center mb-2">
              <button
                onClick={() => setLang("en")}
                style={{
                  backgroundColor: lang === "en" ? "var(--terracotta)" : "transparent",
                  color: lang === "en" ? "#fff" : "var(--stone)",
                  width: "40px",
                  height: "28px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLang("hi")}
                style={{
                  backgroundColor: lang === "hi" ? "var(--terracotta)" : "transparent",
                  color: lang === "hi" ? "#fff" : "var(--stone)",
                  width: "40px",
                  height: "28px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                हिं
              </button>
            </div>
          )}

          {/* User info */}
          {!collapsed && (
            <div className="mb-2 px-2">
              <div className="font-ui text-xs text-sidebar-icon">
                {lang === "hi" ? "इस नाम से लॉग इन हैं" : "Signed in as"}
              </div>
              <div className="font-ui text-sm font-medium text-sidebar truncate">
                {session?.user?.name || session?.user?.email}
              </div>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`
              flex items-center gap-2 w-full rounded-2xl px-3 py-2
              text-sidebar-icon hover:text-terracotta hover:bg-terracotta/10
              transition-all font-ui text-sm
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={16} />
            {!collapsed && (
              <span>{lang === "hi" ? "साइन आउट" : "Sign out"}</span>
            )}
          </button>
        </div>
      </aside>

      <CompanionChat />
    </>
  );
}