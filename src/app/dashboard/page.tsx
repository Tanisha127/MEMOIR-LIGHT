"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Droplets, Sun, Phone, ArrowRight, BellRing,
} from "lucide-react";
import LocationBadge from "./LocationBadge";
import toast from "react-hot-toast";
import {
  requestNotificationPermission,
  registerServiceWorker,
  scheduleDailyNotification,
} from "@/lib/notifications";

const GREETINGS = [
  "You are safe and loved 💛",
  "Today is a good day to make a memory 🌿",
  "Take it one gentle moment at a time 🍃",
  "You are doing wonderfully 🌸",
];

const TIME_OF_DAY = () => {
  const h = new Date().getHours();
  if (h < 12) return { label: "Good morning", icon: "🌅" };
  if (h < 17) return { label: "Good afternoon", icon: "☀️" };
  return { label: "Good evening", icon: "🌙" };
};

const quickCards = [
  { href: "/journal",    emoji: "📖", label: "Memory Journal", desc: "Write or recall a memory",      color: "from-sage-50 to-sage-100",            accent: "text-sage-500" },
  { href: "/family",     emoji: "👨‍👩‍👧", label: "My Family",     desc: "See the people you love",       color: "from-terracotta-50 to-terracotta-100", accent: "text-terracotta-400" },
  { href: "/reminders",  emoji: "🔔", label: "Reminders",      desc: "Medications & daily tasks",     color: "from-amber-light/30 to-amber-warm/20", accent: "text-amber-deep" },
  { href: "/activities", emoji: "✨", label: "Activities",      desc: "Gentle exercises & music",      color: "from-cream-200 to-cream-300",          accent: "text-stone-warm" },
  { href: "/breathing",  emoji: "🌬️", label: "Calm Breathing", desc: "A moment of peace",             color: "from-sage-50 to-sage-100",            accent: "text-sage-500" },
  { href: "/mood",       emoji: "🌸", label: "Mood Garden",    desc: "How are you feeling?",          color: "from-terracotta-50 to-terracotta-100", accent: "text-terracotta-400" },
];

const weatherTips = [
  "Stay hydrated today — drink a glass of water 💧",
  "A gentle walk outside might lift your spirits 🌳",
  "Today is perfect for looking at old photos 📸",
  "Consider calling a family member today 📞",
];

