export interface GeocodeResult {
  name: string;
  coords: [number, number]; // [lat, lon]
  displayName: string;
}

/** Nominatim (OpenStreetMap) free geocoding — no API key needed. */
export async function geocodePlace(query: string, countryHint?: string): Promise<GeocodeResult | null> {
  const q = countryHint ? `${query}, ${countryHint}` : query;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const first = data[0];
    if (!first) return null;
    return {
      name: query,
      coords: [parseFloat(first.lat), parseFloat(first.lon)],
      displayName: first.display_name,
    };
  } catch {
    return null;
  }
}

/** Great-circle distance in km between two [lat, lon] points. */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough driving-hours estimate from straight-line distance — used only when real routing fails. */
export function estimateDriveHours(a: [number, number], b: [number, number], avgKmh = 55): number {
  const straightKm = haversineKm(a, b);
  // roads rarely go in a straight line — pad distance to approximate real routing
  const roadKm = straightKm * 1.3;
  return roadKm / avgKmh;
}

export interface DriveEstimate {
  hours: number;
  real: boolean; // true = actual road routing (OSRM), false = straight-line fallback
}

/**
 * Real road driving time via OSRM's free public routing server (no API key —
 * unlike Google Maps' Directions API, which needs a billed key we don't have).
 * Falls back to the straight-line estimate if the request fails for any reason
 * (offline, rate-limited, route not found across water, etc).
 */
export async function realDriveHours(a: [number, number], b: [number, number]): Promise<DriveEstimate> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('osrm not ok');
    const data = await res.json();
    const seconds = data?.routes?.[0]?.duration;
    if (typeof seconds !== 'number') throw new Error('no route');
    return { hours: seconds / 3600, real: true };
  } catch {
    return { hours: estimateDriveHours(a, b), real: false };
  }
}

/** Public, no-key GeoJSON country boundaries dataset, keyed by ISO3 code. */
export async function fetchCountryOutline(iso3: string): Promise<[number, number][]> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/johan/world.geo.json/master/countries/${iso3}.geo.json`);
    if (!res.ok) return [];
    const data = await res.json();
    const geom = data.features?.[0]?.geometry;
    if (!geom) return [];
    // Polygon: [ [ [lon,lat], ... ] ]  MultiPolygon: [ [ [ [lon,lat], ... ] ], ... ] — take the largest ring
    const rings: [number, number][][] =
      geom.type === 'Polygon' ? geom.coordinates : geom.type === 'MultiPolygon' ? geom.coordinates.map((p: [number, number][][]) => p[0]) : [];
    if (!rings.length) return [];
    const biggest = rings.reduce((a, b) => (a.length > b.length ? a : b));
    return biggest;
  } catch {
    return [];
  }
}
