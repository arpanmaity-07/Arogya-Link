import { MapContainer, TileLayer, CircleMarker, Popup, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility } from "@/lib/types";
import { FACILITY_COLORS, FACILITY_COORDS, HOME_POINT } from "@/lib/geo";

const homeIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#1d4ed8;border:3px solid white;box-shadow:0 0 0 4px rgba(29,78,216,.25)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function FacilityMap({
  facilities,
  selectedId,
  onSelect,
}: {
  facilities: (Facility & { km: number })[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const selected = facilities.find((f) => f.id === selectedId);
  const selectedCoords = selected ? FACILITY_COORDS[selected.id] : undefined;

  return (
    <MapContainer
      center={[24.3, 88.16]}
      zoom={10}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[HOME_POINT.lat, HOME_POINT.lng]} icon={homeIcon}>
        <Popup>You are here — {HOME_POINT.label}</Popup>
      </Marker>

      {selectedCoords && (
        <Polyline
          positions={[
            [HOME_POINT.lat, HOME_POINT.lng],
            [selectedCoords.lat, selectedCoords.lng],
          ]}
          pathOptions={{ color: "#1d4ed8", dashArray: "6 8", weight: 2 }}
        />
      )}

      {facilities.map((f) => {
        const c = FACILITY_COORDS[f.id];
        if (!c) return null;
        return (
          <CircleMarker
            key={f.id}
            center={[c.lat, c.lng]}
            radius={f.id === selectedId ? 14 : 10}
            pathOptions={{
              color: "white",
              weight: 2,
              fillColor: FACILITY_COLORS[f.type] ?? "#2b7fc4",
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect?.(f.id) }}
          >
            <Popup>
              <strong>{f.name}</strong>
              <br />
              {f.type} · {f.km} km away
              <br />
              {f.doctors} doctors · ~{f.waitMinutes} min wait
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
