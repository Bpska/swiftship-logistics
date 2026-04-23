import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MarkerData {
  lat: number;
  lng: number;
  label: string;
  type: "pickup" | "drop" | "user";
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  className?: string;
  showUserLocation?: boolean;
  userPosition?: { lat: number; lng: number } | null;
}

function FitBounds({ markers }: { markers: MarkerData[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 13);
    }
  }, [markers, map]);
  return null;
}

export function MapView({
  center = [20.5937, 78.9629], // India center
  zoom = 5,
  markers = [],
  className = "",
  showUserLocation = false,
  userPosition,
}: MapViewProps) {
  const allMarkers = [...markers];
  if (showUserLocation && userPosition) {
    allMarkers.push({ lat: userPosition.lat, lng: userPosition.lng, label: "Your Location", type: "user" });
  }

  const getIcon = (type: MarkerData["type"]) => {
    switch (type) {
      case "pickup": return pickupIcon;
      case "drop": return dropIcon;
      case "user": return userIcon;
      default: return userIcon;
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl border ${className}`}>
      <MapContainer center={center} zoom={zoom} className="h-full w-full" style={{ minHeight: "300px" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allMarkers.length > 0 && <FitBounds markers={allMarkers} />}
        {allMarkers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]} icon={getIcon(m.type)}>
            <Popup>
              <span className="text-sm font-medium">{m.label}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
