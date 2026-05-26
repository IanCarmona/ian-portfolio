/**
 * Pure image-processing filters operating on Canvas ImageData.
 * Ported from Ian's Procesamiento Digital de Imágenes / Visión Artificial
 * coursework — runs 100% client-side, no backend.
 */

export type FilterId =
  | "original"
  | "grayscale"
  | "red"
  | "green"
  | "blue"
  | "invert"
  | "sepia"
  | "threshold"
  | "equalize"
  | "blur"
  | "sobel"
  | "noise"
  | "erode"
  | "dilate";

function clone(src: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
}

function toGrayValues(src: ImageData): Uint8ClampedArray {
  const { data } = src;
  const out = new Uint8ClampedArray(src.width * src.height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    out[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return out;
}

function fromGray(gray: Uint8ClampedArray, w: number, h: number): ImageData {
  const out = new ImageData(w, h);
  for (let p = 0, i = 0; p < gray.length; p++, i += 4) {
    out.data[i] = out.data[i + 1] = out.data[i + 2] = gray[p];
    out.data[i + 3] = 255;
  }
  return out;
}

function grayscale(src: ImageData): ImageData {
  return fromGray(toGrayValues(src), src.width, src.height);
}

function channel(src: ImageData, keep: 0 | 1 | 2): ImageData {
  const out = clone(src);
  for (let i = 0; i < out.data.length; i += 4) {
    for (let c = 0; c < 3; c++) if (c !== keep) out.data[i + c] = 0;
  }
  return out;
}

function invert(src: ImageData): ImageData {
  const out = clone(src);
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 255 - out.data[i];
    out.data[i + 1] = 255 - out.data[i + 1];
    out.data[i + 2] = 255 - out.data[i + 2];
  }
  return out;
}

function sepia(src: ImageData): ImageData {
  const out = clone(src);
  const d = out.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    d[i] = 0.393 * r + 0.769 * g + 0.189 * b;
    d[i + 1] = 0.349 * r + 0.686 * g + 0.168 * b;
    d[i + 2] = 0.272 * r + 0.534 * g + 0.131 * b;
  }
  return out;
}

function threshold(src: ImageData, t: number): ImageData {
  const gray = toGrayValues(src);
  for (let p = 0; p < gray.length; p++) gray[p] = gray[p] >= t ? 255 : 0;
  return fromGray(gray, src.width, src.height);
}

/** Histogram equalization on luminance (classic contrast enhancement). */
function equalize(src: ImageData): ImageData {
  const gray = toGrayValues(src);
  const hist = new Array(256).fill(0);
  for (let p = 0; p < gray.length; p++) hist[gray[p]]++;
  const cdf = new Array(256).fill(0);
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    cdf[i] = acc;
  }
  const total = gray.length;
  let cdfMin = 0;
  for (let i = 0; i < 256; i++) {
    if (cdf[i] !== 0) {
      cdfMin = cdf[i];
      break;
    }
  }
  const lut = new Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.round(((cdf[i] - cdfMin) / (total - cdfMin)) * 255);
  }
  for (let p = 0; p < gray.length; p++) gray[p] = lut[gray[p]];
  return fromGray(gray, src.width, src.height);
}

function convolveGray(gray: Uint8ClampedArray, w: number, h: number, kernel: number[], divisor = 1) {
  const out = new Uint8ClampedArray(gray.length);
  const k = Math.sqrt(kernel.length);
  const half = Math.floor(k / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let ky = 0; ky < k; ky++) {
        for (let kx = 0; kx < k; kx++) {
          const px = Math.min(w - 1, Math.max(0, x + kx - half));
          const py = Math.min(h - 1, Math.max(0, y + ky - half));
          sum += gray[py * w + px] * kernel[ky * k + kx];
        }
      }
      out[y * w + x] = sum / divisor;
    }
  }
  return out;
}

function blur(src: ImageData): ImageData {
  const gray = toGrayValues(src);
  // 5x5 box blur on each RGB channel for a softer look
  const out = clone(src);
  const w = src.width,
    h = src.height,
    half = 2;
  for (let c = 0; c < 3; c++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0,
          n = 0;
        for (let ky = -half; ky <= half; ky++) {
          for (let kx = -half; kx <= half; kx++) {
            const px = Math.min(w - 1, Math.max(0, x + kx));
            const py = Math.min(h - 1, Math.max(0, y + ky));
            sum += src.data[(py * w + px) * 4 + c];
            n++;
          }
        }
        out.data[(y * w + x) * 4 + c] = sum / n;
      }
    }
  }
  void gray;
  return out;
}

