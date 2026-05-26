"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Download,
  ExternalLink,
  Filter as FilterIcon,
  Flame,
  Gauge,
  Globe,
  Layers,
  RefreshCw,
  Waves,
  X,
  Zap,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  computeStats,
  fetchQuakes,
  regionOf,
  type Quake,
  type RangeId,
} from "@/lab/data/usgs";
import { LabShell } from "@/shared/components/lab/LabShell";
import { LabExplainer, explainerLabels } from "@/shared/components/lab/LabExplainer";
import { QuakeMap } from "@/shared/components/lab/QuakeMap";

// ============================================================================
// Helpers
// ============================================================================

function formatEnergy(j: number) {
  if (j >= 1e18) return `${(j / 1e18).toFixed(2)} EJ`;
  if (j >= 1e15) return `${(j / 1e15).toFixed(2)} PJ`;
  if (j >= 1e12) return `${(j / 1e12).toFixed(2)} TJ`;
  if (j >= 1e9) return `${(j / 1e9).toFixed(2)} GJ`;
  if (j >= 1e6) return `${(j / 1e6).toFixed(2)} MJ`;
  return `${j.toFixed(0)} J`;
}

function magBadge(mag: number) {
  if (mag >= 5) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (mag >= 3) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-cyan/15 text-cyan border-cyan/30";
}

