"use client";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

// Haversine formula
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

type Status = "safe" | "away" | "unknown";

export default function LocationBadge() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  const [status, setStatus]       = useState<Status>("unknown");
  const [distance, setDistance]   = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [homePos, setHomePos]     = useState<{ lat: number; lng: number } | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    home: { lat: number; lng: number };
    current: { lat: number; lng: number };
    distance: number;
    safeRadius: number;
  }> | null>(null);
  const hasSpokenRef = useRef(false);
  const safeRadius = 200;

  // ── Labels ─────────────────────────────────────────────
  const labels = {
    safe:           isHi ? "सुरक्षित"                                          : "Safe",
    away:           isHi ? "दूर"                                               : "Away",
    location:       isHi ? "स्थान"                                             : "Location",
    popupTitle:     isHi ? "📍 स्थान सुरक्षा"                                 : "📍 Location Safety",
    close:          isHi ? "बंद करें"                                          : "Close",
    unknownMsg:     isHi ? "हमें आपको सुरक्षित रखने के लिए घर का स्थान सेट करें।" : "Set your home location so we can keep you safe.",
    safeMsg:        isHi ? "✅ आप अपने घर के आसपास सुरक्षित हैं।"             : "✅ You are safely within your home area.",
    fromHome:       isHi ? "घर से"                                             : "from home",
    awayTitle:      isHi ? "⚠️ आप घर से दूर हैं"                             : "⚠️ You are away from home",
    awayDesc:       isHi ? `आपका सुरक्षित दायरा ${safeRadius}मी है। घर की ओर जाएं।` : `Your safe radius is ${safeRadius}m. Consider heading back.`,
    distanceLabel:  isHi ? "घर से दूरी"                                       : "Distance from home",
    setHomeBtn:     isHi ? "📍 वर्तमान स्थान को घर बनाएं"                    : "📍 Set Current Location as Home",
    homeSuccess:    isHi ? "घर का स्थान सहेजा गया! 🏡"                       : "Home location saved! 🏡",
    locationError:  isHi ? "स्थान नहीं मिला। अनुमति दें।"                    : "Could not get location. Please allow permission first.",
    awayVoice:      isHi ? "आप घर से दूर लग रहे हैं। कृपया किसी परिवार के सदस्य से संपर्क करें।"
                         : "You seem to be away from home. Please check with a family member.",
  };

  const CONFIG: Record<Status, { color: string; icon: string; label: string }> = {
    safe:    { color: "bg-sage/15 text-sage-500",         icon: "🏡", label: labels.safe },
    away:    { color: "bg-terracotta/15 text-terracotta", icon: "⚠️", label: labels.away },
    unknown: { color: "bg-cream-200 text-stone-warm",     icon: "📍", label: labels.location },
  };

  // ── Load map dynamically (avoid SSR issues) ────────────
  useEffect(() => {
    import("./LocationMap").then((mod) => {
      setMapComponent(() => mod.default);
    }).catch(() => {});
  }, []);

  // ── Watch position ─────────────────────────────────────
  useEffect(() => {
    const savedHome = localStorage.getItem("homeLocation");
    if (!savedHome) { setStatus("unknown"); return; }

    const home = JSON.parse(savedHome);
    setHomePos(home);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        const dist = getDistanceMeters(latitude, longitude, home.lat, home.lng);
        setDistance(Math.round(dist));

        if (dist <= safeRadius) {
          setStatus("safe");
          hasSpokenRef.current = false;
        } else {
          setStatus("away");
          if (!hasSpokenRef.current) {
            hasSpokenRef.current = true;
            const u = new SpeechSynthesisUtterance(labels.awayVoice);
            u.rate = 0.85;
            u.lang = isHi ? "hi-IN" : "en-US";
            window.speechSynthesis.speak(u);
          }
        }
      },
      () => setStatus("unknown"),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHi]);

  // ── Save home ──────────────────────────────────────────
  const saveHome = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const home = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        localStorage.setItem("homeLocation", JSON.stringify(home));
        localStorage.setItem("safeRadius", String(safeRadius));
        setHomePos(home);
        setCurrentPos(home);
        setStatus("safe");
        setDistance(0);
        toast.success(labels.homeSuccess);
      },
      () => toast.error(labels.locationError)
    );
  };

  const c = CONFIG[status];

  return (
    <div className="relative">

      {/* Badge button */}
      <button
        onClick={() => setShowPopup(!showPopup)}
        className={`flex items-center gap-2 ${c.color} rounded-2xl px-4 py-2 font-ui text-sm font-medium transition-colors`}
      >
        <span>{c.icon}</span>
        <span>{c.label}</span>
        {distance !== null && status === "away" && (
          <span className="text-xs opacity-70">{distance}m</span>
        )}
      </button>

      {/* Popup */}
      {showPopup && (
        <div className="absolute right-0 top-12 w-80 card-warm p-5 z-50 shadow-warm-lg animate-slide-up">

          {/* Popup header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-ui font-semibold text-stone-warm">{labels.popupTitle}</h3>
            <button
              onClick={() => setShowPopup(false)}
              className="text-stone-light hover:text-stone-warm text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Status messages */}
          {status === "unknown" && (
            <p className="font-ui text-sm text-stone-light mb-4">{labels.unknownMsg}</p>
          )}

          {status === "safe" && (
            <p className="font-ui text-sm text-sage-500 mb-3">
              {labels.safeMsg}
              {distance !== null && (
                <span className="text-stone-light"> ({distance}m {labels.fromHome})</span>
              )}
            </p>
          )}

          {status === "away" && (
            <div className="bg-terracotta/10 rounded-2xl p-3 mb-3">
              <p className="font-ui text-sm text-terracotta font-medium">
                {labels.awayTitle} — {distance}m
              </p>
              <p className="font-ui text-xs text-stone-light mt-1">{labels.awayDesc}</p>
            </div>
          )}

          {/* Live Map */}
          {MapComponent && homePos && currentPos && (
            <div
              className="rounded-2xl overflow-hidden mb-3 border border-stone-lighter/40"
              style={{ height: 200 }}
            >
              <MapComponent
                home={homePos}
                current={currentPos}
                distance={distance ?? 0}
                safeRadius={safeRadius}
              />
            </div>
          )}

          {/* Distance info bar */}
          {distance !== null && homePos && (
            <div className="flex items-center justify-between bg-cream-100 rounded-xl px-3 py-2 mb-3">
              <span className="font-ui text-xs text-stone-light">{labels.distanceLabel}</span>
              <span
                className={`font-ui text-sm font-semibold ${
                  status === "safe" ? "text-sage-500" : "text-terracotta"
                }`}
              >
                {distance}m
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <button onClick={saveHome} className="btn-sage w-full text-sm py-2">
              {labels.setHomeBtn}
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="btn-secondary w-full text-sm py-2"
            >
              {labels.close}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}