// Free OpenStreetMap Nominatim geocoder with in-memory + localStorage cache.
// Respects Nominatim's usage policy by caching and limiting to user-initiated lookups.

interface GeocodeResult {
  lat: number;
  lng: number;
  display_name: string;
}

const memoryCache = new Map<string, GeocodeResult | null>();
const STORAGE_KEY = "geocode-cache-v1";

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, GeocodeResult | null>;
      for (const [k, v] of Object.entries(parsed)) memoryCache.set(k, v);
    }
  } catch {
    /* ignore */
  }
}
loadCache();

function saveCache() {
  try {
    const obj: Record<string, GeocodeResult | null> = {};
    memoryCache.forEach((v, k) => (obj[k] = v));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 3) return null;
  if (memoryCache.has(q)) return memoryCache.get(q) ?? null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const result: GeocodeResult = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name,
      };
      memoryCache.set(q, result);
      saveCache();
      return result;
    }
    memoryCache.set(q, null);
    saveCache();
    return null;
  } catch (e) {
    console.warn("Geocode error:", e);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}
