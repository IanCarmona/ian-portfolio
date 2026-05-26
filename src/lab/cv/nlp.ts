/**
 * Advanced NLP analysis for the CV ↔ Job-posting pair.
 * Pure client-side TypeScript — no model, no backend.
 *
 * Implements the classic NLP / IR toolkit used in the
 * "Aplicaciones de Lenguaje Natural" coursework:
 *   - TF-IDF vector representation
 *   - Cosine similarity between documents
 *   - Jaccard similarity of detected skill sets
 *   - 2D keyword map (TF-IDF in posting vs TF-IDF in CV)
 *   - N-gram extraction (bigrams + trigrams)
 *   - Rule-based Named Entity Recognition (skills, %s, money, years, orgs)
 */

import { stem } from "@/lab/nlp/analyze";
import { STOPWORDS, SKILL_DICTIONARY, normalize, tokenize } from "@/lab/cv/ats";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface TermWeight {
  term: string;
  weight: number;
}

export interface KeywordPoint {
  term: string;
  /** TF-IDF weight in the job posting (x-axis, normalized 0..1). */
  xJob: number;
  /** TF-IDF weight in the resume (y-axis, normalized 0..1). */
  yCv: number;
  status: "matched" | "missing" | "extra";
  /** Raw counts for the tooltip. */
  freqJob: number;
  freqCv: number;
}

export interface NgramCount {
  gram: string;
  count: number;
}

export interface Entities {
  skills: string[];
  years: string[];
  percentages: string[];
  money: string[];
  /** Capitalized multi-token sequences that look like organizations. */
  organizations: string[];
}

export interface NlpResult {
  /** Cosine similarity between TF-IDF vectors of CV and posting (0..1). */
  cosineSim: number;
  /** Jaccard similarity of the two detected skill sets (0..1). */
  jaccardSkills: number;
  /** Top-weighted TF-IDF terms in the resume. */
  tfidfTopCv: TermWeight[];
  /** Top-weighted TF-IDF terms in the posting. */
  tfidfTopJob: TermWeight[];
  /** Points for the 2D keyword map. */
  keywordMap: KeywordPoint[];
  bigrams: NgramCount[];
  trigrams: NgramCount[];
  entities: { cv: Entities; job: Entities };
}

/* ------------------------------------------------------------------ */
/* TF-IDF                                                              */
/* ------------------------------------------------------------------ */

/** Filter raw tokens to "content" tokens (drops stopwords + short noise). */
function contentTokens(tokens: string[]): string[] {
  return tokens.filter((t) => !STOPWORDS.has(t) && t.length >= 3 && !/^\d+$/.test(t));
}

/** Term frequencies → Map<term, count>. */
function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

/**
 * IDF over a 2-document corpus. For two docs the raw idf is binary
 * (0 for shared terms, log(2) for unique ones), which discriminates poorly.
 * We add a smoothing constant so shared terms still carry some weight
 * proportional to their commonality.
 */
function idf(term: string, tfCv: Map<string, number>, tfJob: Map<string, number>): number {
  const df = (tfCv.has(term) ? 1 : 0) + (tfJob.has(term) ? 1 : 0);
  // Smoothed IDF: log((N + 1) / (df + 1)) + 1   (sklearn convention)
  return Math.log((2 + 1) / (df + 1)) + 1;
}

function tfidfVector(
  tf: Map<string, number>,
  tfCv: Map<string, number>,
  tfJob: Map<string, number>,
): Map<string, number> {
  const out = new Map<string, number>();
  const total = [...tf.values()].reduce((a, b) => a + b, 0) || 1;
  for (const [term, count] of tf) {
    const tfNorm = count / total;
    out.set(term, tfNorm * idf(term, tfCv, tfJob));
  }
  return out;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, v] of a) {
    na += v * v;
    const bv = b.get(k);
    if (bv !== undefined) dot += v * bv;
  }
  for (const v of b.values()) nb += v * v;
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/* ------------------------------------------------------------------ */
/* N-grams                                                             */
/* ------------------------------------------------------------------ */

function ngrams(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    const window = tokens.slice(i, i + n);
    // Skip n-grams that are entirely stopwords or noise.
    if (window.every((w) => STOPWORDS.has(w))) continue;
    if (window.some((w) => w.length < 2)) continue;
    out.push(window.join(" "));
  }
  return out;
}

function topNgrams(tokens: string[], n: number, top: number): NgramCount[] {
  const grams = ngrams(tokens, n);
  const freq = new Map<string, number>();
  for (const g of grams) freq.set(g, (freq.get(g) ?? 0) + 1);
  return [...freq.entries()]
    .filter(([, c]) => c >= (n === 2 ? 2 : 1))
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([gram, count]) => ({ gram, count }));
}

/* ------------------------------------------------------------------ */
/* Rule-based NER                                                      */
/* ------------------------------------------------------------------ */

