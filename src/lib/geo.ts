export const HOME_POINT = { lat: 24.4712, lng: 88.0752, label: "Jangipur, Murshidabad" };

export const FACILITY_COORDS: Record<string, { lat: number; lng: number }> = {
  F1: { lat: 24.4695, lng: 88.0703 },
  F2: { lat: 24.4468, lng: 88.0534 },
  F3: { lat: 24.1005, lng: 88.2512 },
  F4: { lat: 24.1298, lng: 88.2703 },
  F5: { lat: 24.4204, lng: 88.1211 },
};

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export const FACILITY_COLORS: Record<string, string> = {
  PHC: "#2f9e6e",
  CHC: "#2b7fc4",
  "District Hospital": "#8b5cf6",
  "Specialist Hospital": "#e0553b",
};
