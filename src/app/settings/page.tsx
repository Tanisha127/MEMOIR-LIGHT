"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Type, Volume2, MapPin, Bell, Moon } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [fontSize, setFontSize] = useState("medium");
  const [voice, setVoice] = useState(true);
  const [remindFreq, setRemindFreq] = useState("daily");
  const [homeSet, setHomeSet] = useState(false);
  const [safeRadius, setSafeRadius] = useState(200);

  const applyFontSize = (size: string) => {
    setFontSize(size);
    document.body.classList.remove("font-large", "font-xlarge");
    if (size === "large") document.body.classList.add("font-large");
    if (size === "xlarge") document.body.classList.add("font-xlarge");
    toast.success("Font size updated");
  };

  const testVoice = () => {
    const u = new SpeechSynthesisUtterance("Hello! This is how your voice reminders will sound.");
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const setHomeLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      () => {
        setHomeSet(true);
        toast.success("Home location saved 🏡");
      },
      () => toast.error("Could not access location. Please allow location permission.")
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-warm">Settings ⚙️</h1>
        <p className="font-body text-stone-light italic mt-1">
          Make Memoir Light feel just right for you
        </p>
      </div>

      {/* Profile */}
      <div className="card-warm p-6 mb-5">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Your Profile
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

      {/* Font Size */}
      <div className="card-warm p-6 mb-5">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          <Type size={18} className="text-sage" /> Text Size
        </h2>
        <div className="flex gap-3">
          {[
            { id: "normal", label: "Normal", size: "text-sm" },
            { id: "large", label: "Large", size: "text-base" },
            { id: "xlarge", label: "Very Large", size: "text-lg" },
          ].map(({ id, label, size }) => (
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
          <Volume2 size={18} className="text-sage" /> Voice Reminders
        </h2>
        <div className="flex items-center justify-between mb-4">
          <p className="font-ui text-sm text-stone-warm">Read reminders aloud</p>
          <button
            onClick={() => setVoice(!voice)}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${voice ? "bg-sage" : "bg-stone-lighter"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-soft transition-all duration-300 ${voice ? "left-6" : "left-0.5"}`} />
          </button>
        </div>
        <button onClick={testVoice} className="btn-sage text-sm py-2 flex items-center gap-2">
          <Volume2 size={15} /> Test Voice
        </button>
      </div>

      {/* Location */}
      <div className="card-warm p-6 mb-5">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-sage" /> Location Safety
        </h2>
        <div className="space-y-4">
          <div>
            <p className="font-ui text-sm text-stone-warm mb-2">Safe radius around home</p>
            <div className="flex items-center gap-3">
              <input
                type="range" min={50} max={1000} step={50}
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
            {homeSet ? "Home Location Saved ✓" : "Set Current Location as Home"}
          </button>
        </div>
      </div>

      {/* Reminder frequency */}
      <div className="card-warm p-6">
        <h2 className="font-ui font-semibold text-stone-warm mb-4 flex items-center gap-2">
          <Bell size={18} className="text-sage" /> Reminder Frequency
        </h2>
        <div className="flex gap-3">
          {["hourly", "daily", "weekly"].map((f) => (
            <button
              key={f}
              onClick={() => { setRemindFreq(f); toast.success("Preference saved"); }}
              className={`flex-1 py-2.5 rounded-2xl font-ui text-sm transition-all ${
                remindFreq === f
                  ? "bg-terracotta/15 text-terracotta ring-2 ring-terracotta/30"
                  : "bg-cream-100 text-stone-warm hover:bg-cream-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
