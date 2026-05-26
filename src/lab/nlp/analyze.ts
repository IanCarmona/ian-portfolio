/**
 * Lightweight Spanish NLP analysis — runs 100% client-side.
 * Ported from Ian's Aplicaciones de Lenguaje Natural coursework
 * (tokenization, stopwords, stemming, n-grams, frequency, sentiment).
 */

const STOPWORDS = new Set(
  (
    "de la que el en y a los del se las por un para con no una su al lo como mas pero sus le ya o este si " +
    "porque esta entre cuando muy sin sobre tambien me hasta hay donde quien desde todo nos durante todos uno les " +
    "ni contra otros ese eso ante ellos e esto mi antes algunos que unos yo otro otras otra el tanto esa estos mucho " +
    "quienes nada muchos cual poco ella estar estas algunas algo nosotros mi mis tu te ti tu tus ellas nosotras vosotros " +
    "vosotras os mio mia mios mias tuyo tuya suyo suya nuestro nuestra es son fue ser"
  ).split(/\s+/),
);

const POSITIVE = new Set(
  ("bueno buena excelente genial increible feliz felices amor amar encanta encantar gusta gustar mejor maravilloso " +
    "fantastico perfecto positivo exito exitoso eficiente rapido limpio claro util potente recomiendo recomendar " +
    "agradable contento contenta gracias bien optimo brillante facil").split(/\s+/),
);

const NEGATIVE = new Set(
  ("malo mala pesimo terrible horrible triste odio odiar feo lento error errores falla fallar problema problemas " +
    "dificil complicado negativo peor lamentable defecto defectos confuso aburrido caro inutil molesto enojado " +
    "preocupado falla roto pobre debil").split(/\s+/),
);

export interface Analysis {
  chars: number;
  words: number;
  sentences: number;
  uniqueWords: number;
  avgWordLen: number;
  readingSec: number;
  stopwordRatio: number;
  topWords: { word: string; count: number }[];
  topBigrams: { gram: string; count: number }[];
  stems: { word: string; stem: string }[];
  sentiment: { score: number; label: "pos" | "neg" | "neu"; pos: number; neg: number };
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}]+/gu) ?? []).filter((w) => w.length > 0);
}

/** Light Spanish stemmer: strips common plural and derivational suffixes. */
export function stem(word: string): string {
  let w = word;
  const suffixes = [
    "amente",
    "mente",
    "aciones",
    "acion",
    "ciones",
    "cion",
    "amientos",
    "amiento",
    "imientos",
    "imiento",
    "adoras",
    "adores",
    "adora",
    "ador",
    "antes",
    "ante",
    "ables",
    "able",
    "ibles",
    "ible",
    "istas",
    "ista",
    "osos",
    "osas",
    "oso",
    "osa",
    "ando",
    "iendo",
    "ados",
    "idas",
    "ado",
    "ida",
    "ar",
    "er",
    "ir",
    "es",
    "s",
  ];
  for (const s of suffixes) {
    if (w.length - s.length >= 3 && w.endsWith(s)) {
      w = w.slice(0, -s.length);
      break;
    }
  }
  return w;
}

function topCounts<T extends string>(items: T[], n: number) {
  const map = new Map<T, number>();
  for (const it of items) map.set(it, (map.get(it) ?? 0) + 1);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => ({ key: k, count: v }));
}

export function analyze(text: string): Analysis {
  const tokens = tokenize(text);
  const content = tokens.filter((t) => !STOPWORDS.has(t));
  const sentences = (text.match(/[^.!?]+[.!?]+/g) ?? []).filter((s) => s.trim().length > 0).length;

  const topWords = topCounts(content, 12).map((e) => ({ word: e.key, count: e.count }));

  const bigrams: string[] = [];
  for (let i = 0; i < content.length - 1; i++) bigrams.push(`${content[i]} ${content[i + 1]}`);
  const topBigrams = topCounts(bigrams, 8).map((e) => ({ gram: e.key, count: e.count }));

  const uniqueStems = new Map<string, string>();
  for (const w of content) if (!uniqueStems.has(w)) uniqueStems.set(w, stem(w));
  const stems = [...uniqueStems.entries()].slice(0, 14).map(([word, s]) => ({ word, stem: s }));

  let pos = 0;
  let neg = 0;
  for (const w of tokens) {
    if (POSITIVE.has(w)) pos++;
    if (NEGATIVE.has(w)) neg++;
  }
  const total = pos + neg;
  const score = total === 0 ? 0 : (pos - neg) / total;
  const label: "pos" | "neg" | "neu" = score > 0.15 ? "pos" : score < -0.15 ? "neg" : "neu";

  const totalLen = tokens.reduce((a, w) => a + w.length, 0);

  return {
    chars: text.length,
    words: tokens.length,
    sentences: Math.max(sentences, text.trim() ? 1 : 0),
    uniqueWords: new Set(tokens).size,
    avgWordLen: tokens.length ? totalLen / tokens.length : 0,
    readingSec: Math.round((tokens.length / 200) * 60),
    stopwordRatio: tokens.length ? (tokens.length - content.length) / tokens.length : 0,
    topWords,
    topBigrams,
    stems,
    sentiment: { score, label, pos, neg },
  };
}

export const STOPWORD_SET = STOPWORDS;
