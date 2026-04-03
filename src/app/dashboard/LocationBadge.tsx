"use client";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

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
  const [status, setStatus] = useState<Status>("unknown");
  const [distance, setDistance] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [homePos, setHomePos] = useState<{ lat: number; lng: number } | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    home: { lat: number; lng: number };
    current: { lat: number; lng: number };
    distance: number;
    safeRadius: number;
  }> | null>(null);
  const hasSpokenRef = useRef(false);
  const safeRadius = 200;

  // Dynamically load Leaflet map to avoid SSR issues
  useEffect(() => {
    import("./LocationMap").then((mod) => {
      setMapComponent(() => mod.default);
    }).catch(() => {
      // Leaflet not available, map won't show
    });
  }, []);

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
            const u = new SpeechSynthesisUtterance(
              "You seem to be away from home. Please check with a family member."
            );
            u.rate = 0.85;
            window.speechSynthesis.speak(u);
          }
        }
      },
      () => setStatus("unknown"),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const saveHome = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const home = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        localStorage.setItem("homeLocation", JSON.stringify(home));
        setHomePos(home);
        setCurrentPos(home);
        setStatus("safe");
        setDistance(0);
        toast.success("Home location saved! 🏡");
      },
      () => toast.error("Could not get location. Please allow permission first.")
    );
  };

  const CONFIG: Record<Status, { color: string; icon: string; label: string }> = {
    safe:    { color: "bg-sage/15 text-sage-500",         icon: "🏡", label: "Safe" },
    away:    { color: "bg-terracotta/15 text-terracotta", icon: "⚠️", label: "Away" },
    unknown: { color: "bg-cream-200 text-stone-warm",     icon: "📍", label: "Location" },
  };
  const c = CONFIG[status];

  return (
    <div className="relative">
      {/* Badge button — same style as Emergency button */}
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-ui font-semibold text-stone-warm">📍 Location Safety</h3>
            <button
              onClick={() => setShowPopup(false)}
              className="text-stone-light hover:text-stone-warm text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Status message */}
          {status === "unknown" && (
            <p className="font-ui text-sm text-stone-light mb-4">
              Set your home location so we can keep you safe.
            </p>
          )}
          {status === "safe" && (
            <p className="font-ui text-sm text-sage-500 mb-3">
              ✅ You are safely within your home area.
              {distance !== null && <span className="text-stone-light"> ({distance}m from home)</span>}
            </p>
          )}
          {status === "away" && (
            <div className="bg-terracotta/10 rounded-2xl p-3 mb-3">
              <p className="font-ui text-sm text-terracotta font-medium">
                ⚠️ You are {distance}m from home
              </p>
              <p className="font-ui text-xs text-stone-light mt-1">
                Your safe radius is {safeRadius}m. Consider heading back.
              </p>
            </div>
          )}

          {/* Live Map */}
          {MapComponent && homePos && currentPos && (
            <div className="rounded-2xl overflow-hidden mb-3 border border-stone-lighter/40" style={{ height: 200 }}>
              <MapComponent
                home={homePos}
                current={currentPos}
                distance={distance ?? 0}
                safeRadius={safeRadius}
              />
            </div>
          )}

          {/* Distance info */}
          {distance !== null && homePos && (
            <div className="flex items-center justify-between bg-cream-100 rounded-xl px-3 py-2 mb-3">
              <span className="font-ui text-xs text-stone-light">Distance from home</span>
              <span className={`font-ui text-sm font-semibold ${status === "safe" ? "text-sage-500" : "text-terracotta"}`}>
                {distance}m
              </span>
            </div>
          )}

          <div className="space-y-2">
            <button onClick={saveHome} className="btn-sage w-full text-sm py-2">
              📍 Set Current Location as Home
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="btn-secondary w-full text-sm py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}