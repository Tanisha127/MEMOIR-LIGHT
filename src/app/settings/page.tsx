"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Type, Volume2, MapPin, Bell, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { lang, setLang } = useLanguage();
  const isHi = lang === "hi";

  const [fontSize, setFontSize]     = useState("normal");
  const [voice, setVoice]           = useState(true);
  const [remindFreq, setRemindFreq] = useState("daily");
  const [homeSet, setHomeSet]       = useState(false);
  const [safeRadius, setSafeRadius] = useState(200);

  const labels = {
    pageTitle:      isHi ? "सेटिंग्स ⚙️"                              : "Settings ⚙️",
    pageSubtitle:   isHi ? "Memoir Light को अपने अनुसार बनाएं"        : "Make Memoir Light feel just right for you",

    profileTitle:   isHi ? "👤 आपकी प्रोफ़ाइल"                        : "👤 Your Profile",

    fontTitle:      isHi ? "टेक्स्ट का आकार"                          : "Text Size",
    fontNormal:     isHi ? "सामान्य"                                   : "Normal",
    fontLarge:      isHi ? "बड़ा"                                      : "Large",
    fontXLarge:     isHi ? "बहुत बड़ा"                                 : "Very Large",
    fontSaved:      isHi ? "फ़ॉन्ट आकार अपडेट हुआ"                    : "Font size updated",

    voiceTitle:     isHi ? "आवाज़ अनुस्मारक"                          : "Voice Reminders",
    voiceToggle:    isHi ? "अनुस्मारक ज़ोर से पढ़ें"                   : "Read reminders aloud",
    testVoice:      isHi ? "आवाज़ परखें"                               : "Test Voice",
    voiceTestMsg:   isHi ? "नमस्ते! आपके अनुस्मारक इस तरह सुनाई देंगे।" : "Hello! This is how your voice reminders will sound.",

    locationTitle:  isHi ? "स्थान सुरक्षा"                            : "Location Safety",
    safeRadius:     isHi ? "घर के आसपास सुरक्षित दायरा"               : "Safe radius around home",
    setHome:        isHi ? "वर्तमान स्थान को घर के रूप में सेट करें"  : "Set Current Location as Home",
    homeSaved:      isHi ? "घर का स्थान सहेजा गया ✓"                  : "Home Location Saved ✓",
    homeSuccess:    isHi ? "घर का स्थान सहेजा गया 🏡"                 : "Home location saved 🏡",
    locationError:  isHi ? "स्थान नहीं मिला। अनुमति दें।"             : "Could not access location. Please allow location permission.",

    reminderTitle:  isHi ? "अनुस्मारक की आवृत्ति"                     : "Reminder Frequency",
    hourly:         isHi ? "प्रति घंटे"                                : "Hourly",
    daily:          isHi ? "दैनिक"                                     : "Daily",
    weekly:         isHi ? "साप्ताहिक"                                 : "Weekly",
    prefSaved:      isHi ? "प्राथमिकता सहेजी गई"                      : "Preference saved",

    langTitle:      isHi ? "भाषा"                                      : "Language",
    langDesc:       isHi ? "ऐप की भाषा चुनें"                         : "Choose your app language",
    langEn:         isHi ? "English"                                   : "English",
    langHi:         isHi ? "हिंदी"                                     : "हिंदी",
    langSaved:      isHi ? "भाषा बदली गई"                             : "Language updated",
  };

  const applyFontSize = (size: string) => {
    setFontSize(size);
    document.body.classList.remove("font-large", "font-xlarge");
    if (size === "large")  document.body.classList.add("font-large");
    if (size === "xlarge") document.body.classList.add("font-xlarge");
    toast.success(labels.fontSaved);
  };

  const testVoice = () => {
    const u = new SpeechSynthesisUtterance(labels.voiceTestMsg);
    u.rate = 0.85;
    u.lang = isHi ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(u);
  };

  const setHomeLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        localStorage.setItem("homeLocation", JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        localStorage.setItem("safeRadius", String(safeRadius));
        setHomeSet(true);
        toast.success(labels.homeSuccess);
      },
      () => toast.error(labels.locationError)
    );
  };

  const handleLangChange = (l: "en" | "hi") => {
    setLang(l);
    toast.success(labels.langSaved);
  };

  const fontOptions = [
    { id: "normal", label: labels.fontNormal, size: "text-sm" },
    { id: "large",  label: labels.fontLarge,  size: "text-base" },
    { id: "xlarge", label: labels.fontXLarge, size: "text-lg" },
  ];

  const freqOptions = [
    { id: "hourly",  label: labels.hourly },
    { id: "daily",   label: labels.daily },
    { id: "weekly",  label: labels.weekly },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-warm">{labels.pageTitle}</h1>
        <p className="font-body text-stone-light italic mt-1">{labels.pageSubtitle}</p>
      </div>

      {/* Profile */}
      <div className="card-warm p-6 mb-5">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          {labels.profileTitle}
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta-100 to-sage-100 flex items-center justify-center text-3xl">
            🌿
          </div>
          <div>
            <p className="font-ui font-semibold text-stone-warm text-lg">{session?.user?.name}</p>
            <p className="font-ui text-sm text-stone-light">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="card-warm p-6 mb-5">
        <h2 className="font-ui font-semibold text-stone-warm mb-1 flex items-center gap-2">
          <Globe size={18} className="text-sage" /> {labels.langTitle}
        </h2>
        <p className="font-ui text-xs text-stone-light mb-4">{labels.langDesc}</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleLangChange("en")}
            className={`flex-1 py-3 rounded-2xl font-ui text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              lang === "en"
                ? "bg-terracotta/15 text-terracotta ring-2 ring-terracotta/30"
                : "bg-cream-100 text-stone-warm hover:bg-cream-200"
            }`}
          >
            <span className="text-lg">🇬🇧</span>
            {labels.langEn}
          </button>
          <button
            onClick={() => handleLangChange("hi")}
            className={`flex-1 py-3 rounded-2xl font-ui text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              lang === "hi"
                ? "bg-terracotta/15 text-terracotta ring-2 ring-terracotta/30"
                : "bg-cream-100 text-stone-warm hover:bg-cream-200"
            }`}
          >
            <span className="text-lg">🇮🇳</span>
            {labels.langHi}
          </button>
        </div>
        {/* Visual indicator of current language */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sage" />
          <p className="font-ui text-xs text-sage-500">
            {lang === "en" ? "Currently: English" : "वर्तमान: हिंदी"}
          </p>
        </div>
      </div>

      {/* Font Size */}
      <div className="card-warm p-6 mb-5">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          <Type size={18} className="text-sage" /> {labels.fontTitle}
        </h2>
        <div className="flex gap-3">
          {fontOptions.map(({ id, label, size }) => (
            <button
              key={id}
              onClick={() => applyFontSize(id)}
              className={`flex-1 py-3 rounded-2xl font-ui transition-all ${size} ${
                fontSize === id
                  ? "bg-terracotta/15 text-terracotta ring-2 ring-terracotta/30"
                  : "bg-cream-100 text-stone-warm hover:bg-cream-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice */}
      <div className="card-warm p-6 mb-5">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          <Volume2 size={18} className="text-sage" /> {labels.voiceTitle}
        </h2>
        <div className="flex items-center justify-between mb-4">
          <p className="font-ui text-sm text-stone-warm">{labels.voiceToggle}</p>
          <button
            onClick={() => setVoice(!voice)}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
              voice ? "bg-sage" : "bg-stone-lighter"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-soft transition-all duration-300 ${
                voice ? "left-6" : "left-0.5"
              }`}
            />
          </button>
        </div>
        <button onClick={testVoice} className="btn-sage text-sm py-2 flex items-center gap-2">
          <Volume2 size={15} /> {labels.testVoice}
        </button>
      </div>

      {/* Location */}
      <div className="card-warm p-6 mb-5">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-sage" /> {labels.locationTitle}
        </h2>
        <div className="space-y-4">
          <div>
            <p className="font-ui text-sm text-stone-warm mb-2">{labels.safeRadius}</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50} max={1000} step={50}
                value={safeRadius}
                onChange={(e) => setSafeRadius(Number(e.target.value))}
                className="flex-1 accent-sage"
              />
              <span className="font-ui text-sm font-medium text-sage-500 w-20">{safeRadius}m</span>
            </div>
          </div>
          <button
            onClick={setHomeLocation}
            className={`btn-sage text-sm py-2 flex items-center gap-2 ${homeSet ? "opacity-70" : ""}`}
          >
            <MapPin size={15} />
            {homeSet ? labels.homeSaved : labels.setHome}
          </button>
        </div>
      </div>

      {/* Reminder Frequency */}
      <div className="card-warm p-6">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          <Bell size={18} className="text-sage" /> {labels.reminderTitle}
        </h2>
        <div className="flex gap-3">
          {freqOptions.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => { setRemindFreq(id); toast.success(labels.prefSaved); }}
              className={`flex-1 py-2.5 rounded-2xl font-ui text-sm transition-all ${
                remindFreq === id
                  ? "bg-terracotta/15 text-terracotta ring-2 ring-terracotta/30"
                  : "bg-cream-100 text-stone-warm hover:bg-cream-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}