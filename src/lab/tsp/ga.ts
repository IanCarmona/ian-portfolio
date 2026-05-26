/**
 * Genetic-algorithm solver for the Traveling Salesman Problem (TSP).
 *
 * Real-world framing: a delivery driver who must visit a set of stops and
 * return to the depot, wanting the shortest possible route to save time and
 * fuel. Runs 100% client-side.
 *
 * Encoding: each individual ("tour") is a permutation of city indices. Fitness
 * is the total euclidean length of the CLOSED loop (last city back to the
 * first). Tournament selection, ORDERED CROSSOVER (OX), swap + occasional
 * segment-inversion mutation, and elitism. Tuned to stay smooth for ~50 cities.
 */

export interface Point {
  x: number;
  y: number;
}

/** Euclidean distance between two points. */
function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Total length of a closed tour (returns to the starting city). */
export function tourDistance(order: number[], points: Point[]): number {
  if (order.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < order.length; i++) {
    const a = points[order[i]];
    const b = points[order[(i + 1) % order.length]];
    total += dist(a, b);
  }
  return total;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** A random permutation 0..n-1. */
function randomTour(n: number): number[] {
  return shuffle(Array.from({ length: n }, (_, i) => i));
}

/**
 * Ordered crossover (OX): copy a slice of parent A, then fill the rest with the
 * remaining cities in the order they appear in parent B. Produces a valid
 * permutation that preserves relative ordering from both parents.
 */
function orderedCrossover(a: number[], b: number[]): number[] {
  const n = a.length;
  const child = new Array<number>(n).fill(-1);
  let start = Math.floor(Math.random() * n);
  let end = Math.floor(Math.random() * n);
  if (start > end) [start, end] = [end, start];

  const taken = new Set<number>();
  for (let i = start; i <= end; i++) {
    child[i] = a[i];
    taken.add(a[i]);
  }

  let fill = (end + 1) % n;
  for (let k = 0; k < n; k++) {
    const gene = b[(end + 1 + k) % n];
    if (!taken.has(gene)) {
      child[fill] = gene;
      taken.add(gene);
      fill = (fill + 1) % n;
    }
  }
  return child;
}

/** Swap mutation, with an occasional segment inversion (2-opt-like move). */
function mutate(order: number[], rate: number): number[] {
  const child = order.slice();
  const n = child.length;
  if (n < 2) return child;

  // Swap mutation.
  if (Math.random() < rate) {
    const i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    while (j === i) j = Math.floor(Math.random() * n);
    [child[i], child[j]] = [child[j], child[i]];
  }

  // Occasional segment inversion — great at untangling crossed routes.
  if (Math.random() < rate * 0.6) {
    let i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    if (i > j) [i, j] = [j, i];
    while (i < j) {
      [child[i], child[j]] = [child[j], child[i]];
      i++;
      j--;
    }
  }

  return child;
}

export interface TSPOptions {
  populationSize?: number;
  mutationRate?: number;
  eliteFrac?: number;
  tournament?: number;
}

export class TSPSolver {
  points: Point[];
  population: number[][];
  fitnesses: number[];
  /** Best tour order found so far. */
  best: number[];
  /** Length of the best tour found so far. */
  bestDistance: number;
  generation = 0;
  /** Best distance recorded at each generation (for the convergence chart). */
  history: number[] = [];
  /** Best distance of the very first generation — for improvement %. */
  readonly initialDistance: number;
  readonly opts: Required<TSPOptions>;

  constructor(points: Point[], opts: TSPOptions = {}) {
    this.points = points;
    const n = points.length;
    this.opts = {
      populationSize: opts.populationSize ?? 250,
      mutationRate: opts.mutationRate ?? 0.25,
      eliteFrac: opts.eliteFrac ?? 0.08,
      tournament: opts.tournament ?? 5,
    };

    this.population = Array.from({ length: this.opts.populationSize }, () => randomTour(n));
    this.fitnesses = this.population.map((t) => tourDistance(t, points));
    const bi = this.argmin();
    this.best = this.population[bi].slice();
    this.bestDistance = this.fitnesses[bi];
    this.initialDistance = this.bestDistance;
    this.history = [this.bestDistance];
  }

  private argmin(): number {
    let bi = 0;
    for (let i = 1; i < this.fitnesses.length; i++)
      if (this.fitnesses[i] < this.fitnesses[bi]) bi = i;
    return bi;
  }

  /** Tournament selection — pick the fittest of k random contenders. */
  private select(): number[] {
    let best = -1;
    for (let t = 0; t < this.opts.tournament; t++) {
      const i = Math.floor(Math.random() * this.population.length);
      if (best === -1 || this.fitnesses[i] < this.fitnesses[best]) best = i;
    }
    return this.population[best];
  }

  /** Advance one generation. Returns the current best distance. */
  step(): number {
    const { populationSize, eliteFrac, mutationRate } = this.opts;
    if (this.points.length < 2) {
      this.generation++;
      this.history.push(this.bestDistance);
      return this.bestDistance;
    }

    const eliteCount = Math.max(1, Math.floor(populationSize * eliteFrac));
    const order = [...this.population.keys()].sort((a, b) => this.fitnesses[a] - this.fitnesses[b]);
    const next: number[][] = order.slice(0, eliteCount).map((i) => this.population[i].slice());

    while (next.length < populationSize) {
      const child = orderedCrossover(this.select(), this.select());
      next.push(mutate(child, mutationRate));
    }

    this.population = next;
    this.fitnesses = this.population.map((t) => tourDistance(t, this.points));
    const bi = this.argmin();
    this.generation++;

    if (this.fitnesses[bi] < this.bestDistance) {
      this.bestDistance = this.fitnesses[bi];
      this.best = this.population[bi].slice();
    }

    this.history.push(this.bestDistance);
    return this.bestDistance;
  }
}

/** Generate `n` random points inside a [pad, w-pad] x [pad, h-pad] box. */
export function randomPoints(n: number, w: number, h: number, pad = 28): Point[] {
  return Array.from({ length: n }, () => ({
    x: pad + Math.random() * (w - pad * 2),
    y: pad + Math.random() * (h - pad * 2),
  }));
}