function extractSkills(textNorm: string, tokenSet: Set<string>): string[] {
  const found = new Set<string>();
  for (const skill of SKILL_DICTIONARY) {
    const sk = normalize(skill);
    if (sk.includes(" ") || /[+#./-]/.test(sk)) {
      if (textNorm.includes(sk)) found.add(skill);
    } else if (tokenSet.has(sk)) {
      found.add(skill);
    }
  }
  return [...found];
}

function extractEntities(text: string): Entities {
  const norm = normalize(text);
  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);

  const skills = extractSkills(norm, tokenSet);

  const years = [...new Set(text.match(/\b(?:19|20)\d{2}\b/g) ?? [])];
  const percentages = [...new Set(text.match(/\d+(?:[.,]\d+)?\s?%/g) ?? [])];
  const money = [...new Set(text.match(/\$\s?\d[\d.,]*\s?(?:k|m|millones|mil)?\b/gi) ?? [])];

  // Org heuristic: 2+ consecutive Capitalized words (Inc/SA/LLC optional).
  // Filters common false positives (sentence-start capitals).
  const orgRegex =
    /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|del|y|&|of)?\s*[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)\b/g;
  const orgs = new Set<string>();
  const BLOCK = new Set([
    "EXPERIENCIA",
    "EDUCACIÓN",
    "EDUCACION",
    "HABILIDADES",
    "PROYECTOS",
    "IDIOMAS",
  ]);
  let m: RegExpExecArray | null;
  while ((m = orgRegex.exec(text)) !== null) {
    const candidate = m[1].trim();
    if (candidate.length < 5) continue;
    if (BLOCK.has(candidate.toUpperCase())) continue;
    orgs.add(candidate);
  }

  return {
    skills,
    years,
    percentages,
    money,
    organizations: [...orgs].slice(0, 8),
  };
}

/* ------------------------------------------------------------------ */
/* Main entry                                                          */
/* ------------------------------------------------------------------ */

export function analyzeNlp(cv: string, job: string): NlpResult {
  const cvTokens = contentTokens(tokenize(cv)).map((t) => stem(t));
  const jobTokens = contentTokens(tokenize(job)).map((t) => stem(t));

  const tfCv = termFreq(cvTokens);
  const tfJob = termFreq(jobTokens);

  const vecCv = tfidfVector(tfCv, tfCv, tfJob);
  const vecJob = tfidfVector(tfJob, tfCv, tfJob);

  const cosineSim = cosine(vecCv, vecJob);

  const tfidfTopCv = [...vecCv.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term, weight]) => ({ term, weight }));
  const tfidfTopJob = [...vecJob.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term, weight]) => ({ term, weight }));

  /* 2D keyword map ------------------------------------------------- */
  // Use a shared set of "important" terms (top TF-IDF from either doc).
  const interestingTerms = new Set<string>();
  for (const { term } of tfidfTopCv) interestingTerms.add(term);
  for (const { term } of tfidfTopJob) interestingTerms.add(term);

  const maxJob = Math.max(...[...vecJob.values()], 1e-6);
  const maxCv = Math.max(...[...vecCv.values()], 1e-6);

  const keywordMap: KeywordPoint[] = [...interestingTerms].map((term) => {
    const wj = vecJob.get(term) ?? 0;
    const wc = vecCv.get(term) ?? 0;
    const freqJob = tfJob.get(term) ?? 0;
    const freqCv = tfCv.get(term) ?? 0;
    let status: KeywordPoint["status"];
    if (freqJob > 0 && freqCv > 0) status = "matched";
    else if (freqJob > 0) status = "missing";
    else status = "extra";
    return {
      term,
      xJob: wj / maxJob,
      yCv: wc / maxCv,
      status,
      freqJob,
      freqCv,
    };
  });

  /* N-grams from the posting (where the requirements live) -------- */
  const jobRaw = contentTokens(tokenize(job));
  const bigrams = topNgrams(jobRaw, 2, 8);
  const trigrams = topNgrams(jobRaw, 3, 6);

  /* Entities ------------------------------------------------------- */
  const entities = {
    cv: extractEntities(cv),
    job: extractEntities(job),
  };

  /* Jaccard of skill sets ----------------------------------------- */
  const sCv = new Set(entities.cv.skills.map((s) => s.toLowerCase()));
  const sJob = new Set(entities.job.skills.map((s) => s.toLowerCase()));
  const inter = [...sJob].filter((x) => sCv.has(x)).length;
  const union = new Set([...sCv, ...sJob]).size;
  const jaccardSkills = union === 0 ? 0 : inter / union;

  return {
    cosineSim,
    jaccardSkills,
    tfidfTopCv,
    tfidfTopJob,
    keywordMap,
    bigrams,
    trigrams,
    entities,
  };
}
