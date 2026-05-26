"use client";

import React, { useMemo, useState } from "react";
import {
  Brain,
  GitCompare,
  Hash,
  Network,
  Tag,
  Target,
  FileText,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { analyzeNlp, type KeywordPoint } from "@/lab/cv/nlp";

function pct(x: number) {
  return Math.round(x * 100);
}

function scoreColor(score: number) {
  if (score >= 60) return "text-cyan";
  if (score >= 30) return "text-amber-400";
  return "text-red-400";
}

interface Props {
  cv: string;
  job: string;
}

export function NlpPanel({ cv, job }: Props) {
  const { locale } = useLanguage();
  const result = useMemo(() => analyzeNlp(cv, job), [cv, job]);
  const [hover, setHover] = useState<KeywordPoint | null>(null);

  const cosinePct = pct(result.cosineSim);
  const jaccardPct = pct(result.jaccardSkills);

  return (
    <div>
      {/* Headline metrics — two NLP-classic similarity scores */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          icon={GitCompare}
          title={locale === "es" ? "Similitud coseno (TF-IDF)" : "Cosine similarity (TF-IDF)"}
          value={cosinePct}
          color={scoreColor(cosinePct)}
          hint={
            locale === "es"
              ? "Vectoriza ambos documentos con TF-IDF y mide el ángulo entre ellos. Es el método clásico de recuperación de información."
              : "Vectorizes both documents with TF-IDF and measures the angle between them. The classic information-retrieval method."
          }
        />
        <MetricCard
          icon={Target}
          title={locale === "es" ? "Similitud Jaccard (skills)" : "Jaccard similarity (skills)"}
          value={jaccardPct}
          color={scoreColor(jaccardPct)}
          hint={
            locale === "es"
              ? "|intersección| / |unión| de los skills detectados en cada documento."
              : "|intersection| / |union| of the skills detected in each document."
          }
        />
      </div>

      {/* 2D keyword map */}
      <section className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <Network size={16} className="text-indigo" />
          {locale === "es" ? "Mapa 2D de palabras (TF-IDF)" : "2D keyword map (TF-IDF)"}
        </h3>
        <p className="mb-4 text-xs text-text-dim">
          {locale === "es"
            ? "Cada punto es un término relevante. El eje X es su peso TF-IDF en la vacante, y el eje Y su peso en el CV. Los puntos arriba-derecha son lo que mejor te conecta con la oferta; los de la derecha (abajo) son lo que te falta."
            : "Each point is a relevant term. The X-axis is its TF-IDF weight in the posting, the Y-axis in the resume. Upper-right points are your strongest match; lower-right points are what you're missing."}
        </p>
        <KeywordMap points={result.keywordMap} onHover={setHover} locale={locale} />
        <div className="mt-2 h-5 text-xs text-text-dim">
          {hover ? (
            <span>
              <span className="font-mono text-text">{hover.term}</span>
              {" — "}
              {locale === "es" ? "vacante" : "posting"}:{" "}
              <span className="font-mono">{hover.freqJob}</span>, CV:{" "}
              <span className="font-mono">{hover.freqCv}</span>
            </span>
          ) : (
            <span className="text-text-faint">
              {locale === "es"
                ? "Pasa el cursor sobre un punto para ver detalle."
                : "Hover a point for details."}
            </span>
          )}
        </div>
      </section>

      {/* Top TF-IDF terms */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <TfidfList
          icon={FileText}
          title={locale === "es" ? "Top TF-IDF — tu CV" : "Top TF-IDF — your resume"}
          items={result.tfidfTopCv}
          color="cyan"
        />
        <TfidfList
          icon={Target}
          title={locale === "es" ? "Top TF-IDF — vacante" : "Top TF-IDF — posting"}
          items={result.tfidfTopJob}
          color="indigo"
        />
      </section>

      {/* N-grams */}
      <section className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <Hash size={16} className="text-indigo" />
          {locale === "es"
            ? "N-gramas frecuentes en la vacante"
            : "Frequent n-grams in the posting"}
        </h3>
        <p className="mb-3 text-xs text-text-dim">
          {locale === "es"
            ? "Frases compuestas que se repiten en la oferta — útiles para capturar skills multi-palabra que el matching de tokens sueltos pierde."
            : "Repeated multi-word phrases — useful for catching compound skills that single-token matching would miss."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-wide text-text-faint">Bigrams</div>
            <div className="flex flex-wrap gap-2">
              {result.bigrams.length === 0 && (
                <span className="text-xs text-text-faint">
                  {locale === "es" ? "Sin bigramas relevantes." : "No relevant bigrams."}
                </span>
              )}
              {result.bigrams.map((b) => (
                <span
                  key={b.gram}
                  className="rounded-full border border-indigo/30 bg-indigo/10 px-3 py-1 text-xs text-indigo"
                >
                  {b.gram}{" "}
                  <span className="font-mono text-text-faint">×{b.count}</span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-wide text-text-faint">Trigrams</div>
            <div className="flex flex-wrap gap-2">
              {result.trigrams.length === 0 && (
                <span className="text-xs text-text-faint">
                  {locale === "es" ? "Sin trigramas relevantes." : "No relevant trigrams."}
                </span>
              )}
              {result.trigrams.map((t) => (
                <span
                  key={t.gram}
                  className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan"
                >
                  {t.gram}{" "}
                  <span className="font-mono text-text-faint">×{t.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Named entities */}
      <section className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <Tag size={16} className="text-indigo" />
          {locale === "es"
            ? "Entidades nombradas (NER basado en reglas)"
            : "Named entities (rule-based NER)"}
        </h3>
        <p className="mb-3 text-xs text-text-dim">
          {locale === "es"
            ? "Reconocimiento ligero de entidades con expresiones regulares y diccionario: skills, porcentajes, montos, años y organizaciones."
            : "Lightweight entity recognition via regex + dictionary: skills, percentages, money, years, and organizations."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <EntityBlock
            title="CV"
            entities={result.entities.cv}
            color="cyan"
            locale={locale}
          />
          <EntityBlock
            title={locale === "es" ? "Vacante" : "Posting"}
            entities={result.entities.job}
            color="indigo"
            locale={locale}
          />
        </div>
      </section>

      {/* Method note */}
      <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-surface/30 px-4 py-3 text-xs text-text-dim">
        <Brain size={14} className="mt-0.5 shrink-0 text-indigo" />
        <p>
          {locale === "es"
            ? "Todo el procesamiento ocurre en tu navegador con TypeScript puro: tokenización, stemming en español, vectorización TF-IDF (con IDF suavizado tipo scikit-learn), similitud coseno, Jaccard, n-gramas y NER basado en reglas."
            : "All processing happens in your browser with pure TypeScript: tokenization, Spanish stemming, TF-IDF vectorization (sklearn-style smoothed IDF), cosine similarity, Jaccard, n-grams, and rule-based NER."}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

interface MetricCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: number;
  color: string;
  hint: string;
}

function MetricCard({ icon: Icon, title, value, color, hint }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-5">
      <div className="flex items-center gap-2 text-sm text-text-dim">
        <Icon size={16} className="text-indigo" />
        {title}
      </div>
      <div className={cn("mt-1 font-mono text-5xl font-bold tabular-nums", color)}>
        {value}
        <span className="text-2xl">%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo to-cyan transition-[width] duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-text-faint">{hint}</p>
    </div>
  );
}

interface KeywordMapProps {
  points: KeywordPoint[];
  onHover: (p: KeywordPoint | null) => void;
  locale: "es" | "en";
}

/** Deterministic small-integer hash (so jitter is stable across re-renders). */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

interface PlacedPoint {
  p: KeywordPoint;
  cx: number;
  cy: number;
  /** Final label position; null when no collision-free slot was found. */
  label: { x: number; y: number; anchor: "start" | "end" | "middle" } | null;
}

interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

function KeywordMap({ points, onHover, locale }: KeywordMapProps) {
  const W = 720;
  const H = 420;
  // Asymmetric padding: leave space outside the plot area for axis & quadrant labels.
  const PAD_L = 56;
  const PAD_R = 28;
  const PAD_T = 48;
  const PAD_B = 56;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  function colorFor(status: KeywordPoint["status"]) {
    if (status === "matched") return "rgb(34 211 238)"; // cyan
    if (status === "missing") return "rgb(251 191 36)"; // amber
    return "rgb(167 139 250)"; // violet
  }

  // 1) Rank by max importance and keep the top ~22 (avoids visual noise).
  const ranked = [...points]
    .sort((a, b) => Math.max(b.xJob, b.yCv) - Math.max(a.xJob, a.yCv))
    .slice(0, 22);

  // 2) Project to plot coordinates with sqrt scaling (spreads small weights).
  //    For points sitting exactly on an axis (freq=0 in one doc), apply a
  //    deterministic small jitter so they don't stack on top of each other.
  const projected: PlacedPoint[] = ranked.map((p) => {
    const h = hashStr(p.term);
    const jitterX = p.xJob === 0 ? ((h % 1000) / 1000) * 0.06 : 0;
    const jitterY = p.yCv === 0 ? (((h >>> 10) % 1000) / 1000) * 0.06 : 0;
    const sx = Math.sqrt(Math.min(1, p.xJob + jitterX));
    const sy = Math.sqrt(Math.min(1, p.yCv + jitterY));
    const cx = PAD_L + sx * plotW;
    const cy = H - PAD_B - sy * plotH;
    return { p, cx, cy, label: null };
  });

  // 3) Greedy collision-aware label placement.
  //    Try 4 anchor positions around each dot; skip the label if all collide.
  //    The dot is always drawn — only the label is dropped.
  const placedBoxes: LabelBox[] = [];

  // Reserve the quadrant-label corners so points don't overprint them.
  const quadrantBoxes: LabelBox[] = [
    { x: PAD_L, y: PAD_T - 28, w: 90, h: 16 }, // "Solo en CV" (top-left)
    { x: W - PAD_R - 110, y: PAD_T - 28, w: 110, h: 16 }, // "Coincide fuerte"
    { x: W - PAD_R - 110, y: H - PAD_B + 14, w: 110, h: 16 }, // "Falta en CV"
  ];
  placedBoxes.push(...quadrantBoxes);

  // Sort points by importance so the most relevant get first pick at slots.
  const order = projected
    .map((_, i) => i)
    .sort((a, b) => {
      const pa = projected[a].p;
      const pb = projected[b].p;
      return Math.max(pb.xJob, pb.yCv) - Math.max(pa.xJob, pa.yCv);
    });

  // Label only the top 14 — the rest stay as un-labelled dots (still hoverable).
  const MAX_LABELS = 14;
  const charW = 5.6;
  const labelH = 12;

  function tryPlace(idx: number) {
    const { p, cx, cy } = projected[idx];
    const w = p.term.length * charW + 4;
    const candidates: Array<{
      box: LabelBox;
      x: number;
      y: number;
      anchor: "start" | "end" | "middle";
    }> = [
      // right
      { box: { x: cx + 7, y: cy - labelH / 2, w, h: labelH }, x: cx + 7, y: cy + 3, anchor: "start" },
      // left
      { box: { x: cx - 7 - w, y: cy - labelH / 2, w, h: labelH }, x: cx - 7, y: cy + 3, anchor: "end" },
      // top
      { box: { x: cx - w / 2, y: cy - 10 - labelH, w, h: labelH }, x: cx, y: cy - 10, anchor: "middle" },
      // bottom
      { box: { x: cx - w / 2, y: cy + 10, w, h: labelH }, x: cx, y: cy + 18, anchor: "middle" },
    ];

    // Plot bounds (with a small margin) — labels must stay inside.
    const inBounds = (b: LabelBox) =>
      b.x >= 2 && b.y >= 2 && b.x + b.w <= W - 2 && b.y + b.h <= H - 2;

    for (const c of candidates) {
      if (!inBounds(c.box)) continue;
      if (placedBoxes.some((pb) => boxesOverlap(pb, c.box))) continue;
      placedBoxes.push(c.box);
      projected[idx].label = { x: c.x, y: c.y, anchor: c.anchor };
      return;
    }
  }

  for (let k = 0; k < Math.min(MAX_LABELS, order.length); k++) {
    tryPlace(order[k]);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/60">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((g) => {
          const x = PAD_L + g * plotW;
          const y = H - PAD_B - g * plotH;
          return (
            <g key={g} className="text-border">
              <line
                x1={x}
                y1={PAD_T}
                x2={x}
                y2={H - PAD_B}
                stroke="currentColor"
                strokeWidth={0.5}
              />
              <line
                x1={PAD_L}
                y1={y}
                x2={W - PAD_R}
                y2={y}
                stroke="currentColor"
                strokeWidth={0.5}
              />
            </g>
          );
        })}

        {/* axes */}
        <line
          x1={PAD_L}
          y1={H - PAD_B}
          x2={W - PAD_R}
          y2={H - PAD_B}
          stroke="currentColor"
          strokeWidth={1}
          className="text-text-faint"
        />
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={H - PAD_B}
          stroke="currentColor"
          strokeWidth={1}
          className="text-text-faint"
        />

        {/* axis labels (outside the plot) */}
        <text
          x={PAD_L + plotW / 2}
          y={H - 14}
          textAnchor="middle"
          className="fill-text-dim text-[11px]"
        >
          {locale === "es" ? "Peso TF-IDF en la vacante →" : "TF-IDF weight in posting →"}
        </text>
        <text
          x={-(PAD_T + plotH / 2)}
          y={16}
          transform="rotate(-90)"
          textAnchor="middle"
          className="fill-text-dim text-[11px]"
        >
          {locale === "es" ? "Peso TF-IDF en el CV →" : "TF-IDF weight in resume →"}
        </text>

        {/* quadrant labels — placed above/below the plot so they never overlap points */}
        <text x={PAD_L} y={PAD_T - 14} className="fill-violet-300 text-[10px]">
          {locale === "es" ? "← Solo en CV" : "← Only in CV"}
        </text>
        <text
          x={W - PAD_R}
          y={PAD_T - 14}
          textAnchor="end"
          className="fill-cyan text-[10px]"
        >
          {locale === "es" ? "Coincide fuerte ↗" : "Strong match ↗"}
        </text>
        <text
          x={W - PAD_R}
          y={H - PAD_B + 28}
          textAnchor="end"
          className="fill-amber-400 text-[10px]"
        >
          {locale === "es" ? "Falta en CV ↘" : "Missing in CV ↘"}
        </text>

        {/* points + labels */}
        {projected.map(({ p, cx, cy, label }) => {
          const c = colorFor(p.status);
          return (
            <g
              key={p.term}
              onMouseEnter={() => onHover(p)}
              onMouseLeave={() => onHover(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={c}
                fillOpacity={0.55}
                stroke={c}
                strokeWidth={1.2}
              />
              {label && (
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  className="fill-text-dim text-[10px]"
                  style={{ pointerEvents: "none" }}
                >
                  {p.term}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border bg-surface/40 px-4 py-2 text-[11px] text-text-dim">
        <LegendDot color="rgb(34 211 238)" label={locale === "es" ? "Coincide" : "Matched"} />
        <LegendDot
          color="rgb(251 191 36)"
          label={locale === "es" ? "Falta en CV" : "Missing in CV"}
        />
        <LegendDot
          color="rgb(167 139 250)"
          label={locale === "es" ? "Solo en CV" : "Only in CV"}
        />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 0 1px ${color} inset` }}
      />
      {label}
    </span>
  );
}

interface TfidfListProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  items: { term: string; weight: number }[];
  color: "cyan" | "indigo";
}

function TfidfList({ icon: Icon, title, items, color }: TfidfListProps) {
  const max = Math.max(...items.map((i) => i.weight), 1e-6);
  const barColor = color === "cyan" ? "bg-cyan" : "bg-indigo";
  const iconColor = color === "cyan" ? "text-cyan" : "text-indigo";

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
        <Icon size={16} className={iconColor} />
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it.term} className="flex items-center gap-3 text-xs">
            <span className="w-28 truncate font-mono text-text">{it.term}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <span
                className={cn("block h-full rounded-full", barColor)}
                style={{ width: `${(it.weight / max) * 100}%` }}
              />
            </span>
            <span className="w-12 text-right font-mono text-text-faint">
              {it.weight.toFixed(2)}
            </span>
          </li>
        ))}
        {items.length === 0 && <li className="text-xs text-text-faint">—</li>}
      </ul>
    </div>
  );
}

interface EntityBlockProps {
  title: string;
  entities: import("@/lab/cv/nlp").Entities;
  color: "cyan" | "indigo";
  locale: "es" | "en";
}

function EntityBlock({ title, entities, color, locale }: EntityBlockProps) {
  const border = color === "cyan" ? "border-cyan/30" : "border-indigo/30";
  const bg = color === "cyan" ? "bg-cyan/5" : "bg-indigo/5";

  const groups: { label: string; items: string[] }[] = [
    { label: locale === "es" ? "Skills" : "Skills", items: entities.skills },
    {
      label: locale === "es" ? "Organizaciones" : "Organizations",
      items: entities.organizations,
    },
    { label: locale === "es" ? "Años" : "Years", items: entities.years },
    { label: locale === "es" ? "Porcentajes" : "Percentages", items: entities.percentages },
    { label: locale === "es" ? "Montos" : "Money", items: entities.money },
  ];

  return (
    <div className={cn("rounded-xl border p-4", border, bg)}>
      <div className="mb-2 text-xs font-semibold text-text">{title}</div>
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="text-[10px] uppercase tracking-wide text-text-faint">
              {g.label}{" "}
              <span className="font-mono">({g.items.length})</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {g.items.length === 0 && (
                <span className="text-[11px] text-text-faint">—</span>
              )}
              {g.items.map((it) => (
                <span
                  key={it}
                  className="rounded-md border border-border bg-surface/60 px-2 py-0.5 text-[11px] text-text-dim"
                >
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
