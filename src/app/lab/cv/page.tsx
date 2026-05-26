"use client";

import React, { useMemo, useState } from "react";
import {
  AlignLeft,
  BadgeCheck,
  Brain,
  CheckCircle2,
  FileText,
  Hash,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { analyzeAts, SAMPLE_CV, SAMPLE_JOB, type Suggestion } from "@/lab/cv/ats";
import { LabShell } from "@/shared/components/lab/LabShell";
import { LabExplainer, explainerLabels } from "@/shared/components/lab/LabExplainer";
import { NlpPanel } from "./NlpPanel";

function scoreColor(score: number) {
  if (score >= 75) return "text-cyan";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}

function suggestionStyle(level: Suggestion["level"]) {
  if (level === "high") return "border-red-500/30 bg-red-500/10 text-red-300";
  if (level === "medium") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-cyan/30 bg-cyan/10 text-cyan";
}

type TabKey = "ats" | "nlp";

export default function CvLabPage() {
  const { locale } = useLanguage();
  const [cv, setCv] = useState(SAMPLE_CV);
  const [job, setJob] = useState(SAMPLE_JOB);
  const [tab, setTab] = useState<TabKey>("ats");

  const result = useMemo(() => analyzeAts(cv, job), [cv, job]);

  const metricCards = [
    {
      icon: Hash,
      label: locale === "es" ? "Palabras" : "Words",
      value: result.metrics.words,
    },
    {
      icon: ListChecks,
      label: locale === "es" ? "Viñetas" : "Bullets",
      value: result.metrics.bullets,
    },
    {
      icon: Zap,
      label: locale === "es" ? "Verbos de acción" : "Action verbs",
      value: result.metrics.actionVerbs,
    },
    {
      icon: TrendingUp,
      label: locale === "es" ? "Resultados con métricas" : "Quantified results",
      value: result.metrics.quantified,
    },
    {
      icon: AlignLeft,
      label: locale === "es" ? "Long. media de frase" : "Avg sentence length",
      value: result.metrics.avgSentenceLen.toFixed(1),
    },
  ];

  return (
    <LabShell
      title={locale === "es" ? "Optimizador de CV para ATS" : "ATS resume optimizer"}
      subtitle={
        locale === "es"
          ? "Compara tu CV con una oferta de trabajo como lo haría un sistema de selección automático (ATS): mide la coincidencia de palabras clave y te dice exactamente qué agregar. Todo en tu navegador."
          : "Compare your resume against a job posting the way an Applicant Tracking System (ATS) would: it measures keyword match and tells you exactly what to add. All in your browser."
      }
      accent="indigo"
    >
      <LabExplainer
        labels={explainerLabels(locale)}
        what={
          locale === "es"
            ? "Una herramienta que revisa tu currículum frente a una oferta de empleo y te dice qué tan bien encajan, igual que los filtros automáticos que usan las empresas."
            : "A tool that checks your resume against a job posting and tells you how well they fit — just like the automated filters companies use."
        }
        shows={
          locale === "es"
            ? "Procesamiento de texto y lógica de coincidencia: extrae las palabras clave de la vacante, las busca en tu CV y calcula un porcentaje de afinidad."
            : "Text processing and matching logic: it extracts the posting's keywords, finds them in your resume, and computes a match percentage."
        }
        how={
          locale === "es"
            ? "Pega tu CV a la izquierda y la oferta de trabajo a la derecha. El análisis se actualiza al instante: revisa tu puntaje y agrega las palabras que faltan."
            : "Paste your resume on the left and the job posting on the right. The analysis updates instantly: check your score and add the missing keywords."
        }
      />

      {/* Inputs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
            <FileText size={15} className="text-indigo" />
            {locale === "es" ? "Tu CV" : "Your resume"}
          </div>
          <textarea
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder={locale === "es" ? "Pega aquí tu CV…" : "Paste your resume here…"}
            className="w-full resize-y rounded-2xl border border-border bg-surface/40 p-4 text-sm leading-relaxed text-text outline-none transition-colors focus:border-indigo/60"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text">
            <Target size={15} className="text-cyan" />
            {locale === "es" ? "Descripción de la vacante" : "Job description"}
          </div>
          <textarea
            value={job}
            onChange={(e) => setJob(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder={
              locale === "es" ? "Pega aquí la oferta de trabajo…" : "Paste the job posting here…"
            }
            className="w-full resize-y rounded-2xl border border-border bg-surface/40 p-4 text-sm leading-relaxed text-text outline-none transition-colors focus:border-indigo/60"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setCv(SAMPLE_CV);
            setJob(SAMPLE_JOB);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm text-text-dim transition-colors hover:border-indigo/60 hover:text-text"
        >
          <RotateCcw size={14} />
          {locale === "es" ? "Restaurar ejemplo" : "Reset example"}
        </button>
        <button
          onClick={() => {
            setCv("");
            setJob("");
          }}
          className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-dim transition-colors hover:border-indigo/60 hover:text-text"
        >
          {locale === "es" ? "Limpiar todo" : "Clear all"}
        </button>
      </div>

      {/* Tabs: ATS (default) vs advanced NLP analysis */}
      <div className="mt-8 inline-flex rounded-xl border border-border bg-surface/40 p-1">
        <button
          onClick={() => setTab("ats")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm transition-colors",
            tab === "ats"
              ? "bg-indigo/15 text-indigo"
              : "text-text-dim hover:text-text",
          )}
        >
          <BadgeCheck size={14} />
          ATS
        </button>
        <button
          onClick={() => setTab("nlp")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm transition-colors",
            tab === "nlp"
              ? "bg-indigo/15 text-indigo"
              : "text-text-dim hover:text-text",
          )}
        >
          <Brain size={14} />
          {locale === "es" ? "NLP avanzado" : "Advanced NLP"}
          <Sparkles size={12} className="text-amber-400" />
        </button>
      </div>

      {tab === "nlp" ? (
        <div className="mt-6">
          <NlpPanel cv={cv} job={job} />
        </div>
      ) : (
        <>
      {/* Match score — the visual focus */}
      <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 text-sm text-text-dim sm:justify-start">
              <BadgeCheck size={16} className="text-indigo" />
              {locale === "es" ? "Coincidencia con la vacante" : "Match with the posting"}
            </div>
            <div className={cn("mt-1 font-mono text-6xl font-bold tabular-nums", scoreColor(result.score))}>
              {result.score}
              <span className="text-3xl">%</span>
            </div>
            <p className="mt-1 text-xs text-text-faint">
              {locale === "es"
                ? `${result.matched.length} de ${result.totalKeywords} palabras clave`
                : `${result.matched.length} of ${result.totalKeywords} keywords`}
            </p>
          </div>

          <div className="w-full flex-1">
            <div className="h-4 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo to-cyan transition-[width] duration-700"
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-text-faint">
              <span>0%</span>
              <span>
                {result.score >= 75
                  ? locale === "es"
                    ? "Excelente afinidad"
                    : "Great fit"
                  : result.score >= 45
                    ? locale === "es"
                      ? "Afinidad media — mejorable"
                      : "Medium fit — improvable"
                    : locale === "es"
                      ? "Afinidad baja — agrega palabras clave"
                      : "Low fit — add keywords"}
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords: missing (focus) + matched */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
            <XCircle size={16} className="text-amber-400" />
            {locale === "es" ? "Palabras clave que faltan" : "Missing keywords"}
            <span className="font-mono text-text-faint">({result.missing.length})</span>
          </h3>
          <p className="mb-3 text-xs text-text-dim">
            {locale === "es"
              ? "Agrega estas palabras a tu CV (si aplican a tu experiencia) para subir tu puntaje."
              : "Add these words to your resume (where they truly apply) to raise your score."}
          </p>
          <div className="flex flex-wrap gap-2">
            {result.missing.map((kw) => (
              <span
                key={kw}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
              >
                {kw}
              </span>
            ))}
            {result.missing.length === 0 && (
              <p className="text-xs text-cyan">
                {locale === "es"
                  ? "¡Tu CV cubre todas las palabras clave detectadas!"
                  : "Your resume covers every detected keyword!"}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
            <CheckCircle2 size={16} className="text-cyan" />
            {locale === "es" ? "Palabras clave encontradas" : "Matched keywords"}
            <span className="font-mono text-text-faint">({result.matched.length})</span>
          </h3>
          <p className="mb-3 text-xs text-text-dim">
            {locale === "es"
              ? "Estas palabras de la vacante ya aparecen en tu CV."
              : "These posting keywords already appear in your resume."}
          </p>
          <div className="flex flex-wrap gap-2">
            {result.matched.map((kw) => (
              <span
                key={kw}
                className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan"
              >
                {kw}
              </span>
            ))}
            {result.matched.length === 0 && (
              <p className="text-xs text-text-faint">
                {locale === "es" ? "Aún no hay coincidencias." : "No matches yet."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CV quality metrics */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-text">
          {locale === "es" ? "Calidad de tu CV" : "Resume quality"}
        </h3>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {metricCards.map((c) => (
            <div key={c.label} className="bg-surface px-4 py-5 text-center">
              <c.icon size={16} className="mx-auto mb-2 text-indigo" />
              <div className="font-mono text-2xl font-semibold text-text">{c.value}</div>
              <div className="mt-1 text-[11px] leading-tight text-text-faint">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
          <Lightbulb size={16} className="text-amber-400" />
          {locale === "es" ? "Sugerencias para mejorar" : "Suggestions to improve"}
        </h3>
        <ul className="space-y-2.5">
          {result.suggestions.map((s, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2 rounded-xl border px-4 py-2.5 text-sm",
                suggestionStyle(s.level),
              )}
            >
              <span className="mt-0.5 shrink-0">
                {s.level === "good" ? (
                  <CheckCircle2 size={15} />
                ) : s.level === "high" ? (
                  <XCircle size={15} />
                ) : (
                  <Lightbulb size={15} />
                )}
              </span>
              <span>{locale === "es" ? s.es : s.en}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-xs text-text-faint">
        {locale === "es"
          ? "Nota: este análisis es una guía. Agrega solo palabras clave que reflejen tu experiencia real."
          : "Note: this analysis is a guide. Only add keywords that reflect your real experience."}
      </p>
        </>
      )}
    </LabShell>
  );
}
