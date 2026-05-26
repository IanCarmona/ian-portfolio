/**
 * ATS resume optimizer — 100% client-side, pure TypeScript.
 * Compares a resume against a job posting the way an Applicant Tracking System
 * (ATS) would: extracts the important keywords/skills from the posting, checks
 * which ones appear in the resume, scores the match, and surfaces the missing
 * keywords plus concrete, rule-based suggestions.
 *
 * No backend, no model — just tokenization, a tech-skill dictionary, term
 * frequency, and a handful of heuristics.
 */

import { stem } from "@/lab/nlp/analyze";

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

/** Spanish + English stopwords removed before scoring keyword frequency. */
export const STOPWORDS = new Set(
  (
    // Spanish
    "de la que el en y a los del se las por un para con no una su al lo como mas pero sus le ya o este si " +
    "porque esta entre cuando muy sin sobre tambien me hasta hay donde quien desde todo nos durante todos uno les " +
    "ni contra otros ese eso ante ellos e esto mi antes algunos unos yo otro otras otra tanto esa estos mucho " +
    "quienes nada muchos cual poco ella estar estas algunas algo nosotros mis tu te ti tus ellas vosotros " +
    "os es son fue ser sera seran tener tiene tienen hacer experiencia anos ano conocimiento conocimientos " +
    "trabajo equipo empresa puesto vacante rol perfil buscamos ofrecemos requisitos funciones responsabilidades " +
    "deseable valorable plus capaz capacidad fuerte solida solidas solido nivel area sector cliente clientes " +
    // English
    "the of and to in a is for on with as at by an be or this that it from we you your our will are " +
    "have has had not but their they them his her its can able experience years year knowledge work team " +
    "company role position looking offer requirements responsibilities skill skills strong solid level area " +
    "client clients plus must should would about into across using use used within"
  ).split(/\s+/),
);

/**
 * Built-in dictionary of tech skills. Multi-word entries are matched as
 * phrases; single tokens are matched against the resume's token set.
 * ~120 entries covering data/AI, cloud, web and tooling.
 */
export const SKILL_DICTIONARY: string[] = [
  // languages
  "python", "sql", "javascript", "typescript", "java", "scala", "go", "rust", "r", "c++", "c#", "bash", "shell",
  // data engineering
  "etl", "elt", "spark", "pyspark", "databricks", "airflow", "dbt", "kafka", "hadoop", "hive", "flink",
  "data warehouse", "data lake", "data lakehouse", "data pipeline", "data pipelines", "streaming", "batch",
  // databases
  "postgresql", "postgres", "mysql", "mongodb", "redis", "cassandra", "snowflake", "bigquery", "redshift",
  "elasticsearch", "dynamodb", "oracle", "sql server",
  // cloud
  "aws", "gcp", "azure", "cloud", "s3", "lambda", "ec2", "cloud run", "cloud functions", "vertex ai",
  "sagemaker", "databricks", "terraform",
  // devops / infra
  "docker", "kubernetes", "k8s", "ci/cd", "jenkins", "github actions", "gitlab", "git", "linux",
  "microservices", "rest", "graphql", "grpc",
  // ml / ai
  "machine learning", "deep learning", "nlp", "computer vision", "rag", "llm", "llms", "generative ai",
  "pytorch", "tensorflow", "keras", "scikit-learn", "sklearn", "xgboost", "huggingface", "transformers",
  "mlops", "feature engineering", "model deployment", "fine-tuning", "embeddings", "vector database",
  "langchain", "openai", "prompt engineering",
  // data analysis / bi
  "pandas", "numpy", "matplotlib", "seaborn", "power bi", "powerbi", "tableau", "looker", "excel",
  "data visualization", "data analysis", "statistics", "a/b testing", "dashboards", "kpis",
  // web / app
  "react", "nextjs", "next.js", "node", "nodejs", "node.js", "fastapi", "django", "flask", "express",
  "html", "css", "tailwind", "vue", "angular", "api", "apis",
  // methodology
  "agile", "scrum", "kanban", "jira", "data governance", "data quality", "etl pipelines",
];

/** Spanish + English action verbs (stems) that signal strong resume bullets. */
const ACTION_VERBS = [
  // Spanish (infinitive/conjugated roots)
  "lider", "lidere", "desarroll", "optimic", "optimi", "constru", "automatic", "automati",
  "reduj", "reduc", "dise", "implement", "migr", "cre", "gestion", "dirig", "coordin",
  "analic", "analiz", "mejor", "increment", "aument", "logr", "entreg", "lanc", "lanz",
  "escal", "integr", "despleg", "model", "entren", "transform", "acelerad", "acelerar",
  // English
  "led", "develop", "optimiz", "built", "build", "automat", "reduc", "design", "implement",
  "migrat", "creat", "manag", "direct", "coordinat", "analyz", "improv", "increas", "deliver",
  "launch", "scal", "integrat", "deploy", "train", "transform", "accelerat", "drove", "drive",
  "spearhead", "architect", "engineer",
];

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface CvMetrics {
  words: number;
  bullets: number;
  actionVerbs: number;
  quantified: number;
  avgSentenceLen: number;
  sentences: number;
}