function timeAgo(ts: number, locale: "es" | "en") {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60) return locale === "es" ? `hace ${m} min` : `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return locale === "es" ? `hace ${h} h` : `${h} h ago`;
  return locale === "es" ? `hace ${Math.floor(h / 24)} d` : `${Math.floor(h / 24)} d ago`;
}

// ============================================================================
// Filter model — clicking on a chart category cross-filters the whole dashboard
// ============================================================================

interface Filter {
  magBand?: string;
  depthBand?: string;
  region?: string;
  tsunamiOnly?: boolean;
}

function inMagBand(mag: number, band: string): boolean {
  if (band === "<1") return mag < 1;
  if (band === "1–2") return mag >= 1 && mag < 2;
  if (band === "2–3") return mag >= 2 && mag < 3;
  if (band === "3–4") return mag >= 3 && mag < 4;
  if (band === "4–5") return mag >= 4 && mag < 5;
  if (band === "5+") return mag >= 5;
  return true;
}

function inDepthBand(depth: number, band: string): boolean {
  if (band === "0–70 km") return depth < 70;
  if (band === "70–300 km") return depth >= 70 && depth < 300;
  if (band === "> 300 km") return depth >= 300;
  return true;
}

function matches(q: Quake, f: Filter): boolean {
  if (f.tsunamiOnly && q.tsunami !== 1) return false;
  if (f.region && regionOf(q.place) !== f.region) return false;
  if (f.magBand && !inMagBand(q.mag, f.magBand)) return false;
  if (f.depthBand && !inDepthBand(q.depth, f.depthBand)) return false;
  return true;
}

const hasAnyFilter = (f: Filter) =>
  Boolean(f.magBand || f.depthBand || f.region || f.tsunamiOnly);

// ============================================================================
// Bar charts (click to filter, highlight selected)
// ============================================================================

function MagBars({
  data,
  selected,
  onSelect,
}: {
  data: { label: string; count: number }[];
  selected?: string;
  onSelect?: (label: string) => void;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const active = selected === d.label;
        const dimmed = selected && !active;
        return (
          <button
            key={d.label}
            onClick={() => onSelect?.(d.label)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-1.5 py-1 text-left transition-colors",
              "hover:bg-surface-2/60",
              active && "bg-cyan/10",
            )}
          >
            <span
              className={cn(
                "w-8 shrink-0 text-right font-mono text-xs",
                active ? "text-cyan" : "text-text-faint",
              )}
            >
              {d.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className={cn(
                  "h-full rounded-full transition-[width,opacity] duration-500",
                  "bg-gradient-to-r from-indigo to-cyan",
                  dimmed && "opacity-30",
                )}
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
            <span
              className={cn(
                "w-10 shrink-0 text-right font-mono text-xs",
                active ? "text-cyan" : "text-text-dim",
              )}
            >
              {d.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DepthBars({
  data,
  total,
  locale,
  selected,
  onSelect,
}: {
  data: { label: string; count: number; tone: "indigo" | "cyan" | "amber" }[];
  total: number;
  locale: "es" | "en";
  selected?: string;
  onSelect?: (label: string) => void;
}) {
  const tones = { cyan: "bg-cyan", indigo: "bg-indigo", amber: "bg-amber-400" };
  const labels = {
    cyan: locale === "es" ? "Superficial" : "Shallow",
    indigo: locale === "es" ? "Intermedia" : "Intermediate",
    amber: locale === "es" ? "Profunda" : "Deep",
  };
  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-border">
        {data.map((d) => (
          <div
            key={d.label}
            className={cn("h-full transition-[width] duration-500", tones[d.tone])}
            style={{ width: total ? `${(d.count / total) * 100}%` : "0%" }}
            title={`${labels[d.tone]} (${d.label}): ${d.count}`}
          />
        ))}
      </div>
      <div className="space-y-1">
        {data.map((d) => {
          const pct = total ? Math.round((d.count / total) * 100) : 0;
          const active = selected === d.label;
          const dimmed = selected && !active;
          return (
            <button
              key={d.label}
              onClick={() => onSelect?.(d.label)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-surface-2/60",
                active && "bg-cyan/10",
                dimmed && "opacity-50",
              )}
            >
              <span className="inline-flex items-center gap-2 text-text-dim">
                <span className={cn("h-2 w-2 rounded-full", tones[d.tone])} />
                {labels[d.tone]} <span className="font-mono text-text-faint">{d.label}</span>
              </span>
              <span className="font-mono text-text-dim">
                {d.count} <span className="text-text-faint">· {pct}%</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RegionsList({
  data,
  selected,
  onSelect,
}: {
  data: { region: string; count: number }[];
  selected?: string;
  onSelect?: (r: string) => void;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="space-y-1">
      {data.map((r) => {
        const active = selected === r.region;
        const dimmed = selected && !active;
        return (
          <button
            key={r.region}
            onClick={() => onSelect?.(r.region)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-surface-2/60",
              active && "bg-cyan/10",
              dimmed && "opacity-50",
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-left text-xs",
                active ? "text-cyan" : "text-text-dim",
              )}
            >
              {r.region}
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo to-cyan"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
            <span
              className={cn(
                "w-7 shrink-0 text-right font-mono text-xs",
                active ? "text-cyan" : "text-text-dim",
              )}
            >
              {r.count}
            </span>
          </button>
        );
      })}
      {data.length === 0 && <p className="px-2 text-xs text-text-faint">—</p>}
    </div>
  );
}

// ============================================================================
// Active-filters chip strip
// ============================================================================

function FilterChips({
  filter,
  setFilter,
  locale,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
  locale: "es" | "en";
}) {
  if (!hasAnyFilter(filter)) return null;
  const chips: { key: keyof Filter; label: string }[] = [];
  if (filter.magBand) chips.push({ key: "magBand", label: `M ${filter.magBand}` });
  if (filter.depthBand) chips.push({ key: "depthBand", label: filter.depthBand });
  if (filter.region) chips.push({ key: "region", label: filter.region });
  if (filter.tsunamiOnly)
    chips.push({ key: "tsunamiOnly", label: locale === "es" ? "Tsunami" : "Tsunami" });
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-cyan/30 bg-cyan/[0.06] p-3">
      <FilterIcon size={13} className="text-cyan" />
      <span className="text-[11px] uppercase tracking-wider text-text-faint">
        {locale === "es" ? "Filtros activos" : "Active filters"}
      </span>
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/15 py-0.5 pl-2.5 pr-1 text-[11px] font-medium text-cyan"
        >
          {c.label}
          <button
            onClick={() => setFilter({ ...filter, [c.key]: undefined })}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-cyan/70 hover:bg-cyan/20 hover:text-cyan"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <button
        onClick={() => setFilter({})}
        className="ml-auto text-[11px] text-text-dim hover:text-text"
      >
        {locale === "es" ? "Limpiar todo" : "Clear all"}
      </button>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function DatosLabPage() {
  const { locale } = useLanguage();
  const [range, setRange] = useState<RangeId>("day");
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>({});

  const load = useCallback(async (r: RangeId) => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchQuakes(r);
      setQuakes(data);
      setUpdated(Date.now());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
    // Clear filter when range changes — categories may not exist anymore.
    setFilter({});
  }, [range, load]);

  // Two stats: one from the FULL set (drives the click-to-filter bars/lists),
  // one from the FILTERED set (drives the map, cards, and strongest list).
  const statsAll = useMemo(() => computeStats(quakes, range), [quakes, range]);
  const filteredQuakes = useMemo(
    () => quakes.filter((q) => matches(q, filter)),
    [quakes, filter],
  );
  const stats = useMemo(
    () => computeStats(filteredQuakes, range),
    [filteredQuakes, range],
  );

  const exportCsv = useCallback(() => {
    const header = "magnitude,place,time,depth_km,latitude,longitude,tsunami\n";
    const rows = filteredQuakes
      .map(
        (q) =>
          `${q.mag},"${q.place.replace(/"/g, "'")}",${new Date(q.time).toISOString()},${q.depth},${q.lat},${q.lon},${q.tsunami}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sismos-${range}${hasAnyFilter(filter) ? "-filtrado" : ""}.csv`;
    a.click();
  }, [filteredQuakes, range, filter]);

  // ── Toggle handlers: clicking the same category twice clears that filter ──
  const toggleMag = (b: string) =>
    setFilter((f) => ({ ...f, magBand: f.magBand === b ? undefined : b }));
  const toggleDepth = (b: string) =>
    setFilter((f) => ({ ...f, depthBand: f.depthBand === b ? undefined : b }));
  const toggleRegion = (r: string) =>
    setFilter((f) => ({ ...f, region: f.region === r ? undefined : r }));
  const toggleTsunami = () =>
    setFilter((f) => ({ ...f, tsunamiOnly: f.tsunamiOnly ? undefined : true }));

  const cards = [
    { icon: Activity, label: locale === "es" ? "Sismos" : "Earthquakes", value: stats.total },
    {
      icon: AlertTriangle,
      label: locale === "es" ? "Mag. máx." : "Max mag.",
      value: stats.maxMag.toFixed(1),
    },
    {
      icon: Gauge,
      label: locale === "es" ? "Mag. media" : "Avg mag.",
      value: stats.avgMag.toFixed(2),
    },
    {
      icon: Layers,
      label: locale === "es" ? "Prof. media" : "Avg depth",
      value: `${stats.avgDepth.toFixed(0)} km`,
    },
    {
      icon: Zap,
      label: locale === "es" ? "Significativos" : "Significant",
      value: stats.significantCount,
    },
    {
      icon: Flame,
      label: locale === "es" ? "Energía" : "Energy",
      value: formatEnergy(stats.totalEnergyJ),
    },
  ];

  return (
    <LabShell
      title={locale === "es" ? "Dashboard de sismos en vivo" : "Live earthquake dashboard"}
      subtitle={
        locale === "es"
          ? "Datos reales del USGS, en vivo en tu navegador. Haz clic en cualquier categoría para filtrar todo el tablero."
          : "Real USGS data, live in your browser. Click any category to cross-filter the whole dashboard."
      }
      accent="cyan"
    >
      <LabExplainer
        labels={explainerLabels(locale)}
        what={
          locale === "es"
            ? "Un tablero que muestra los sismos del mundo en vivo, con mapa, métricas y gráficas. Todo se puede filtrar haciendo clic."
            : "A dashboard showing live worldwide earthquakes with a map, metrics and charts. Everything is cross-filterable by clicking."
        }
        shows={
          locale === "es"
            ? "Ingeniería de datos y BI interactivo: consumir una API en vivo, agregar métricas, filtros cruzados y exportar a CSV."
            : "Data engineering & interactive BI: live API ingest, aggregate metrics, cross-filters and CSV export."
        }
        how={
          locale === "es"
            ? "Cambia entre Hoy/Semana. Haz clic en una barra de magnitud, profundidad o región para filtrar el resto del tablero. Vuelve a hacer clic para quitar el filtro."
            : "Switch between Today/Week. Click a magnitude, depth or region bar to filter the rest of the dashboard. Click again to clear that filter."
        }
      />

      {/* Top controls bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-border bg-surface/40 p-1">
          {(["day", "week"] as RangeId[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm transition-colors",
                range === r ? "bg-cyan/15 text-cyan" : "text-text-dim hover:text-text",
              )}
            >
              {r === "day"
                ? locale === "es"
                  ? "Hoy"
                  : "Today"
                : locale === "es"
                  ? "Semana"
                  : "Week"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {updated && (
            <span className="hidden text-xs text-text-faint sm:inline">
              {locale === "es" ? "Actualizado" : "Updated"} {timeAgo(updated, locale)}
            </span>
          )}
          <button
            onClick={exportCsv}
            disabled={filteredQuakes.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-dim transition-colors hover:border-cyan/60 hover:text-text disabled:opacity-40"
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={() => load(range)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-dim transition-colors hover:border-cyan/60 hover:text-text"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {locale === "es" ? "Actualizar" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-400">
          {locale === "es"
            ? "No se pudieron cargar los datos. Intenta actualizar."
            : "Could not load data. Try refreshing."}
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-border bg-surface/40 p-12 text-center text-sm text-text-dim">
          {locale === "es" ? "Cargando datos en vivo…" : "Loading live data…"}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* LEFT — Big map + strongest list */}
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text">
                  {locale === "es" ? "Mapa de sismos" : "Earthquake map"}
                </h3>
                <span className="text-xs text-text-faint">
                  {filteredQuakes.length}{" "}
                  {locale === "es"
                    ? hasAnyFilter(filter)
                      ? "filtrados"
                      : "en vivo"
                    : hasAnyFilter(filter)
                      ? "filtered"
                      : "live"}
                </span>
              </div>
              <QuakeMap quakes={filteredQuakes} />
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-text-faint">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan" /> &lt; 3
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> 3–5
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" /> 5+
                </span>
                <a
                  href="https://earthquake.usgs.gov/earthquakes/feed/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 hover:text-text"
                >
                  <ExternalLink size={11} />
                  {locale === "es" ? "Fuente: USGS" : "Source: USGS"}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface/40 p-4">
              <h3 className="mb-3 text-sm font-semibold text-text">
                {locale === "es" ? "Sismos más fuertes" : "Strongest earthquakes"}
              </h3>
              <div className="divide-y divide-border">
                {stats.strongest.length === 0 && (
                  <p className="py-2 text-sm text-text-faint">—</p>
                )}
                {stats.strongest.map((q) => (
                  <a
                    key={q.id}
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-2 text-text-dim transition-colors hover:text-text"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold",
                        magBadge(q.mag),
                      )}
                    >
                      {q.mag.toFixed(1)}
                    </span>
                    <span className="flex-1 text-sm">{q.place}</span>
                    {q.tsunami === 1 && (
                      <Waves size={13} className="text-amber-400" aria-label="tsunami" />
                    )}
                    <span className="hidden text-xs text-text-faint sm:inline">
                      {timeAgo(q.time, locale)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Stats + click-to-filter charts */}
          <aside className="space-y-4">
            <FilterChips filter={filter} setFilter={setFilter} locale={locale} />

            {/* Tsunami banner (also acts as a filter toggle) */}
            {statsAll.tsunamiCount > 0 && (
              <button
                onClick={toggleTsunami}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
                  filter.tsunamiOnly
                    ? "border-amber-400/60 bg-amber-400/10"
                    : "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10",
                )}
              >
                <Waves size={18} className="mt-0.5 flex-shrink-0 text-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-300">
                    {locale === "es"
                      ? `${statsAll.tsunamiCount} con alerta de tsunami`
                      : `${statsAll.tsunamiCount} flagged for tsunami`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-200/70">
                    {filter.tsunamiOnly
                      ? locale === "es"
                        ? "Filtro activo — clic para quitar"
                        : "Filter active — click to clear"
                      : locale === "es"
                        ? "Clic para filtrar el tablero"
                        : "Click to filter the dashboard"}
                  </p>
                </div>
              </button>
            )}

            {/* Compact stat grid 2×3 */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface/40 p-3">
              {cards.map((c) => (
                <div key={c.label} className="rounded-lg px-2 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-faint">
                    <c.icon size={11} className="text-cyan" />
                    {c.label}
                  </div>
                  <div className="mt-1 font-mono text-lg font-semibold text-text">
                    {c.value}
                  </div>
                </div>
              ))}
            </div>

            <Section
              icon={<AlertTriangle size={13} className="text-cyan" />}
              title={locale === "es" ? "Por magnitud" : "By magnitude"}
            >
              <MagBars
                data={statsAll.magBands}
                selected={filter.magBand}
                onSelect={toggleMag}
              />
            </Section>

            <Section
              icon={<Layers size={13} className="text-cyan" />}
              title={locale === "es" ? "Por profundidad" : "By depth"}
            >
              <DepthBars
                data={statsAll.depthBands}
                total={statsAll.total}
                locale={locale}
                selected={filter.depthBand}
                onSelect={toggleDepth}
              />
            </Section>

            <Section
              icon={<Globe size={13} className="text-cyan" />}
              title={locale === "es" ? "Regiones más activas" : "Most active regions"}
            >
              <RegionsList
                data={statsAll.topRegions}
                selected={filter.region}
                onSelect={toggleRegion}
              />
            </Section>
          </aside>
        </div>
      )}
    </LabShell>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-faint">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}
