/**
 * Live earthquake data from the USGS public feed (CORS-enabled, no API key).
 * Fetched directly from the browser — no backend required.
 * https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
 */

export interface Quake {
  id: string;
  mag: number;
  place: string;
  time: number;
  depth: number;
  lon: number;
  lat: number;
  url: string;
  tsunami: number;
  sig: number;
}

export type RangeId = "day" | "week";

const FEEDS: Record<RangeId, string> = {
  day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson",
};

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
    tsunami?: number;
    sig?: number;
  };
  geometry: { coordinates: [number, number, number] };
}

export async function fetchQuakes(range: RangeId): Promise<Quake[]> {
  const res = await fetch(FEEDS[range], { cache: "no-store" });
  if (!res.ok) throw new Error(`USGS ${res.status}`);
  const json = (await res.json()) as { features: UsgsFeature[] };
  return json.features
    .map((f) => ({
      id: f.id,
      mag: f.properties.mag ?? 0,
      place: f.properties.place ?? "—",
      time: f.properties.time,
      depth: f.geometry.coordinates[2],
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      url: f.properties.url,
      tsunami: f.properties.tsunami ?? 0,
      sig: f.properties.sig ?? 0,
    }))
    .filter((q) => q.mag >= 0)
    .sort((a, b) => b.time - a.time);
}

export interface QuakeStats {
  total: number;
  maxMag: number;
  maxPlace: string;
  avgMag: number;
  avgDepth: number;
  /** Sismos con magnitud >= 4.5 (umbral típico para "sentidos / dañinos"). */
  significantCount: number;
  /** Sismos marcados con alerta de tsunami por el USGS. */
  tsunamiCount: number;
  /** Energía total liberada en Joules (10^(1.5*M+4.8)). */
  totalEnergyJ: number;
  /** Counts grouped by magnitude band. */
  magBands: { label: string; count: number }[];
  /** Counts over time buckets (hour for day, day for week). */
  timeline: { label: string; count: number }[];
  /** Counts grouped by depth band: shallow / intermediate / deep. */
  depthBands: { label: string; count: number; tone: "indigo" | "cyan" | "amber" }[];
  /** Top regions extracted from the place strings (e.g. "Alaska", "Mexico"). */
  topRegions: { region: string; count: number }[];
  strongest: Quake[];
  /** Tsunami-flagged earthquakes, recent first. */
  tsunamis: Quake[];
}

/** Extract a region/country-ish token from a USGS `place` string. */
export function regionOf(place: string): string {
  const t = place.trim();
  if (!t) return "—";
  const parts = t.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1];
  return parts[0]
    .replace(/^\d+\s*km\s+[NSEW]+(?:[NSEW]+)?\s+of\s+/i, "")
    .replace(/^off\s+(the\s+)?coast\s+of\s+/i, "")
    .replace(/^south of |^north of |^east of |^west of /i, "");
}

export function computeStats(quakes: Quake[], range: RangeId): QuakeStats {
  if (quakes.length === 0) {
    return {
      total: 0,
      maxMag: 0,
      maxPlace: "—",
      avgMag: 0,
      avgDepth: 0,
      significantCount: 0,
      tsunamiCount: 0,
      totalEnergyJ: 0,
      magBands: [],
      timeline: [],
      depthBands: [],
      topRegions: [],
      strongest: [],
      tsunamis: [],
    };
  }

  const total = quakes.length;
  const strongestSorted = [...quakes].sort((a, b) => b.mag - a.mag);
  const maxMag = strongestSorted[0].mag;
  const maxPlace = strongestSorted[0].place;
  const avgMag = quakes.reduce((s, q) => s + q.mag, 0) / total;
  const avgDepth = quakes.reduce((s, q) => s + q.depth, 0) / total;

  const bands = [
    { label: "<1", min: -Infinity, max: 1 },
    { label: "1–2", min: 1, max: 2 },
    { label: "2–3", min: 2, max: 3 },
    { label: "3–4", min: 3, max: 4 },
    { label: "4–5", min: 4, max: 5 },
    { label: "5+", min: 5, max: Infinity },
  ];
  const magBands = bands.map((b) => ({
    label: b.label,
    count: quakes.filter((q) => q.mag >= b.min && q.mag < b.max).length,
  }));

  // Timeline buckets
  const now = Date.now();
  const buckets = range === "day" ? 24 : 7;
  const span = range === "day" ? 3600_000 : 86_400_000;
  const timeline = Array.from({ length: buckets }, (_, i) => {
    const idx = buckets - 1 - i; // oldest -> newest
    const start = now - (idx + 1) * span;
    const end = now - idx * span;
    const count = quakes.filter((q) => q.time >= start && q.time < end).length;
    const label =
      range === "day" ? `${idx === 0 ? "0" : `-${idx}`}h` : `-${idx}d`;
    return { label, count };
  });

  // ── Extra stats: significance, tsunamis, energy, depth bands, top regions
  const significantCount = quakes.filter((q) => q.mag >= 4.5).length;
  const tsunamiCount = quakes.filter((q) => q.tsunami === 1).length;
  const totalEnergyJ = quakes.reduce(
    (s, q) => (q.mag > 0 ? s + Math.pow(10, 1.5 * q.mag + 4.8) : s),
    0,
  );

  const depthBands = [
    {
      label: "0–70 km",
      tone: "cyan" as const,
      count: quakes.filter((q) => q.depth < 70).length,
    },
    {
      label: "70–300 km",
      tone: "indigo" as const,
      count: quakes.filter((q) => q.depth >= 70 && q.depth < 300).length,
    },
    {
      label: "> 300 km",
      tone: "amber" as const,
      count: quakes.filter((q) => q.depth >= 300).length,
    },
  ];

  const regionCounts = new Map<string, number>();
  for (const q of quakes) {
    const r = regionOf(q.place);
    regionCounts.set(r, (regionCounts.get(r) ?? 0) + 1);
  }
  const topRegions = [...regionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([region, count]) => ({ region, count }));

  const tsunamis = quakes.filter((q) => q.tsunami === 1).slice(0, 5);

  return {
    total,
    maxMag,
    maxPlace,
    avgMag,
    avgDepth,
    significantCount,
    tsunamiCount,
    totalEnergyJ,
    magBands,
    timeline,
    depthBands,
    topRegions,
    strongest: strongestSorted.slice(0, 8),
    tsunamis,
  };
}