/** Sobel edge magnitude. */
function sobel(src: ImageData): ImageData {
  const gray = toGrayValues(src);
  const w = src.width,
    h = src.height;
  const gx = convolveGray(gray, w, h, [-1, 0, 1, -2, 0, 2, -1, 0, 1]);
  const gy = convolveGray(gray, w, h, [-1, -2, -1, 0, 0, 0, 1, 2, 1]);
  const mag = new Uint8ClampedArray(gray.length);
  for (let p = 0; p < gray.length; p++) {
    mag[p] = Math.hypot(gx[p] - 128, gy[p] - 128) * 1.2;
  }
  return fromGray(mag, w, h);
}

function noise(src: ImageData, amount: number): ImageData {
  const out = clone(src);
  for (let i = 0; i < out.data.length; i += 4) {
    if (Math.random() < amount / 100) {
      const v = Math.random() < 0.5 ? 0 : 255;
      out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
    }
  }
  return out;
}

/** Morphological erosion/dilation on a binarized image. */
function morphology(src: ImageData, op: "erode" | "dilate", t: number): ImageData {
  const gray = toGrayValues(src);
  const w = src.width,
    h = src.height;
  const bin = new Uint8ClampedArray(gray.length);
  for (let p = 0; p < gray.length; p++) bin[p] = gray[p] >= t ? 255 : 0;
  const out = new Uint8ClampedArray(gray.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let val = op === "erode" ? 255 : 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = Math.min(w - 1, Math.max(0, x + kx));
          const py = Math.min(h - 1, Math.max(0, y + ky));
          const n = bin[py * w + px];
          val = op === "erode" ? Math.min(val, n) : Math.max(val, n);
        }
      }
      out[y * w + x] = val;
    }
  }
  return fromGray(out, w, h);
}

/** Apply a filter by id. `param` drives threshold/noise intensity. */
export function applyFilter(src: ImageData, id: FilterId, param = 128): ImageData {
  switch (id) {
    case "original":
      return clone(src);
    case "grayscale":
      return grayscale(src);
    case "red":
      return channel(src, 0);
    case "green":
      return channel(src, 1);
    case "blue":
      return channel(src, 2);
    case "invert":
      return invert(src);
    case "sepia":
      return sepia(src);
    case "threshold":
      return threshold(src, param);
    case "equalize":
      return equalize(src);
    case "blur":
      return blur(src);
    case "sobel":
      return sobel(src);
    case "noise":
      return noise(src, param / 5);
    case "erode":
      return morphology(src, "erode", param);
    case "dilate":
      return morphology(src, "dilate", param);
    default:
      return clone(src);
  }
}

// ============================================================================
// Histogram + Levels (Photoshop-style tone adjustment)
// ============================================================================

export interface Histogram {
  r: number[];
  g: number[];
  b: number[];
  luma: number[];
}

/** Per-channel pixel-count histogram (256 bins) plus luminance. */
export function computeHistogram(src: ImageData): Histogram {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const luma = new Array(256).fill(0);
  const d = src.data;
  for (let i = 0; i < d.length; i += 4) {
    r[d[i]]++;
    g[d[i + 1]]++;
    b[d[i + 2]]++;
    const y = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) | 0;
    luma[y]++;
  }
  return { r, g, b, luma };
}

/**
 * Photoshop-style "Levels" adjustment. Re-maps input intensities so that
 * `black` becomes 0, `white` becomes 255, and `gamma` shifts the midtones.
 * `black` and `white` are 0–255, `gamma` is 0.1–3 (1 = no midtone shift).
 */
export function levels(
  src: ImageData,
  black: number,
  white: number,
  gamma: number,
): ImageData {
  const lo = Math.max(0, Math.min(254, black));
  const hi = Math.max(lo + 1, Math.min(255, white));
  const inv = 1 / Math.max(0.05, gamma);
  const range = hi - lo;
  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    const t = Math.max(0, Math.min(1, (i - lo) / range));
    lut[i] = Math.round(Math.pow(t, inv) * 255);
  }
  const out = new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
  const d = out.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = lut[d[i]];
    d[i + 1] = lut[d[i + 1]];
    d[i + 2] = lut[d[i + 2]];
  }
  return out;
}
