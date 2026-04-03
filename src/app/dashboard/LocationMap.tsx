"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icons (broken in Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const homeIcon = L.divIcon({
  html: `<div style="font-size:24px;line-height:1;">🏠</div>`,
  className: "",
  iconAnchor: [12, 24],
});

const userIcon = L.divIcon({
  html: `<div style="
    width:14px;height:14px;
    background:#7CAF9E;
    border:2px solid white;
    border-radius:50%;
    box-shadow:0 0 6px rgba(124,175,158,0.8);
  "></div>`,
  className: "",
  iconAnchor: [7, 7],
});

// Auto-fit map bounds to show both home and current location
function FitBounds({ home, current }: { home: [number, number]; current: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([home, current]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [home, current, map]);
  return null;
}

type Props = {
  home: { lat: number; lng: number };
  current: { lat: number; lng: number };
  distance: number;
  safeRadius: number;
};

export default function LocationMap({ home, current, distance, safeRadius }: Props) {
  const isAway = distance > safeRadius;
  const circleColor = isAway ? "#D4704E" : "#7CAF9E";

  return (
    <MapContainer
      center={[home.lat, home.lng]}
      zoom={16}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Safe radius circle */}
      <Circle
        center={[home.lat, home.lng]}
        radius={safeRadius}
        pathOptions={{ color: circleColor, fillColor: circleColor, fillOpacity: 0.12, weight: 2 }}
      />

      {/* Home marker */}
      <Marker position={[home.lat, home.lng]} icon={homeIcon}>
        <Popup>🏠 Home</Popup>
      </Marker>

      {/* Current location marker */}
      <Marker position={[current.lat, current.lng]} icon={userIcon}>
        <Popup>📍 You are here ({distance}m from home)</Popup>
      </Marker>

      {/* Auto-fit bounds */}
      <FitBounds
        home={[home.lat, home.lng]}
        current={[current.lat, current.lng]}
      />
    </MapContainer>
  );
}