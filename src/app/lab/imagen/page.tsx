"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Crop,
  Download,
  History as HistoryIcon,
  ImagePlus,
  Maximize2,
  RotateCcw,
  ScanLine,
  Sliders,
  Type,
  X,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  applyFilter,
  computeHistogram,
  levels,
  type FilterId,
} from "@/lab/image/filters";
import {
  ASPECT_PRESETS,
  addWatermark,
  cropToAspect,
  documentScan,
  downloadBlob,
  formatBytes,
  imageDataToCanvas,
  resizeImage,
  toBlobSize,
  type ExportFormat,
  type WatermarkPosition,
} from "@/lab/image/studio";
import { LabShell } from "@/shared/components/lab/LabShell";
import { LabExplainer, explainerLabels } from "@/shared/components/lab/LabExplainer";

const MAX_DIM = 1600;

type TabId = "filters" | "levels" | "scan" | "social" | "resize";

interface TabDef {
  id: TabId;
  es: string;
  en: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TABS: TabDef[] = [
  { id: "filters", es: "Filtros", en: "Filters", icon: Sliders },
  { id: "levels", es: "Niveles", en: "Levels", icon: BarChart3 },
  { id: "scan", es: "Escáner", en: "Scanner", icon: ScanLine },
  { id: "social", es: "Redes", en: "Social", icon: Crop },
  { id: "resize", es: "Redimensionar", en: "Resize", icon: Maximize2 },
];

interface FilterDef {
  id: FilterId;
  es: string;
  en: string;
  group: "color" | "bin" | "filtro" | "morf";
}

const FILTERS: FilterDef[] = [
  { id: "grayscale", es: "Escala de grises", en: "Grayscale", group: "color" },
  { id: "red", es: "Canal R", en: "R channel", group: "color" },
  { id: "green", es: "Canal G", en: "G channel", group: "color" },
  { id: "blue", es: "Canal B", en: "B channel", group: "color" },
  { id: "invert", es: "Invertir", en: "Invert", group: "color" },
  { id: "sepia", es: "Sepia", en: "Sepia", group: "color" },
  { id: "threshold", es: "Umbral", en: "Threshold", group: "bin" },
  { id: "equalize", es: "Ecualizar histograma", en: "Equalize histogram", group: "bin" },
  { id: "blur", es: "Desenfoque", en: "Blur", group: "filtro" },
  { id: "sobel", es: "Bordes (Sobel)", en: "Edges (Sobel)", group: "filtro" },
  { id: "noise", es: "Ruido", en: "Noise", group: "filtro" },
  { id: "erode", es: "Erosión", en: "Erosion", group: "morf" },
  { id: "dilate", es: "Dilatación", en: "Dilation", group: "morf" },
];

const GROUPS: { id: FilterDef["group"]; es: string; en: string }[] = [
  { id: "color", es: "Color", en: "Color" },
  { id: "bin", es: "Binarización", en: "Binarization" },
  { id: "filtro", es: "Filtros", en: "Filters" },
  { id: "morf", es: "Morfología", en: "Morphology" },
];

function paramConfig(id: FilterId) {
  if (id === "noise") return { min: 0, max: 100, def: 20, es: "Cantidad", en: "Amount" };
  if (id === "threshold" || id === "erode" || id === "dilate")
    return { min: 0, max: 255, def: 128, es: "Umbral", en: "Threshold" };
  return null;
}

const FORMATS: { id: ExportFormat; label: string; ext: string }[] = [
  { id: "image/jpeg", label: "JPEG", ext: "jpg" },
  { id: "image/webp", label: "WebP", ext: "webp" },
  { id: "image/png", label: "PNG", ext: "png" },
];

const WM_POSITIONS: { id: WatermarkPosition; es: string; en: string }[] = [
  { id: "top-left", es: "Sup. izq.", en: "Top left" },
  { id: "top-right", es: "Sup. der.", en: "Top right" },
  { id: "center", es: "Centro", en: "Center" },
  { id: "bottom-left", es: "Inf. izq.", en: "Bottom left" },
  { id: "bottom-right", es: "Inf. der.", en: "Bottom right" },
];

const CARD = "rounded-2xl border border-border bg-surface/40 p-5";
const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo to-cyan px-5 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";
const SECONDARY_BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-text-dim transition-colors hover:border-cyan/60 hover:text-text disabled:opacity-40";

/** Synthetic sunset-landscape sample (sky + sun + mountains). */
function generateLandscape(): ImageData | null {
  const W = 1000;
  const H = 600;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  // Sky gradient (sunset)
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#1a103f");
  sky.addColorStop(0.35, "#5b21b6");
  sky.addColorStop(0.6, "#ec4899");
  sky.addColorStop(0.82, "#f59e0b");
  sky.addColorStop(1, "#1a1d27");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 40; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * 180;
    const s = Math.random() < 0.2 ? 2 : 1.2;
    ctx.fillRect(sx, sy, s, s);
  }

