/**
 * Image Studio helpers — real-world client-side image utilities built on the
 * Canvas API. Used by the /lab/imagen "Image Studio" tool: optimize/compress,
 * document scanning (Otsu), social-media cropping and watermarking.
 *
 * All functions are pure with respect to the DOM (they create throwaway
 * canvases) and run 100% in the browser — no backend, no external libraries.
 */

export type ExportFormat = "image/jpeg" | "image/webp" | "image/png";

/** A measured export: the encoded blob plus its size in bytes. */
export interface SizedBlob {
  blob: Blob;
  bytes: number;
}

/** Wrap an ImageData into a freshly drawn canvas. */
export function imageDataToCanvas(src: ImageData): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext("2d");
  if (ctx) ctx.putImageData(src, 0, 0);
  return c;
}

/** Read the pixels of a canvas back into ImageData. */
export function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext("2d");
  if (!ctx) return new ImageData(canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Resize an image to fit within `maxWidth` (keeping aspect ratio, never
 * upscaling). Returns a new ImageData at the resized dimensions.
 */
export function resizeImage(src: ImageData, maxWidth: number): ImageData {
  const scale = Math.min(1, maxWidth / src.width);
  const w = Math.max(1, Math.round(src.width * scale));
  const h = Math.max(1, Math.round(src.height * scale));
  if (w === src.width && h === src.height) {
    return new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
  }
  const source = imageDataToCanvas(src);
  const dest = document.createElement("canvas");
  dest.width = w;
  dest.height = h;
  const ctx = dest.getContext("2d");
  if (!ctx) return src;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, src.width, src.height, 0, 0, w, h);
  return canvasToImageData(dest);
}

/**
 * Encode an ImageData with a given format + quality and measure the result.
 * Resolves with the blob and its byte size — the basis for compression stats.
 */
export function toBlobSize(
  src: ImageData,
  format: ExportFormat,
  quality: number,
): Promise<SizedBlob> {
  const canvas = imageDataToCanvas(src);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("toBlob returned null"));
          return;
        }
        resolve({ blob, bytes: blob.size });
      },
      format,
      // PNG ignores quality; pass it anyway for JPEG/WebP.
      quality,
    );
  });
}

/**
 * Compute an automatic binarization threshold via Otsu's method — maximizes
 * inter-class variance over the luminance histogram. Returns 0..255.
 */
export function otsuThreshold(src: ImageData): number {
  const { data } = src;
  const hist = new Array(256).fill(0);
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    hist[lum]++;
    total++;
  }
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];

  let sumB = 0;
  let wB = 0;
  let maxVar = -1;
  let threshold = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) {
      maxVar = between;
      threshold = t;
    }
  }
  return threshold;
}

/**
 * Document-scan look: grayscale → contrast boost → Otsu auto-threshold to a
 * crisp black/white scan. Great for digitizing photographed documents.
 */
export function documentScan(src: ImageData, contrast = 1.35): ImageData {
  const w = src.width;
  const h = src.height;
  // 1. grayscale + contrast around mid-gray.
  const gray = new Uint8ClampedArray(w * h);
  const { data } = src;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    let lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    lum = (lum - 128) * contrast + 128;
    gray[p] = lum < 0 ? 0 : lum > 255 ? 255 : lum;
  }
  // 2. Otsu threshold on the contrasted gray.
  const tmp = new ImageData(w, h);
  for (let p = 0, i = 0; p < gray.length; p++, i += 4) {
    tmp.data[i] = tmp.data[i + 1] = tmp.data[i + 2] = gray[p];
    tmp.data[i + 3] = 255;
  }
  const t = otsuThreshold(tmp);
  // 3. binarize.
  const out = new ImageData(w, h);
  for (let p = 0, i = 0; p < gray.length; p++, i += 4) {
    const v = gray[p] >= t ? 255 : 0;
    out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
    out.data[i + 3] = 255;
  }
  return out;
}

/**
 * Cover-fit (crop) an image to a target width/height aspect — scales to fill
 * then center-crops the overflow. Returns ImageData at exactly tw×th.
 */
export function cropToAspect(src: ImageData, tw: number, th: number): ImageData {
  const source = imageDataToCanvas(src);
  const dest = document.createElement("canvas");
  dest.width = tw;
  dest.height = th;
  const ctx = dest.getContext("2d");
  if (!ctx) return src;

  const scale = Math.max(tw / src.width, th / src.height);
  const dw = src.width * scale;
  const dh = src.height * scale;
  const dx = (tw - dw) / 2;
  const dy = (th - dh) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, dx, dy, dw, dh);
  return canvasToImageData(dest);
}

export type WatermarkPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

/**
 * Burn a text watermark onto an image with a subtle shadow for legibility.
 * Position picks one of the four corners or the center.
 */
export function addWatermark(
  src: ImageData,
  text: string,
  position: WatermarkPosition = "bottom-right",
): ImageData {
  if (!text.trim()) {
    return new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
  }
  const canvas = imageDataToCanvas(src);
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;

  const w = canvas.width;
  const h = canvas.height;
  const fontSize = Math.max(14, Math.round(Math.min(w, h) * 0.05));
  const pad = Math.round(fontSize * 0.6);
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = Math.max(2, fontSize * 0.12);
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  const metrics = ctx.measureText(text);
  const tw = metrics.width;

  let x = pad;
  let y = pad + fontSize / 2;
  switch (position) {
    case "top-left":
      ctx.textAlign = "left";
      x = pad;
      y = pad + fontSize / 2;
      break;
    case "top-right":
      ctx.textAlign = "right";
      x = w - pad;
      y = pad + fontSize / 2;
      break;
    case "bottom-left":
      ctx.textAlign = "left";
      x = pad;
      y = h - pad - fontSize / 2;
      break;
    case "bottom-right":
      ctx.textAlign = "right";
      x = w - pad;
      y = h - pad - fontSize / 2;
      break;
    case "center":
      ctx.textAlign = "center";
      x = w / 2;
      y = h / 2;
      break;
  }
  void tw;
  ctx.fillText(text, x, y);
  return canvasToImageData(canvas);
}

/** Human-readable byte size: 938 B / 12.4 KB / 1.8 MB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Trigger a browser download of a blob with the given filename. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Social-media aspect-ratio presets (label + target pixel dimensions). */
export interface AspectPreset {
  id: string;
  es: string;
  en: string;
  w: number;
  h: number;
  ratio: string;
}

export const ASPECT_PRESETS: AspectPreset[] = [
  { id: "square", es: "Instagram cuadrado", en: "Instagram square", w: 1080, h: 1080, ratio: "1:1" },
  { id: "portrait", es: "Instagram retrato", en: "Instagram portrait", w: 1080, h: 1350, ratio: "4:5" },
  { id: "wide", es: "Video / 16:9", en: "Video / 16:9", w: 1920, h: 1080, ratio: "16:9" },
  { id: "story", es: "Historia / Reel", en: "Story / Reel", w: 1080, h: 1920, ratio: "9:16" },
  { id: "linkedin", es: "Banner LinkedIn", en: "LinkedIn banner", w: 1584, h: 396, ratio: "1584×396" },
];
