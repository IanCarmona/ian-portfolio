"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Pause, Play, RotateCcw, Shuffle } from "lucide-react";

import { cn } from "@/utils/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  randomPoints,
  TSPSolver,
  tourDistance,
  type Point,
} from "@/lab/tsp/ga";
import { LabShell } from "@/shared/components/lab/LabShell";
import { LabExplainer, explainerLabels } from "@/shared/components/lab/LabExplainer";

const CANVAS_W = 600;
const CANVAS_H = 380;
const STEPS_PER_TICK = 30;
const INITIAL_COUNT = 12;

/** Convergence line chart: best route distance over generations. */
function ConvergenceChart({ history }: { history: number[] }) {
  if (history.length < 2) return null;
  const W = 320;
  const H = 120;
  const max = Math.max(1, history[0]);
  const min = Math.min(...history);
  const range = Math.max(1, max - min);
  // downsample to ~120 points for a smooth line
  const stepN = Math.max(1, Math.floor(history.length / 120));
  const pts = history.filter((_, i) => i % stepN === 0);
  const line = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 12) - 6;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="convRutas" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#convRutas)" fillOpacity="0.12" />
      <path d={line} fill="none" stroke="url(#convRutas)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function RutasLabPage() {
  const { locale } = useLanguage();

  const [points, setPoints] = useState<Point[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [generation, setGeneration] = useState(0);
  const [bestDistance, setBestDistance] = useState<number | null>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [converged, setConverged] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  // User-tunable parameters.
  const [numStops, setNumStops] = useState(INITIAL_COUNT);
  const [population, setPopulation] = useState(250);
  const [mutation, setMutation] = useState(0.25);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const solverRef = useRef<TSPSolver | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const orderRef = useRef<number[]>([]);
  const prevBestRef = useRef<number | null>(null);
  const stallRef = useRef(0);

  // Keep refs in sync so the draw routine always sees the latest data.
  pointsRef.current = points;
  orderRef.current = order;

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  }, []);

  /** Reset the GA state for the current set of points. */
  const resetSolver = useCallback(() => {
    solverRef.current = null;
    prevBestRef.current = null;
    stallRef.current = 0;
    setGeneration(0);
    setBestDistance(null);
    setInitialDistance(null);
    setHistory([]);
    setConverged(false);
  }, []);

  // Pre-populate with random cities on mount.
  useEffect(() => {
    const initial = randomPoints(INITIAL_COUNT, CANVAS_W, CANVAS_H);
    setPoints(initial);
    setOrder(initial.map((_, i) => i));
  }, []);

  // --- Drawing -------------------------------------------------------------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== CANVAS_W * dpr || canvas.height !== CANVAS_H * dpr) {
      canvas.width = CANVAS_W * dpr;
      canvas.height = CANVAS_H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const pts = pointsRef.current;
    const ord = orderRef.current;

    // Route polyline (closed loop) with an indigo -> cyan gradient stroke.
    if (pts.length >= 2 && ord.length === pts.length) {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
      grad.addColorStop(0, "#8b5cf6");
      grad.addColorStop(1, "#22d3ee");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < ord.length; i++) {
        const p = pts[ord[i]];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Cities as filled dots; the start city highlighted.
    pts.forEach((p, i) => {
      const isStart = ord.length > 0 ? ord[0] === i : i === 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isStart ? 7 : 4.5, 0, Math.PI * 2);
      if (isStart) {
        ctx.fillStyle = "#22d3ee";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(34,211,238,0.35)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#a5b4fc";
        ctx.fill();
      }
    });
  }, []);

  // Redraw whenever points or order change (and on mount).
  useEffect(() => {
    draw();
  }, [points, order, draw]);

  // --- Interaction ---------------------------------------------------------
  const addCity = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (running) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
      const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
      setPoints((prev) => {
        const next = [...prev, { x, y }];
        setOrder(next.map((_, i) => i));
        return next;
      });
      resetSolver();
    },
    [running, resetSolver],
  );

  const generateRandom = useCallback(() => {
    stop();
    const next = randomPoints(numStops, CANVAS_W, CANVAS_H);
    setPoints(next);
    setOrder(next.map((_, i) => i));
    resetSolver();
  }, [stop, resetSolver, numStops]);

  const clearCities = useCallback(() => {
    stop();
    setPoints([]);
    setOrder([]);
    resetSolver();
  }, [stop, resetSolver]);

  const start = useCallback(() => {
    if (points.length < 3) return;
    if (!solverRef.current) {
      solverRef.current = new TSPSolver(points, {
        populationSize: population,
        mutationRate: mutation,
      });
      setInitialDistance(solverRef.current.initialDistance);
    }
    setConverged(false);
    setRunning(true);
    timerRef.current = setInterval(() => {
      const solver = solverRef.current;
      if (!solver) return;
      for (let i = 0; i < STEPS_PER_TICK; i++) solver.step();
      setOrder(solver.best.slice());
      setGeneration(solver.generation);
      setBestDistance(solver.bestDistance);
      setHistory(solver.history.slice());

      // Plateau detection: stop once the best route stops improving.
      const d = solver.bestDistance;
      if (prevBestRef.current !== null && d >= prevBestRef.current - 0.5) {
        stallRef.current++;
      } else {
        stallRef.current = 0;
      }
      prevBestRef.current = d;
      if (stallRef.current >= 60) {
        stop();
        setConverged(true);
      }
    }, 40);
  }, [points, stop, population, mutation]);

  const reset = useCallback(() => {
    stop();
    resetSolver();
    setOrder(points.map((_, i) => i));
  }, [stop, resetSolver, points]);

  useEffect(() => () => stop(), [stop]);

  // --- Derived -------------------------------------------------------------
  const currentDistance =
    bestDistance ?? (points.length >= 2 ? tourDistance(order, points) : null);
  const improvement =
    initialDistance && bestDistance && initialDistance > 0
      ? ((initialDistance - bestDistance) / initialDistance) * 100
      : 0;

  const canRun = points.length >= 3;

  const statusText = !canRun
    ? locale === "es"
      ? "Haz clic en el mapa o genera puntos: necesitas al menos 3 paradas."
      : "Click on the map or generate points: you need at least 3 stops."
    : converged
      ? locale === "es"
        ? `✓ Ruta óptima encontrada en ${generation} generaciones: ${improvement.toFixed(1)}% más corta que la inicial.`
        : `✓ Optimal route found in ${generation} generations: ${improvement.toFixed(1)}% shorter than the initial one.`
      : running
        ? locale === "es"
          ? `Optimizando ruta… generación ${generation}, distancia ${currentDistance?.toFixed(0)} px.`
          : `Optimizing route… generation ${generation}, distance ${currentDistance?.toFixed(0)} px.`
        : bestDistance !== null
          ? locale === "es"
            ? `Ruta optimizada: ${improvement.toFixed(1)}% más corta que la inicial.`
            : `Optimized route: ${improvement.toFixed(1)}% shorter than the initial one.`
          : locale === "es"
            ? "Presiona Optimizar para encontrar la ruta más corta."
            : "Press Optimize to find the shortest route.";

  return (
    <LabShell
      title={locale === "es" ? "Optimizador de rutas" : "Route optimizer"}
      subtitle={
        locale === "es"
          ? "Un algoritmo genético que encuentra la ruta de reparto más corta entre varias paradas — el clásico Problema del Agente Viajero (TSP), en vivo en tu navegador."
          : "A genetic algorithm that finds the shortest delivery route across many stops — the classic Traveling Salesman Problem (TSP), live in your browser."
      }
      accent="indigo"
    >
      <LabExplainer
        labels={explainerLabels(locale)}
        what={
          locale === "es"
            ? "Encuentra la ruta más corta para visitar varios puntos, como un repartidor que quiere ahorrar tiempo y gasolina visitando todas sus entregas y regresando a la base."
            : "It finds the shortest route to visit several points, like a delivery driver who wants to save time and fuel by hitting every drop-off and returning to base."
        }
        shows={
          locale === "es"
            ? "Algoritmos genéticos y optimización combinatoria: cruza ordenada, mutación y selección imitando la evolución para resolver un problema clásico de logística."
            : "Genetic algorithms and combinatorial optimization: ordered crossover, mutation and selection mimicking evolution to crack a classic logistics problem."
        }
        how={
          locale === "es"
            ? "Haz clic en el mapa para agregar paradas (o genera puntos al azar) y presiona Optimizar. La línea muestra la mejor ruta encontrada mejorando en vivo."
            : "Click the map to add stops (or generate random points) and press Optimize. The line shows the best route found, improving live."
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Map / canvas */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-dim">
            {[
              locale === "es" ? "Agrega paradas (clic) o «Generar aleatorio»" : "Add stops (click) or «Generate random»",
              locale === "es" ? "Presiona «Optimizar»" : "Press «Optimize»",
              locale === "es" ? "Mira la ruta acortarse en vivo" : "Watch the route shrink live",
            ].map((txt, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo/15 font-mono text-[11px] font-semibold text-indigo">
                  {i + 1}
                </span>
                {txt}
              </span>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface/40">
            <canvas
              ref={canvasRef}
              onClick={addCity}
              style={{ width: "100%", aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
              className={cn(
                "block w-full touch-none",
                running ? "cursor-not-allowed" : "cursor-crosshair",
              )}
            />
          </div>
          <p className="mt-2 text-xs text-text-faint">
            {locale === "es"
              ? "El punto cian es el inicio (la base). Haz clic para agregar paradas."
              : "The cyan dot is the start (the depot). Click to add stops."}
          </p>

          {/* Map actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={generateRandom}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-text-dim transition-colors hover:border-indigo/60 hover:text-text"
            >
              <Shuffle size={16} />
              {locale === "es" ? "Generar aleatorio" : "Generate random"}
            </button>
            <button
              onClick={clearCities}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-text-dim transition-colors hover:text-text"
            >
              <MapPin size={16} />
              {locale === "es" ? "Limpiar" : "Clear"}
            </button>
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
              <div className="font-mono text-xl font-semibold text-text">
                {currentDistance !== null ? currentDistance.toFixed(0) : "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-text-faint">
                {locale === "es" ? "Distancia" : "Distance"}
              </div>
            </div>
            <div className="bg-surface px-3 py-4 text-center">
              <div
                className={cn(
                  "font-mono text-xl font-semibold",
                  improvement > 0 ? "text-emerald-400" : "text-text",
                )}
              >
                {improvement > 0 ? `${improvement.toFixed(0)}%` : "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-text-faint">
                {locale === "es" ? "Mejora" : "Improvement"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!running ? (
              <button
                onClick={start}
                disabled={!canRun}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo to-cyan px-5 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:opacity-40"
              >
                <Play size={16} />
                {locale === "es" ? "Optimizar" : "Optimize"}
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
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-text-dim transition-colors hover:text-text"
            >
              <RotateCcw size={16} />
              {locale === "es" ? "Reiniciar" : "Reset"}
            </button>
          </div>

          {/* Parameters */}
          <div className="space-y-4 rounded-2xl border border-border bg-surface/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-faint">
              {locale === "es" ? "Parámetros" : "Parameters"}
            </p>
            <div>
              <div className="mb-1 flex justify-between text-xs text-text-dim">
                <span>{locale === "es" ? "Paradas a generar" : "Stops to generate"}</span>
                <span className="font-mono text-text">{numStops}</span>
              </div>
              <input
                type="range"
                min={4}
                max={100}
                value={numStops}
                disabled={running}
                onChange={(e) => setNumStops(Number(e.target.value))}
                className="w-full accent-indigo"
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-text-dim">
                <span>{locale === "es" ? "Población" : "Population"}</span>
                <span className="font-mono text-text">{population}</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
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
                <span className="font-mono text-text">{mutation.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.6}
                step={0.05}
                value={mutation}
                disabled={running}
                onChange={(e) => {
                  setMutation(Number(e.target.value));
                  resetSolver();
                }}
                className="w-full accent-indigo"
              />
            </div>
          </div>

          {/* Cities count */}
          <div className="rounded-2xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-dim">
                {locale === "es" ? "Paradas en el mapa" : "Stops on the map"}
              </span>
              <span className="font-mono font-semibold text-text">{points.length}</span>
            </div>
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
              ? "Distancia de la mejor ruta por generación"
              : "Best route distance per generation"}
          </p>
          {history.length > 1 ? (
            <ConvergenceChart history={history} />
          ) : (
            <div className="flex h-[120px] items-center justify-center text-xs text-text-faint">
              {locale === "es"
                ? "Presiona Optimizar para ver la curva."
                : "Press Optimize to see the curve."}
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
                v: locale === "es" ? "Permutación" : "Permutation",
              },
              { k: locale === "es" ? "Población" : "Population", v: String(population) },
              {
                k: locale === "es" ? "Cruza" : "Crossover",
                v: locale === "es" ? "Ordenada (OX)" : "Ordered (OX)",
              },
              { k: locale === "es" ? "Mutación" : "Mutation", v: mutation.toFixed(2) },
              { k: locale === "es" ? "Elitismo" : "Elitism", v: "8%" },
              {
                k: locale === "es" ? "Selección" : "Selection",
                v: locale === "es" ? "Torneo (k=5)" : "Tournament (k=5)",
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
              ? "La 'fitness' mide la longitud total del recorrido cerrado; el objetivo es minimizarla mediante cruza ordenada, mutación (intercambio e inversión) y selección por torneo."
              : "Fitness measures the total closed-loop length; the goal is to minimize it via ordered crossover, mutation (swap & inversion) and tournament selection."}
          </p>
        </div>
      </div>
    </LabShell>
  );
}