  // Sun glow
  const sunX = 720;
  const sunY = 250;
  const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 240);
  glow.addColorStop(0, "rgba(255,238,180,0.95)");
  glow.addColorStop(0.4, "rgba(255,160,90,0.35)");
  glow.addColorStop(1, "rgba(255,160,90,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 240, sunY - 240, 480, 480);

  // Sun disc
  ctx.fillStyle = "#fff3cf";
  ctx.beginPath();
  ctx.arc(sunX, sunY, 58, 0, Math.PI * 2);
  ctx.fill();

  // Distant mountains
  ctx.fillStyle = "rgba(91, 33, 182, 0.55)";
  ctx.beginPath();
  ctx.moveTo(0, 430);
  ctx.lineTo(160, 330);
  ctx.lineTo(330, 410);
  ctx.lineTo(520, 305);
  ctx.lineTo(720, 385);
  ctx.lineTo(880, 320);
  ctx.lineTo(W, 365);
  ctx.lineTo(W, 470);
  ctx.lineTo(0, 470);
  ctx.closePath();
  ctx.fill();

  // Near mountains
  ctx.fillStyle = "#15172b";
  ctx.beginPath();
  ctx.moveTo(0, 510);
  ctx.lineTo(120, 425);
  ctx.lineTo(260, 475);
  ctx.lineTo(430, 380);
  ctx.lineTo(590, 470);
  ctx.lineTo(770, 395);
  ctx.lineTo(900, 470);
  ctx.lineTo(W, 415);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Foreground band
  ctx.fillStyle = "#0a0c11";
  ctx.fillRect(0, 545, W, H - 545);

  return ctx.getImageData(0, 0, W, H);
}

function clone(d: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(d.data), d.width, d.height);
}

/** A single step in the editing pipeline. `apply` runs on whatever image
 * comes in, so removing one op simply re-runs the rest in order. */
interface Op {
  id: string;
  label: string;
  apply: (input: ImageData) => ImageData;
}