export interface Suggestion {
  /** Severity drives the chip color in the UI. */
  level: "high" | "medium" | "good";
  es: string;
  en: string;
}

export interface AtsResult {
  /** 0–100 keyword-match score. */
  score: number;
  /** Required keywords found in the resume. */
  matched: string[];
  /** Required keywords missing from the resume (the actionable output). */
  missing: string[];
  /** Total required keywords extracted from the posting. */
  totalKeywords: number;
  /** Quality metrics computed on the resume text. */
  metrics: CvMetrics;
  /** Rule-based, prioritized improvement suggestions. */
  suggestions: Suggestion[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Lowercase, strip accents, normalize whitespace. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

/** Word tokens (keeps + # . / inside tech terms like c++, ci/cd, next.js). */
export function tokenize(text: string): string[] {
  return normalize(text).match(/[a-z0-9][a-z0-9+#./-]*/g) ?? [];
}

function topFrequent(tokens: string[], n: number): string[] {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (STOPWORDS.has(t) || t.length < 3) continue;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()]
    .filter(([, c]) => c >= 2) // appears at least twice → likely relevant
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

/** True if a (possibly multi-word) keyword appears in the resume text. */
function present(keyword: string, resumeNorm: string, resumeTokens: Set<string>): boolean {
  const kw = normalize(keyword);
  if (kw.includes(" ") || /[+#./-]/.test(kw)) {
    // phrase or symbol-bearing token → substring match on normalized text
    return resumeNorm.includes(kw);
  }
  // single plain word → exact token match, with a light stem fallback
  if (resumeTokens.has(kw)) return true;
  const s = stem(kw);
  for (const t of resumeTokens) {
    if (stem(t) === s) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Core analysis                                                       */
/* ------------------------------------------------------------------ */

export function analyzeAts(cv: string, job: string): AtsResult {
  const cvNorm = normalize(cv);
  const cvTokens = tokenize(cv);
  const cvTokenSet = new Set(cvTokens);
  const jobNorm = normalize(job);
  const jobTokens = tokenize(job);

  /* 1. Required keywords from the posting --------------------------- */
  const required = new Map<string, string>(); // normalized → display label

  // 1a. dictionary skills explicitly named in the posting
  for (const skill of SKILL_DICTIONARY) {
    const sk = normalize(skill);
    const found = sk.includes(" ") || /[+#./-]/.test(sk)
      ? jobNorm.includes(sk)
      : new Set(jobTokens).has(sk);
    if (found) required.set(sk, skill);
  }

  // 1b. frequent non-stopword terms (catches domain words not in the dictionary)
  for (const w of topFrequent(jobTokens, 14)) {
    if (!required.has(w)) required.set(w, w);
  }

  const requiredList = [...required.values()];

  /* 2. Match against the resume ------------------------------------ */
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of requiredList) {
    if (present(kw, cvNorm, cvTokenSet)) matched.push(kw);
    else missing.push(kw);
  }

  const totalKeywords = requiredList.length;
  const score = totalKeywords === 0 ? 0 : Math.round((matched.length / totalKeywords) * 100);

  /* 3. Resume quality metrics -------------------------------------- */
  const metrics = computeMetrics(cv, cvTokens);

  /* 4. Suggestions ------------------------------------------------- */
  const suggestions = buildSuggestions(score, matched, missing, metrics);

  return { score, matched, missing, totalKeywords, metrics, suggestions };
}

function computeMetrics(cv: string, tokens: string[]): CvMetrics {
  const words = tokens.length;

  // Bullet points: lines starting with a bullet glyph or dash.
  const bullets = (cv.match(/(^|\n)\s*([-•*‣◦·]|\d+[.)])\s+/g) ?? []).length;

  // Action verbs: count tokens whose stem matches a known action verb root.
  let actionVerbs = 0;
  for (const t of tokens) {
    const s = stem(t);
    if (ACTION_VERBS.some((v) => t.startsWith(v) || s.startsWith(v))) actionVerbs++;
  }

  // Quantified results: percentages, money, +N, or standalone numbers ≥ 2 digits.
  const quantified = (cv.match(/\d+\s?%|\$\s?\d|\+\s?\d|\b\d{2,}\b/g) ?? []).length;

  // Sentences (rough) — split on terminal punctuation and newlines.
  const sentenceCount = (cv.split(/[.!?\n]+/).filter((s) => s.trim().length > 0)).length;
  const avgSentenceLen = sentenceCount ? words / sentenceCount : 0;

  return {
    words,
    bullets,
    actionVerbs,
    quantified,
    avgSentenceLen,
    sentences: sentenceCount,
  };
}

function buildSuggestions(
  score: number,
  matched: string[],
  missing: string[],
  m: CvMetrics,
): Suggestion[] {
  const out: Suggestion[] = [];

  // Missing keywords — the highest-value action.
  if (missing.length > 0) {
    const sample = missing.slice(0, 6).join(", ");
    out.push({
      level: missing.length > matched.length ? "high" : "medium",
      es: `Incluye estas palabras clave de la vacante en tu CV: ${sample}${missing.length > 6 ? "…" : ""}.`,
      en: `Add these keywords from the posting to your resume: ${sample}${missing.length > 6 ? "…" : ""}.`,
    });
  }

  // Quantified results.
  if (m.quantified < 3) {
    out.push({
      level: "high",
      es: "Agrega más métricas y resultados cuantificados (%, $, números). Los reclutadores valoran logros medibles.",
      en: "Add more metrics and quantified results (%, $, numbers). Recruiters value measurable achievements.",
    });
  }

  // Action verbs.
  if (m.bullets > 0 && m.actionVerbs < Math.max(3, m.bullets * 0.5)) {
    out.push({
      level: "medium",
      es: "Empieza tus viñetas con verbos de acción (lideré, desarrollé, optimicé, reduje…).",
      en: "Start your bullet points with action verbs (led, developed, optimized, reduced…).",
    });
  }

  // Bullets / structure.
  if (m.bullets < 4) {
    out.push({
      level: "medium",
      es: "Usa viñetas para tus logros; mejoran la legibilidad y el escaneo de los ATS.",
      en: "Use bullet points for your achievements; they improve readability and ATS scanning.",
    });
  }

  // Word count.
  if (m.words < 180) {
    out.push({
      level: "medium",
      es: "Tu CV es muy corto. Agrega más detalle sobre tu experiencia y logros (apunta a 400–700 palabras).",
      en: "Your resume is quite short. Add more detail about your experience and achievements (aim for 400–700 words).",
    });
  } else if (m.words > 900) {
    out.push({
      level: "medium",
      es: "Tu CV es muy largo. Sintetiza para que sea más fácil de leer (idealmente 1–2 páginas).",
      en: "Your resume is quite long. Trim it down for readability (ideally 1–2 pages).",
    });
  }

  // Sentence length.
  if (m.avgSentenceLen > 28) {
    out.push({
      level: "medium",
      es: "Tus frases son largas. Frases cortas y directas se leen mejor.",
      en: "Your sentences are long. Short, direct phrasing reads better.",
    });
  }

  // Positive reinforcement when things look good.
  if (score >= 75) {
    out.push({
      level: "good",
      es: `Buen trabajo: tu CV coincide con el ${score}% de las palabras clave de la vacante.`,
      en: `Nice work: your resume matches ${score}% of the posting's keywords.`,
    });
  }
  if (m.quantified >= 5) {
    out.push({
      level: "good",
      es: "Excelente: tu CV incluye varios resultados cuantificados.",
      en: "Excellent: your resume includes several quantified results.",
    });
  }

  if (out.length === 0) {
    out.push({
      level: "good",
      es: "Tu CV se ve bien optimizado para esta vacante.",
      en: "Your resume looks well optimized for this posting.",
    });
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Sample texts (realistic, in Spanish) — make the tool work instantly */
/* ------------------------------------------------------------------ */

export const SAMPLE_CV = `Ingeniero de Datos / IA con 5 años de experiencia construyendo pipelines de datos y modelos de machine learning en producción.

EXPERIENCIA
Senior Data Engineer — Fintech MX (2022–presente)
- Lideré la migración del data warehouse a Snowflake, reduciendo costos de cómputo en un 38%.
- Desarrollé pipelines de ETL en Python y Airflow que procesan 12 millones de eventos diarios.
- Implementé modelos de machine learning con scikit-learn para detección de fraude, mejorando la precisión un 22%.
- Construí dashboards en Power BI para el equipo de finanzas.

Data Analyst — Retail Group (2019–2022)
- Automaticé reportes con SQL y pandas, ahorrando 15 horas semanales al equipo.
- Diseñé un modelo de segmentación de clientes que aumentó la conversión un 18%.

HABILIDADES
Python, SQL, pandas, NumPy, Airflow, Docker, Git, Power BI, scikit-learn, AWS.

EDUCACIÓN
Ing. en Ciencias de la Computación — Tecnológico de Monterrey.`;

export const SAMPLE_JOB = `Buscamos un/a Ingeniero/a de Datos Senior para unirse a nuestro equipo de plataforma de datos.

Responsabilidades:
- Diseñar y mantener pipelines de datos escalables (ETL/ELT) en Python.
- Construir y optimizar nuestro data lakehouse en Databricks y Spark (PySpark).
- Implementar procesos de orquestación con Airflow y modelado de datos con dbt.
- Desplegar servicios en la nube (AWS) usando Docker y Kubernetes.
- Colaborar con el equipo de machine learning para llevar modelos a producción (MLOps).

Requisitos:
- Experiencia sólida con Python, SQL y Spark.
- Conocimiento de Databricks, Airflow y dbt.
- Experiencia con servicios de AWS (S3, Lambda) y Docker.
- Deseable: Snowflake, Terraform, CI/CD y dashboards en Power BI o Tableau.
- Experiencia con machine learning y despliegue de modelos es un plus.`;