export default function DashboardPage() {
  const { data: session } = useSession();

  // ✅ FIX: start empty, set randomly only on client after hydration
  const [greeting, setGreeting] = useState("");
  const [tip, setTip]           = useState("");

  const [hydration, setHydration]       = useState(3);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // timeOfDay is safe — same value on server and client for a given request
  const timeOfDay = TIME_OF_DAY();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    // ✅ Runs only on client — no server/client mismatch possible
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    setTip(weatherTips[Math.floor(Math.random() * weatherTips.length)]);

    if ("Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
  }, []);

  const enableNotifications = async () => {
    setNotifLoading(true);
    try {
      await registerServiceWorker();
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error("Notifications blocked. Please allow them in browser settings.");
        return;
      }
      setNotifEnabled(true);
      scheduleDailyNotification(8,  0,  "Good morning! 📖",   "Time to write in your Memory Journal",        "/journal");
      scheduleDailyNotification(10, 0,  "Hydration check 💧", "Have you had water recently?",                "/dashboard");
      scheduleDailyNotification(12, 0,  "Midday check-in 🌿", "How are you feeling? Visit your Mood Garden", "/mood");
      scheduleDailyNotification(14, 0,  "Hydration check 💧", "Time for another glass of water!",            "/dashboard");
      scheduleDailyNotification(15, 0,  "Breathing time 🌬️",  "Your calm breathing exercise is waiting",     "/breathing");
      scheduleDailyNotification(16, 0,  "Hydration check 💧", "Don't forget to drink water 💧",              "/dashboard");
      scheduleDailyNotification(19, 0,  "Evening journal 📖", "Write today's memory before you sleep",       "/journal");
      scheduleDailyNotification(21, 0,  "Good night 🌙",      "Rest well. You did wonderfully today 💛",     "/dashboard");
      toast.success("Notifications enabled! We'll send gentle reminders 🔔");
    } catch {
      toast.error("Could not enable notifications");
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-ui text-stone-light text-sm mb-1">{today}</p>
            <h1 className="font-display text-3xl font-bold text-stone-warm mb-2">
              {timeOfDay.icon} {timeOfDay.label},{" "}
              {session?.user?.name?.split(" ")[0] || "friend"}
            </h1>
            {/* ✅ Only render once greeting is set on client */}
            {greeting && (
              <p className="font-body text-sage-500 text-lg italic">{greeting}</p>
            )}
          </div>

          <div className="hidden md:flex flex-col items-end gap-2">
            <Link
              href="/emergency"
              className="flex items-center gap-2 bg-terracotta/10 text-terracotta rounded-2xl px-4 py-2 font-ui text-sm font-medium hover:bg-terracotta/20 transition-colors"
            >
              <Phone size={15} />
              Emergency
            </Link>
            <LocationBadge />
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {!notifEnabled && (
        <div className="bg-gradient-to-r from-amber-light/30 to-cream-200 rounded-3xl p-5 mb-6 flex items-center gap-4 border border-amber-warm/30">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
            <BellRing className="text-amber-deep" size={22} />
          </div>
          <div className="flex-1">
            <p className="font-ui font-semibold text-stone-warm text-sm mb-0.5">
              Enable Gentle Reminders 🔔
            </p>
            <p className="font-ui text-xs text-stone-light">
              Get notified for journal, water, breathing &amp; medications
            </p>
          </div>
          <button
            onClick={enableNotifications}
            disabled={notifLoading}
            className="btn-primary text-sm py-2 px-4 whitespace-nowrap flex-shrink-0"
          >
            {notifLoading ? "Setting up…" : "Enable"}
          </button>
        </div>
      )}

      {/* Already enabled confirmation */}
      {notifEnabled && (
        <div className="bg-sage/10 rounded-3xl p-4 mb-6 flex items-center gap-3 border border-sage/20">
          <span className="text-xl">🔔</span>
          <p className="font-ui text-sm text-sage-500 font-medium">
            Gentle reminders are active — we&apos;ll nudge you throughout the day 💛
          </p>
        </div>
      )}

      {/* Tip banner — only render once tip is set on client */}
      {tip && (
        <div className="bg-gradient-to-r from-sage-50 to-cream-200 rounded-3xl p-5 mb-8 flex items-center gap-4 border border-sage/20">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
            <Sun className="text-amber-warm" size={22} />
          </div>
          <div>
            <p className="font-ui text-xs text-sage-500 font-medium mb-0.5">GENTLE REMINDER</p>
            <p className="font-body text-stone-warm">{tip}</p>
          </div>
        </div>
      )}

      {/* Hydration bar */}
      <div className="card-warm p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="text-sage" size={20} />
            <span className="font-ui font-medium text-stone-warm">Today&apos;s Hydration</span>
          </div>
          <span className="font-ui text-sm text-stone-light">{hydration}/{hydrationGoal} glasses</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: hydrationGoal }).map((_, i) => (
            <button
              key={i}
              onClick={() => setHydration(Math.max(i === hydration - 1 ? i : i + 1, 0))}
              className={`flex-1 h-8 rounded-xl transition-all duration-300 ${
                i < hydration ? "bg-sage text-white shadow-soft" : "bg-cream-200 hover:bg-sage-100"
              }`}
              title={`${i + 1} glass${i + 1 !== 1 ? "es" : ""}`}
            >
              {i < hydration ? "💧" : ""}
            </button>
          ))}
        </div>
        {hydration >= hydrationGoal && (
          <p className="text-center font-ui text-sm text-sage-500 mt-2">
            Amazing! You&apos;ve had enough water today 🎉
          </p>
        )}
      </div>

      {/* Quick access grid */}
      <h2 className="font-display text-xl font-bold text-stone-warm mb-4">
        What would you like to do?
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {quickCards.map(({ href, emoji, label, desc, color, accent }) => (
          <Link key={href} href={href}>
            <div className={`card-warm p-5 bg-gradient-to-br ${color} border-0 h-full`}>
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className={`font-ui font-semibold ${accent} mb-1`}>{label}</h3>
              <p className="font-ui text-xs text-stone-light">{desc}</p>
              <ArrowRight size={14} className={`${accent} mt-3 opacity-60`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile location strip */}
      <div className="md:hidden card-warm p-4 flex items-center justify-between">
        <div>
          <p className="font-ui font-medium text-stone-warm text-sm">Location Safety</p>
          <p className="font-ui text-xs text-stone-light">Tap to view your safe zone</p>
        </div>
        <LocationBadge />
      </div>

    </div>
  );
}

// ✅ Add this — was missing and caused a reference error
const hydrationGoal = 8;