export default function ImagenLabPage() {
  const { locale } = useLanguage();
  const t = useCallback((es: string, en: string) => (locale === "es" ? es : en), [locale]);

  // ---- Image state: original (uploaded/sample) + ops pipeline ----
  const [original, setOriginal] = useState<ImageData | null>(null);
  const [ops, setOps] = useState<Op[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [baseName, setBaseName] = useState<string>("paisaje");
  const [originalBytes, setOriginalBytes] = useState<number>(0);

  // The visible image is the original with every op applied in order.
  // Re-computed from scratch, so removing any op just re-runs the rest.
  const current = useMemo<ImageData | null>(() => {
    if (!original) return null;
    let img = clone(original);
    for (const op of ops) img = op.apply(img);
    return img;
  }, [original, ops]);

  // Optional live preview from the active panel (e.g. Levels sliders),
  // shown on the canvas + histogram BEFORE the op is committed.
  const [livePreview, setLivePreview] = useState<ImageData | null>(null);
  const displayed = livePreview ?? current;

  const [tab, setTab] = useState<TabId>("filters");
  const [format, setFormat] = useState<ExportFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.85);
  const [encodedBytes, setEncodedBytes] = useState<number | null>(null);
  const [encodedBlob, setEncodedBlob] = useState<Blob | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mount: generate landscape sample.
  useEffect(() => {
    const data = generateLandscape();
    if (!data) return;
    setOriginal(data);
    setOps([]);
    setFileName(locale === "es" ? "paisaje de ejemplo" : "sample landscape");
    setBaseName("paisaje");
    // Measure original baseline size (PNG).
    const c = imageDataToCanvas(data);
    c.toBlob((b) => b && setOriginalBytes(b.size), "image/png");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Paint the visible image (live preview if any, else current) into the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !displayed) return;
    canvas.width = displayed.width;
    canvas.height = displayed.height;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.putImageData(displayed, 0, 0);
  }, [displayed]);

  // Re-encode the displayed image with the chosen format/quality (size + download).
  useEffect(() => {
    if (!displayed) return;
    let cancelled = false;
    toBlobSize(displayed, format, quality)
      .then((r) => {
        if (cancelled) return;
        setEncodedBytes(r.bytes);
        setEncodedBlob(r.blob);
      })
      .catch(() => {
        if (!cancelled) {
          setEncodedBytes(null);
          setEncodedBlob(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [current, format, quality]);

  // ---- Pipeline helpers ----
  const addOp = useCallback((op: Op) => {
    setOps((prev) => [...prev, op]);
  }, []);

  const removeOp = useCallback((index: number) => {
    setOps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setOps([]);
  }, []);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setBaseName(file.name.replace(/\.[^.]+$/, "") || "imagen");
      setOriginalBytes(file.size);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h);
        setOriginal(data);
        setOps([]);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    },
    [],
  );

  const handleDownload = useCallback(() => {
    if (!encodedBlob) return;
    const ext = FORMATS.find((f) => f.id === format)?.ext ?? "img";
    downloadBlob(encodedBlob, `${baseName}-editado.${ext}`);
  }, [encodedBlob, format, baseName]);

  const reduction =
    originalBytes && encodedBytes ? Math.round((1 - encodedBytes / originalBytes) * 100) : null;

  const isPng = format === "image/png";

  return (
    <LabShell
      title={locale === "es" ? "Image Studio" : "Image Studio"}
      subtitle={
        locale === "es"
          ? "Editor de imágenes encadenable: aplica filtros, escanea, recorta y redimensiona en cadena — la imagen va evolucionando con cada paso. Todo en tu navegador."
          : "Chainable image editor: apply filters, scan, crop and resize in sequence — the image evolves with every step. All in your browser."
      }
      accent="cyan"
    >
      <LabExplainer
        labels={explainerLabels(locale)}
        what={
          locale === "es"
            ? "Un editor de imágenes que encadena operaciones: aplicas un filtro, luego recortas, luego comprimes — todo se acumula sobre la misma imagen."
            : "An image editor that chains operations: apply a filter, then crop, then compress — everything stacks on the same image."
        }
        shows={
          locale === "es"
            ? "Procesamiento digital de imágenes y visión por computadora puro Canvas API (sin librerías), con pipeline de operaciones encadenables."
            : "Pure Canvas-API digital image processing and computer vision (no libraries), with a chainable operation pipeline."
        }
        how={
          locale === "es"
            ? "Sube tu foto (o usa el paisaje de ejemplo), elige una pestaña, aplica una operación y repite. «Restablecer» vuelve a la imagen original."
            : "Upload your photo (or use the sample landscape), pick a tab, apply an operation and repeat. «Reset» returns to the original image."
        }
      />

      {/* Upload bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className={cn(PRIMARY_BTN, "cursor-pointer")}>
          <ImagePlus size={16} />
          {t("Subir imagen", "Upload image")}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
        <span className="text-xs text-text-faint">
          {fileName}
          {original ? (
            <span className="ml-2 font-mono text-text-dim">
              {original.width}×{original.height}px
              {originalBytes ? ` · ${formatBytes(originalBytes)}` : ""}
            </span>
          ) : null}
        </span>
      </div>

      {/* Two-column layout: canvas + pipeline stay visible (sticky) while
          tabs and panels scroll on the right. */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* LEFT: live canvas + applied-operations toolbar (sticky on desktop) */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-center rounded-2xl border border-border bg-surface/40 p-4">
            <canvas ref={canvasRef} className="max-h-[62vh] w-auto max-w-full rounded-lg" />
          </div>

          {/* Live histogram of the displayed image — always visible */}
          {displayed && (
            <div className="rounded-2xl border border-border bg-surface/40 p-3">
              <HistogramView data={displayed} />
            </div>
          )}

          {/* Compact pipeline: chips + per-step X to remove */}
          <div className="space-y-3 rounded-2xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-text-faint">
                <HistoryIcon size={12} />
                {t("Operaciones aplicadas", "Applied operations")}
                <span className="font-mono text-text-dim">({ops.length})</span>
              </div>
              <button
                onClick={reset}
                disabled={!ops.length}
                className={cn(SECONDARY_BTN, "!py-1.5 !text-xs")}
              >
                <RotateCcw size={12} />
                {t("Restablecer", "Reset")}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ops.length === 0 ? (
                <span className="text-xs text-text-faint">
                  {t(
                    "Ninguna aún — aplica algo a la derecha.",
                    "None yet — apply something on the right.",
                  )}
                </span>
              ) : (
                ops.map((op, i) => (
                  <span
                    key={`${op.id}-${i}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 py-1 pl-2.5 pr-1 text-[11px] font-medium text-cyan"
                  >
                    <span className="font-mono text-text-faint">{i + 1}.</span>
                    {op.label}
                    <button
                      onClick={() => removeOp(i)}
                      aria-label={t("Quitar este paso", "Remove this step")}
                      title={t("Quitar este paso", "Remove this step")}
                      className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-cyan/70 transition-colors hover:bg-cyan/20 hover:text-cyan"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: tabs + active panel + export */}
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tb) => {
              const Icon = tb.icon;
              const active = tab === tb.id;
              return (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-cyan/30 bg-cyan/10 text-cyan"
                      : "border-border text-text-dim hover:border-cyan/60 hover:text-text",
                  )}
                >
                  <Icon size={15} />
                  {t(tb.es, tb.en)}
                </button>
              );
            })}
          </div>

          {current && (
            <div className={CARD}>
              {tab === "filters" && <FiltersPanel addOp={addOp} locale={locale} t={t} />}
              {tab === "levels" && (
                <LevelsPanel
                  current={current}
                  addOp={addOp}
                  onPreview={setLivePreview}
                  t={t}
                />
              )}
              {tab === "scan" && <ScanPanel addOp={addOp} t={t} />}
              {tab === "social" && <SocialPanel addOp={addOp} locale={locale} t={t} />}
              {tab === "resize" && <ResizePanel current={current} addOp={addOp} t={t} />}
            </div>
          )}

          {/* Export panel — format / quality / download */}
          <div className={cn(CARD, "space-y-3")}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-faint">
                {t("Exportar", "Export")}
              </p>
              <span className="text-xs text-text-faint">
                {encodedBytes != null ? formatBytes(encodedBytes) : "…"}
                {reduction != null && (
                  <span
                    className={cn(
                      "ml-1.5 font-mono",
                      reduction > 0 ? "text-emerald-400" : "text-text-dim",
                    )}
                  >
                    {reduction > 0 ? "−" : "+"}
                    {Math.abs(reduction)}%
                  </span>
                )}
              </span>
            </div>
            <div className="flex gap-1.5">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "flex-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    format === f.id
                      ? "border-cyan/50 bg-cyan/15 text-cyan"
                      : "border-border text-text-dim hover:text-text",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-faint">{t("Calidad", "Quality")}</span>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                disabled={isPng}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="flex-1 accent-cyan disabled:opacity-40"
              />
              <span className="w-8 text-right font-mono text-text">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <button
              onClick={handleDownload}
              disabled={!encodedBlob}
              className={cn(PRIMARY_BTN, "w-full")}
            >
              <Download size={14} />
              {t("Descargar", "Download")}
            </button>
          </div>
        </div>
      </div>
    </LabShell>
  );
}

type TFn = (es: string, en: string) => string;

// ============================================================================
// FILTERS: click applies the filter to the CURRENT image (chainable).
// ============================================================================

function FiltersPanel({
  addOp,
  locale,
  t,
}: {
  addOp: (op: Op) => void;
  locale: "es" | "en";
  t: TFn;
}) {
  const [param, setParam] = useState(128);
  const [paramFor, setParamFor] = useState<FilterId | null>(null);
  const cfg = paramFor ? paramConfig(paramFor) : null;

  const handleClick = (id: FilterId) => {
    const c = paramConfig(id);
    if (c && paramFor !== id) {
      // First click on a parameterized filter: just show the slider.
      setParamFor(id);
      setParam(c.def);
      return;
    }
    const def = FILTERS.find((f) => f.id === id);
    const label = def ? (locale === "es" ? def.es : def.en) : id;
    const p = c ? param : 128;
    addOp({
      id: `filter-${id}-${p}`,
      label,
      apply: (img) => applyFilter(img, id, p),
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-text-dim">
        {t(
          "Cada clic aplica el filtro encima de la imagen actual. Los filtros con parámetro abren un deslizador; vuelve a hacer clic para aplicar.",
          "Each click applies the filter on top of the current image. Parameterized filters open a slider; click again to apply.",
        )}
      </p>

      {cfg && (
        <div className="rounded-xl border border-cyan/30 bg-cyan/5 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-text-dim">
            <span>{locale === "es" ? cfg.es : cfg.en}</span>
            <span className="font-mono text-text">{param}</span>
          </div>
          <input
            type="range"
            min={cfg.min}
            max={cfg.max}
            value={param}
            onChange={(e) => setParam(Number(e.target.value))}
            className="w-full accent-cyan"
          />
          <p className="mt-2 text-[11px] text-text-faint">
            {t("Vuelve a presionar el filtro para aplicarlo.", "Press the filter again to apply.")}
          </p>
        </div>
      )}

      {GROUPS.map((g) => (
        <div key={g.id}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
            {locale === "es" ? g.es : g.en}
          </p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.filter((f) => f.group === g.id).map((f) => {
              const isActive = paramFor === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleClick(f.id)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-cyan/50 bg-cyan/15 text-cyan"
                      : "border-border text-text-dim hover:border-text-faint hover:text-text",
                  )}
                >
                  {locale === "es" ? f.es : f.en}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SCAN: contrast slider + Apply button.
// ============================================================================

function ScanPanel({
  addOp,
  t,
}: {
  addOp: (op: Op) => void;
  t: TFn;
}) {
  const [contrast, setContrast] = useState(1.35);
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-text-dim">
        {t(
          "Convierte la imagen actual en un escaneo blanco y negro: grises, refuerzo de contraste y umbral automático (Otsu).",
          "Turns the current image into a black & white scan: grayscale, contrast boost and automatic (Otsu) thresholding.",
        )}
      </p>
      <SliderRow
        label={t("Contraste", "Contrast")}
        value={`${contrast.toFixed(2)}×`}
        min={1}
        max={2.5}
        step={0.05}
        current={contrast}
        onChange={setContrast}
      />
      <button
        onClick={() => {
          const c = contrast;
          addOp({
            id: `scan-${c.toFixed(2)}`,
            label: t("Escaneo (Otsu)", "Scan (Otsu)"),
            apply: (img) => documentScan(img, c),
          });
        }}
        className={PRIMARY_BTN}
      >
        {t("Aplicar escaneo", "Apply scan")}
      </button>
    </div>
  );
}

// ============================================================================
// SOCIAL: aspect crop + optional watermark, single Apply.
// ============================================================================

function SocialPanel({
  addOp,
  locale,
  t,
}: {
  addOp: (op: Op) => void;
  locale: "es" | "en";
  t: TFn;
}) {
  const [presetId, setPresetId] = useState(ASPECT_PRESETS[0].id);
  const [watermark, setWatermark] = useState("");
  const [wmPos, setWmPos] = useState<WatermarkPosition>("bottom-right");
  const preset = ASPECT_PRESETS.find((p) => p.id === presetId) ?? ASPECT_PRESETS[0];

  const apply = () => {
    const w = preset.w;
    const h = preset.h;
    const wm = watermark.trim();
    const pos = wmPos;
    let label = `${t("Recorte", "Crop")} ${preset.ratio}`;
    if (wm) label += ` + ${t("marca de agua", "watermark")}`;
    addOp({
      id: `social-${preset.id}${wm ? "-wm" : ""}`,
      label,
      apply: (img) => {
        let r = cropToAspect(img, w, h);
        if (wm) r = addWatermark(r, wm, pos);
        return r;
      },
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
          {t("Formato", "Aspect ratio")}
        </p>
        <div className="flex flex-col gap-2">
          {ASPECT_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPresetId(p.id)}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                presetId === p.id
                  ? "border-cyan/50 bg-cyan/15 text-cyan"
                  : "border-border text-text-dim hover:border-text-faint hover:text-text",
              )}
            >
              <span>{locale === "es" ? p.es : p.en}</span>
              <span className="font-mono text-text-faint">{p.ratio}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
          <Type size={13} className="text-cyan" />
          {t("Marca de agua (opcional)", "Watermark (optional)")}
        </label>
        <input
          type="text"
          value={watermark}
          onChange={(e) => setWatermark(e.target.value)}
          placeholder={t("Ej. @tu_marca", "e.g. @your_brand")}
          className="w-full rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-cyan/60 focus:outline-none"
        />
        {watermark.trim() && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {WM_POSITIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => setWmPos(p.id)}
                className={cn(
                  "rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors",
                  wmPos === p.id
                    ? "border-cyan/50 bg-cyan/15 text-cyan"
                    : "border-border text-text-dim hover:border-text-faint hover:text-text",
                )}
              >
                {locale === "es" ? p.es : p.en}
              </button>
            ))}
          </div>
        )}
        <button onClick={apply} className={cn(PRIMARY_BTN, "mt-4 w-full")}>
          {t("Aplicar recorte", "Apply crop")}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// RESIZE: max-width slider + Apply (downscale only — never upscales).
// ============================================================================

function ResizePanel({
  current,
  addOp,
  t,
}: {
  current: ImageData;
  addOp: (op: Op) => void;
  t: TFn;
}) {
  const cap = Math.min(2000, current.width);
  const [maxWidth, setMaxWidth] = useState(Math.min(1200, current.width));

  // Keep the slider valid when the current image shrinks.
  const target = Math.min(maxWidth, current.width);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-text-dim">
        {t(
          "Reduce las dimensiones de la imagen actual (nunca la agranda). Las nuevas dimensiones quedan listas para los siguientes pasos.",
          "Shrinks the current image's dimensions (never upscales). The new dimensions are ready for the next steps.",
        )}
      </p>
      <SliderRow
        label={t("Ancho máximo", "Max width")}
        value={`${target} px`}
        min={200}
        max={Math.max(200, cap)}
        step={20}
        current={Math.min(maxWidth, cap)}
        onChange={setMaxWidth}
      />
      <p className="text-xs text-text-faint">
        {t(
          `Tamaño actual: ${current.width}×${current.height}px`,
          `Current size: ${current.width}×${current.height}px`,
        )}
      </p>
      <button
        onClick={() => {
          const w = target;
          addOp({
            id: `resize-${w}`,
            label: `${t("Redim. a", "Resize to")} ${w}px`,
            apply: (img) => resizeImage(img, Math.min(w, img.width)),
          });
        }}
        disabled={target >= current.width}
        className={PRIMARY_BTN}
      >
        {t("Aplicar redimensión", "Apply resize")}
      </button>
    </div>
  );
}

// ============================================================================
// Small shared row helper for sliders.
// ============================================================================

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-text-dim">
        <span>{label}</span>
        <span className="font-mono text-text">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan"
      />
    </div>
  );
}

// ============================================================================
// HISTOGRAM: live RGB histogram of the current image (always visible).
// ============================================================================

function HistogramView({ data }: { data: ImageData }) {
  const hist = useMemo(() => computeHistogram(data), [data]);
  const max = useMemo(() => {
    let m = 1;
    // Skip bin 0 to avoid one channel-spike crushing the scale.
    for (let i = 1; i < 256; i++) {
      if (hist.r[i] > m) m = hist.r[i];
      if (hist.g[i] > m) m = hist.g[i];
      if (hist.b[i] > m) m = hist.b[i];
    }
    return m;
  }, [hist]);

  const buildPath = (arr: number[]) => {
    let p = "M 0 80";
    for (let i = 0; i < 256; i++) {
      const y = 80 - Math.min(80, (arr[i] / max) * 78) - 1;
      p += ` L ${i} ${y.toFixed(1)}`;
    }
    p += " L 255 80 Z";
    return p;
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-text-faint">
        <span>0</span>
        <span className="uppercase tracking-wider">Histograma RGB</span>
        <span>255</span>
      </div>
      <svg
        viewBox="0 0 256 80"
        className="block w-full rounded-lg bg-[#0a0c11]"
        preserveAspectRatio="none"
        style={{ aspectRatio: "3.2 / 1" }}
      >
        <path d={buildPath(hist.r)} fill="#f87171" fillOpacity={0.4} />
        <path d={buildPath(hist.g)} fill="#4ade80" fillOpacity={0.4} />
        <path d={buildPath(hist.b)} fill="#60a5fa" fillOpacity={0.4} />
      </svg>
    </div>
  );
}

// ============================================================================
// LEVELS: Photoshop-style tone adjustment.
// ============================================================================

function LevelsPanel({
  current,
  addOp,
  onPreview,
  t,
}: {
  current: ImageData;
  addOp: (op: Op) => void;
  onPreview: (data: ImageData | null) => void;
  t: TFn;
}) {
  const [black, setBlack] = useState(0);
  const [white, setWhite] = useState(255);
  const [gamma, setGamma] = useState(1);

  const atDefault = black === 0 && white === 255 && gamma === 1;

  // Live preview: every slider tweak repaints the canvas and histogram.
  useEffect(() => {
    onPreview(atDefault ? null : levels(current, black, white, gamma));
  }, [current, black, white, gamma, atDefault, onPreview]);

  // Clean up when the user switches tab.
  useEffect(() => () => onPreview(null), [onPreview]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-text-dim">
        {t(
          "Mueve los deslizadores y verás el cambio EN VIVO en la foto y el histograma. Pulsa «Guardar» solo cuando quieras dejarlo asentado como un paso del pipeline.",
          "Move the sliders and you'll see the change LIVE on the photo and the histogram. Press «Save» only when you want to bake it in as a pipeline step.",
        )}
      </p>

      <SliderRow
        label={t("Punto negro", "Black point")}
        value={String(black)}
        min={0}
        max={254}
        step={1}
        current={black}
        onChange={(v) => {
          setBlack(v);
          if (v >= white) setWhite(Math.min(255, v + 1));
        }}
      />
      <SliderRow
        label={t("Gamma (medios)", "Gamma (midtones)")}
        value={gamma.toFixed(2)}
        min={0.1}
        max={3}
        step={0.05}
        current={gamma}
        onChange={setGamma}
      />
      <SliderRow
        label={t("Punto blanco", "White point")}
        value={String(white)}
        min={1}
        max={255}
        step={1}
        current={white}
        onChange={(v) => {
          setWhite(v);
          if (v <= black) setBlack(Math.max(0, v - 1));
        }}
      />

      <div className="flex gap-2">
        <button
          onClick={() => {
            setBlack(0);
            setWhite(255);
            setGamma(1);
          }}
          disabled={atDefault}
          className={cn(SECONDARY_BTN, "flex-1")}
        >
          <RotateCcw size={14} />
          {t("Neutro", "Neutral")}
        </button>
        <button
          onClick={() => {
            if (atDefault) return;
            const b = black;
            const w = white;
            const g = gamma;
            addOp({
              id: `levels-${b}-${g.toFixed(2)}-${w}`,
              label: `${t("Niveles", "Levels")} ${b}/${g.toFixed(2)}/${w}`,
              apply: (img) => levels(img, b, w, g),
            });
            onPreview(null);
            setBlack(0);
            setWhite(255);
            setGamma(1);
          }}
          disabled={atDefault}
          className={cn(PRIMARY_BTN, "flex-1")}
        >
          {t("Guardar paso", "Save step")}
        </button>
      </div>
    </div>
  );
}
