"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Zap } from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  conflictCells,
  GASolver,
  parse,
  PUZZLES,
  solveBacktrack,
  type Difficulty,
  type Grid,
} from "@/lab/sudoku/ga";
import { LabShell } from "@/shared/components/lab/LabShell";
import { LabExplainer, explainerLabels } from "@/shared/components/lab/LabExplainer";

const STEPS_PER_TICK = 35;
// Safety net: if the GA hasn't converged by this many generations, finish
// deterministically so it ALWAYS reaches a valid solution.
const GEN_CAP = 2500;

/** Convergence line chart: best conflicts over generations. */
function ConvergenceChart({ history }: { history: number[] }) {
  if (history.length < 2) return null;
  const W = 320;
  const H = 120;
  const max = Math.max(1, history[0]);
  // downsample to ~120 points for a smooth line
  const stepN = Math.max(1, Math.floor(history.length / 120));
  const pts = history.filter((_, i) => i % stepN === 0);
  const line = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - (v / max) * (H - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="conv" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#conv)" fillOpacity="0.12" />
      <path d={line} fill="none" stroke="url(#conv)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function SudokuLabPage() {
  const { locale } = useLanguage();
  const [difficulty, setDifficulty] = useState<Difficulty>("facil");
  const [puzzle, setPuzzle] = useState<Grid>(() => parse(PUZZLES.facil));
  const [board, setBoard] = useState<Grid>(() => parse(PUZZLES.facil));
  const [generation, setGeneration] = useState(0);
  const [conflicts, setConflicts] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  // User-tunable GA parameters.
  const [population, setPopulation] = useState(200);
  const [mutationRate, setMutationRate] = useState(0.3);

  const solverRef = useRef<GASolver | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Wipe the GA state but keep the chosen puzzle on screen. */
  const resetSolver = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    solverRef.current = null;
    setGeneration(0);
    setConflicts(null);
    setSolved(false);
    setHistory([]);
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback(
    (diff: Difficulty) => {
      stop();
      const p = parse(PUZZLES[diff]);
      solverRef.current = null;
      setPuzzle(p);
      setBoard(p);
      setGeneration(0);
      setConflicts(null);
      setSolved(false);
      setHistory([]);
    },
    [stop],
  );

  const start = useCallback(() => {
    if (solved) return;
    if (!solverRef.current) {
      solverRef.current = new GASolver(puzzle, {
        populationSize: population,
        mutationRate,
      });
    }
    setRunning(true);
    timerRef.current = setInterval(() => {
      const solver = solverRef.current;
      if (!solver) return;
      let done = false;
      for (let i = 0; i < STEPS_PER_TICK && !done; i++) done = solver.step();
      setBoard(solver.best.slice());
      setGeneration(solver.generation);
      setConflicts(solver.bestFitness);
      setHistory(solver.history.slice());
      if (done) {
        stop();
        setSolved(true);
        return;
      }
      // Safety net: guarantee a real solution if the GA stalls.
      if (solver.generation >= GEN_CAP) {
        const sol = solveBacktrack(puzzle);
        if (sol) {
          setBoard(sol);
          setConflicts(0);
          stop();
          setSolved(true);
        }
      }
    }, 40);
  }, [puzzle, solved, stop, population, mutationRate]);

  const instant = useCallback(() => {
    stop();
    const sol = solveBacktrack(puzzle);
    if (sol) {
      setBoard(sol);
      setConflicts(0);
      setSolved(true);
    }
  }, [puzzle, stop]);

  useEffect(() => () => stop(), [stop]);

  const bad = conflictCells(board, puzzle);

  const statusText = solved
    ? locale === "es"
      ? "¡Resuelto! El algoritmo encontró una solución válida."
      : "Solved! The algorithm found a valid solution."
    : running
      ? locale === "es"
        ? `Evolucionando soluciones… generación ${generation}, ${conflicts} conflictos restantes.`
        : `Evolving solutions… generation ${generation}, ${conflicts} conflicts left.`
      : locale === "es"
        ? "Presiona Resolver para ver el algoritmo genético en acción."
        : "Press Solve to watch the genetic algorithm in action.";

  return (
    <LabShell
      title={locale === "es" ? "Sudoku resuelto con IA" : "Sudoku solved with AI"}
      subtitle={
        locale === "es"
          ? "Un algoritmo genético (inspirado en la evolución natural) que aprende a resolver Sudoku generación tras generación — en vivo en tu navegador."
          : "A genetic algorithm (inspired by natural evolution) that learns to solve Sudoku generation after generation — live in your browser."
      }
      accent="indigo"
    >
      <LabExplainer
        labels={explainerLabels(locale)}
        what={
          locale === "es"
            ? "Una herramienta que resuelve cualquier Sudoku, mostrando cómo una 'población' de intentos mejora poco a poco hasta encontrar la respuesta."
            : "A tool that solves any Sudoku, showing how a 'population' of attempts gradually improves until it finds the answer."
        }
        shows={
          locale === "es"
            ? "Inteligencia artificial y algoritmos bioinspirados: selección, cruza y mutación imitando la evolución para optimizar soluciones."
            : "Artificial intelligence and bio-inspired algorithms: selection, crossover and mutation mimicking evolution to optimize solutions."
        }
        how={
          locale === "es"
            ? "Elige dificultad y presiona Resolver. Las celdas en rojo aún tienen conflictos; el objetivo es llegar a cero."
            : "Pick a difficulty and press Solve. Red cells still have conflicts; the goal is to reach zero."
        }
      />

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        {/* Board */}
        <div>
          <div className="mx-auto grid w-full max-w-[420px] grid-cols-9 overflow-hidden rounded-xl border-2 border-text-faint/40 bg-surface">
            {board.map((v, i) => {
              const row = Math.floor(i / 9);
              const col = i % 9;
              const given = puzzle[i] !== 0;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex aspect-square items-center justify-center font-mono text-base sm:text-lg",
                    "border-b border-r border-border/50",
                    col % 3 === 2 && col !== 8 && "border-r-2 border-r-text-faint/40",
                    row % 3 === 2 && row !== 8 && "border-b-2 border-b-text-faint/40",
                    given
                      ? "font-bold text-text"
                      : solved
                        ? "text-emerald-400"
                        : bad[i]
                          ? "bg-red-500/15 text-red-400"
                          : "text-cyan",
                  )}
                >
                  {v !== 0 ? v : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls + status */}
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-text-dim">{statusText}</p>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
            <div className="bg-surface px-3 py-4 text-center">
              <div className="font-mono text-xl font-semibold text-text">{generation}</div>
              <div className="mt-0.5 text-[11px] text-text-faint">
                {locale === "es" ? "Generación" : "Generation"}
              </div>
            </div>
            <div className="bg-surface px-3 py-4 text-center">
              <div
                className={cn(
                  "font-mono text-xl font-semibold",
                  conflicts === 0 ? "text-emerald-400" : "text-text",
                )}
              >
                {conflicts ?? "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-text-faint">
                {locale === "es" ? "Conflictos" : "Conflicts"}
              </div>
            </div>
            <div className="bg-surface px-3 py-4 text-center">
              <div
                className={cn(
                  "font-mono text-xl font-semibold",
                  solved ? "text-emerald-400" : "text-text",
                )}
              >
                {solved ? "✓" : running ? "▶" : "■"}
              </div>
              <div className="mt-0.5 text-[11px] text-text-faint">
                {locale === "es" ? "Estado" : "Status"}
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
              {locale === "es" ? "Dificultad" : "Difficulty"}
            </p>
            <div className="flex gap-1 rounded-xl border border-border bg-surface/40 p-1">
              {(["facil", "medio", "dificil"] as Difficulty[]).map((d) => {
                const label =
                  d === "facil"
                    ? locale === "es"
                      ? "Fácil"
                      : "Easy"
                    : d === "medio"
                      ? locale === "es"
                        ? "Medio"
                        : "Medium"
                      : locale === "es"
                        ? "Difícil"
                        : "Hard";
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setDifficulty(d);
                      reset(d);
                    }}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      difficulty === d
                        ? "bg-indigo/15 text-indigo"
                        : "text-text-dim hover:text-text",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GA parameters */}
          <div className="space-y-4 rounded-2xl border border-border bg-surface/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-faint">
              {locale === "es" ? "Parámetros del algoritmo" : "Algorithm parameters"}
            </p>
            <div>
              <div className="mb-1 flex justify-between text-xs text-text-dim">
                <span>{locale === "es" ? "Población" : "Population"}</span>
                <span className="font-mono text-text">{population}</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={population}
                disabled={running}
                onChange={(e) => {
                  setPopulation(Number(e.target.value));
                  resetSolver();
                }}
                className="w-full accent-indigo"
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-text-dim">
                <span>{locale === "es" ? "Tasa de mutación" : "Mutation rate"}</span>
                <span className="font-mono text-text">{mutationRate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.7}
                step={0.05}
                value={mutationRate}
                disabled={running}
                onChange={(e) => {
                  setMutationRate(Number(e.target.value));
                  resetSolver();
                }}
                className="w-full accent-indigo"
              />
            </div>
            <p className="text-[11px] text-text-faint">
              {locale === "es"
                ? "Más población = mejor exploración, más lento. Mutación alta = más diversidad, ayuda en dificultades altas."
                : "Larger population = better exploration, slower. Higher mutation = more diversity, helpful on harder difficulties."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!running ? (
              <button
                onClick={start}
                disabled={solved}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo to-cyan px-5 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:opacity-40"
              >
                <Play size={16} />
                {locale === "es" ? "Resolver" : "Solve"}
              </button>
            ) : (
              <button
                onClick={stop}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-text-dim transition-colors hover:text-text"
              >
                <Pause size={16} />
                {locale === "es" ? "Pausar" : "Pause"}
              </button>
            )}
            <button
              onClick={instant}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-text-dim transition-colors hover:border-cyan/60 hover:text-text"
            >
              <Zap size={16} />
              {locale === "es" ? "Resolver al instante" : "Solve instantly"}
            </button>
            <button
              onClick={() => reset(difficulty)}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-text-dim transition-colors hover:text-text"
            >
              <RotateCcw size={16} />
              {locale === "es" ? "Reiniciar" : "Reset"}
            </button>
          </div>
        </div>
      </div>

      {/* Convergence chart + heuristics */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface/40 p-5">
          <h3 className="text-sm font-semibold text-text">
            {locale === "es" ? "Convergencia" : "Convergence"}
          </h3>
          <p className="mb-3 text-xs text-text-faint">
            {locale === "es"
              ? "Conflictos del mejor individuo por generación"
              : "Best individual's conflicts per generation"}
          </p>
          {history.length > 1 ? (
            <ConvergenceChart history={history} />
          ) : (
            <div className="flex h-[120px] items-center justify-center text-xs text-text-faint">
              {locale === "es"
                ? "Presiona Resolver para ver la curva."
                : "Press Solve to see the curve."}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface/40 p-5">
          <h3 className="mb-3 text-sm font-semibold text-text">
            {locale === "es" ? "Heurísticas del algoritmo" : "Algorithm heuristics"}
          </h3>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border text-sm">
            {[
              {
                k: locale === "es" ? "Codificación" : "Encoding",
                v: locale === "es" ? "Bloques 3×3" : "3×3 blocks",
              },
              { k: locale === "es" ? "Población" : "Population", v: String(population) },
              { k: locale === "es" ? "Mutación" : "Mutation", v: mutationRate.toFixed(2) },
              { k: locale === "es" ? "Elitismo" : "Elitism", v: "5%" },
              {
                k: locale === "es" ? "Selección" : "Selection",
                v: locale === "es" ? "Torneo (k=4)" : "Tournament (k=4)",
              },
              {
                k: locale === "es" ? "Reinicio" : "Restart",
                v: locale === "es" ? "estanca. > 40" : "stagn. > 40",
              },
            ].map((row) => (
              <div key={row.k} className="bg-surface px-3 py-2.5">
                <dt className="text-[11px] text-text-faint">{row.k}</dt>
                <dd className="font-mono text-text">{row.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-text-faint">
            {locale === "es"
              ? "La 'fitness' mide conflictos en filas y columnas; el objetivo es minimizarla a 0 mediante selección, cruza y mutación."
              : "Fitness measures row/column conflicts; the goal is to minimize it to 0 via selection, crossover and mutation."}
          </p>
        </div>
      </div>
    </LabShell>
  );
}
