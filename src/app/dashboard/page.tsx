"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Droplets, Sun, Phone, ArrowRight, BellRing } from "lucide-react";
import LocationBadge from "./LocationBadge";
import toast from "react-hot-toast";
import { requestNotificationPermission, registerServiceWorker, scheduleDailyNotification } from "@/lib/notifications";
import { useLanguage } from "@/context/LanguageContext";

const hydrationGoal = 8;
const CARD_HREFS    = ["/journal", "/family", "/reminders", "/activities", "/breathing", "/mood"];
const CARD_EMOJIS   = ["📖", "👨‍👩‍👧", "🔔", "✨", "🌬️", "🌸"];
const CARD_COLORS   = ["from-sage-50 to-sage-100","from-terracotta-50 to-terracotta-100","from-amber-light/30 to-amber-warm/20","from-cream-200 to-cream-300","from-sage-50 to-sage-100","from-terracotta-50 to-terracotta-100"];
const CARD_ACCENTS  = ["text-sage-500","text-terracotta-400","text-amber-deep","text-stone-warm","text-sage-500","text-terracotta-400"];

const EN_CARDS = [
  { label: "Memory Journal", desc: "Write or recall a memory" },
  { label: "My Family",      desc: "See the people you love" },
  { label: "Reminders",      desc: "Medications & daily tasks" },
  { label: "Activities",     desc: "Gentle exercises & music" },
  { label: "Calm Breathing", desc: "A moment of peace" },
  { label: "Mood Garden",    desc: "How are you feeling?" },
];

const HI_CARDS = [
  { label: "स्मृति डायरी",  desc: "एक याद लिखें या याद करें" },
  { label: "मेरा परिवार",   desc: "अपने प्रियजनों को देखें" },
  { label: "अनुस्मारक",     desc: "दवाएं और दैनिक कार्य" },
  { label: "गतिविधियाँ",    desc: "हल्के व्यायाम और संगीत" },
  { label: "शांत साँस",     desc: "एक शांतिपूर्ण पल" },
  { label: "मूड गार्डन",   desc: "आप कैसा महसूस कर रहे हैं?" },
];

const EN_GREETINGS = ["You are safe and loved 💛","Today is a good day to make a memory 🌿","Take it one gentle moment at a time 🍃","You are doing wonderfully 🌸"];
const HI_GREETINGS = ["आप सुरक्षित और प्यारे हैं 💛","आज एक अच्छी याद बनाने का दिन है 🌿","एक-एक पल धीरे-धीरे लें 🍃","आप बहुत अच्छा कर रहे हैं 🌸"];

const EN_TIPS = ["Stay hydrated today — drink a glass of water 💧","A gentle walk outside might lift your spirits 🌳","Today is perfect for looking at old photos 📸","Consider calling a family member today 📞"];
const HI_TIPS = ["आज पानी पीते रहें — एक गिलास पानी पिएं 💧","बाहर थोड़ी सैर करने से मन खुश हो सकता है 🌳","आज पुरानी तस्वीरें देखने का अच्छा समय है 📸","आज किसी परिवार के सदस्य को फ़ोन करें 📞"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const { lang } = useLanguage();

  const [greeting, setGreeting]         = useState("");
  const [tip, setTip]                   = useState("");
  const [hydration, setHydration]       = useState(3);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const isHi = lang === "hi";

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return { label: isHi ? "सुप्रभात"    : "Good morning",   icon: "🌅" };
    if (h < 17) return { label: isHi ? "नमस्ते"       : "Good afternoon", icon: "☀️" };
    return             { label: isHi ? "शुभ संध्या"   : "Good evening",   icon: "🌙" };
  };

  const tod   = timeOfDay();
  const cards = isHi ? HI_CARDS : EN_CARDS;

  const today = new Date().toLocaleDateString(
    isHi ? "hi-IN" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  useEffect(() => {
    const greets = isHi ? HI_GREETINGS : EN_GREETINGS;
    const tips   = isHi ? HI_TIPS      : EN_TIPS;
    setGreeting(greets[Math.floor(Math.random() * greets.length)]);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    if ("Notification" in window) setNotifEnabled(Notification.permission === "granted");
  }, [lang, isHi]);

  const enableNotifications = async () => {
    setNotifLoading(true);
    try {
      await registerServiceWorker();
      const granted = await requestNotificationPermission();
      if (!granted) { toast.error(isHi ? "सूचनाएं अवरुद्ध हैं" : "Notifications blocked"); return; }
      setNotifEnabled(true);
      scheduleDailyNotification(8,  0, "Good morning! 📖",   "Time to write in your Memory Journal",        "/journal");
      scheduleDailyNotification(10, 0, "Hydration check 💧", "Have you had water recently?",                "/dashboard");
      scheduleDailyNotification(12, 0, "Midday check-in 🌿", "How are you feeling? Visit your Mood Garden", "/mood");
      scheduleDailyNotification(14, 0, "Hydration check 💧", "Time for another glass of water!",            "/dashboard");
      scheduleDailyNotification(15, 0, "Breathing time 🌬️",  "Your calm breathing exercise is waiting",     "/breathing");
      scheduleDailyNotification(16, 0, "Hydration check 💧", "Don't forget to drink water 💧",              "/dashboard");
      scheduleDailyNotification(19, 0, "Evening journal 📖", "Write today's memory before you sleep",       "/journal");
      scheduleDailyNotification(21, 0, "Good night 🌙",      "Rest well. You did wonderfully today 💛",     "/dashboard");
      toast.success(isHi ? "सूचनाएं चालू हो गईं 🔔" : "Notifications enabled 🔔");
    } catch { toast.error(isHi ? "सूचना चालू नहीं हो सकी" : "Could not enable notifications"); }
    finally { setNotifLoading(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-ui text-stone-light text-sm mb-1">{today}</p>
            <h1 className="font-display text-3xl font-bold text-stone-warm mb-2">
              {tod.icon} {tod.label}, {session?.user?.name?.split(" ")[0] || (isHi ? "मित्र" : "friend")}
            </h1>
            {greeting && <p className="font-body text-sage-500 text-lg italic">{greeting}</p>}
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <Link href="/emergency" className="flex items-center gap-2 bg-terracotta/10 text-terracotta rounded-2xl px-4 py-2 font-ui text-sm font-medium hover:bg-terracotta/20 transition-colors">
              <Phone size={15} />
              {isHi ? "आपातकाल" : "Emergency"}
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
              {isHi ? "सौम्य अनुस्मारक चालू करें 🔔" : "Enable Gentle Reminders 🔔"}
            </p>
            <p className="font-ui text-xs text-stone-light">
              {isHi ? "जर्नल, पानी, साँस और दवाओं के लिए सूचना पाएं" : "Get notified for journal, water, breathing & medications"}
            </p>
          </div>
          <button onClick={enableNotifications} disabled={notifLoading} className="btn-primary text-sm py-2 px-4 whitespace-nowrap flex-shrink-0">
            {notifLoading ? (isHi ? "सेट हो रहा है…" : "Setting up…") : (isHi ? "चालू करें" : "Enable")}
          </button>
        </div>
      )}

      {notifEnabled && (
        <div className="bg-sage/10 rounded-3xl p-4 mb-6 flex items-center gap-3 border border-sage/20">
          <span className="text-xl">🔔</span>
          <p className="font-ui text-sm text-sage-500 font-medium">
            {isHi ? "सौम्य अनुस्मारक सक्रिय हैं 💛" : "Gentle reminders are active — we'll nudge you throughout the day 💛"}
          </p>
        </div>
      )}

      {/* Tip banner */}
      {tip && (
        <div className="bg-gradient-to-r from-sage-50 to-cream-200 rounded-3xl p-5 mb-8 flex items-center gap-4 border border-sage/20">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
            <Sun className="text-amber-warm" size={22} />
          </div>
          <div>
            <p className="font-ui text-xs text-sage-500 font-medium mb-0.5">
              {isHi ? "सौम्य याद" : "GENTLE REMINDER"}
            </p>
            <p className="font-body text-stone-warm">{tip}</p>
          </div>
        </div>
      )}

      {/* Hydration */}
      <div className="card-warm p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="text-sage" size={20} />
            <span className="font-ui font-medium text-stone-warm">
              {isHi ? "आज का पानी" : "Today's Hydration"}
            </span>
          </div>
          <span className="font-ui text-sm text-stone-light">
            {hydration}/{hydrationGoal} {isHi ? "गिलास" : "glasses"}
          </span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: hydrationGoal }).map((_, i) => (
            <button
              key={i}
              onClick={() => setHydration(Math.max(i === hydration - 1 ? i : i + 1, 0))}
              className={`flex-1 h-8 rounded-xl transition-all duration-300 ${i < hydration ? "bg-sage text-white shadow-soft" : "bg-cream-200 hover:bg-sage-100"}`}
            >
              {i < hydration ? "💧" : ""}
            </button>
          ))}
        </div>
        {hydration >= hydrationGoal && (
          <p className="text-center font-ui text-sm text-sage-500 mt-2">
            {isHi ? "बहुत बढ़िया! आपने आज पर्याप्त पानी पी लिया 🎉" : "Amazing! You've had enough water today 🎉"}
          </p>
        )}
      </div>

      {/* Quick cards */}
      <h2 className="font-display text-xl font-bold text-stone-warm mb-4">
        {isHi ? "आज क्या करना चाहेंगे?" : "What would you like to do?"}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <Link key={CARD_HREFS[i]} href={CARD_HREFS[i]}>
            <div className={`card-warm p-5 bg-gradient-to-br ${CARD_COLORS[i]} border-0 h-full`}>
              <div className="text-3xl mb-3">{CARD_EMOJIS[i]}</div>
              <h3 className={`font-ui font-semibold ${CARD_ACCENTS[i]} mb-1`}>{card.label}</h3>
              <p className="font-ui text-xs text-stone-light">{card.desc}</p>
              <ArrowRight size={14} className={`${CARD_ACCENTS[i]} mt-3 opacity-60`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile location */}
      <div className="md:hidden card-warm p-4 flex items-center justify-between">
        <div>
          <p className="font-ui font-medium text-stone-warm text-sm">
            {isHi ? "स्थान सुरक्षा" : "Location Safety"}
          </p>
          <p className="font-ui text-xs text-stone-light">
            {isHi ? "अपना सुरक्षित क्षेत्र देखें" : "Tap to view your safe zone"}
          </p>
        </div>
        <LocationBadge />
      </div>
    </div>
  );
}