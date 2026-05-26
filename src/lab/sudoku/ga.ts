/**
 * Genetic-algorithm Sudoku solver — ported & improved from Ian's
 * Algoritmo-Genético-Sudoku coursework. Runs 100% client-side.
 *
 * Encoding (Mantere–Koljonen): each 3x3 BLOCK is a permutation of 1..9 with the
 * puzzle's givens fixed, so every block is always valid. Fitness counts duplicate
 * conflicts across ROWS and COLUMNS (0 = solved). Tournament selection, block-wise
 * crossover, in-block swap mutation, elitism and restart-on-stagnation.
 */

export type Grid = number[]; // length 81, 0 = empty
export type Difficulty = "facil" | "medio" | "dificil";

export const PUZZLES: Record<Difficulty, string> = {
  facil:
    "530070000" +
    "600195000" +
    "098000060" +
    "800060003" +
    "400803001" +
    "700020006" +
    "060000280" +
    "000419005" +
    "000080079",
  medio:
    "300000000" +
    "970010000" +
    "600583000" +
    "200000900" +
    "500621003" +
    "008000005" +
    "000435002" +
    "000090056" +
    "000000001",
  // 21 givens — very few clues, GA struggles & the backtracking safety net
  // takes over more often, making the algorithm work visibly harder.
  dificil:
    "800000000" +
    "003600000" +
    "070090200" +
    "050007000" +
    "000045700" +
    "000100030" +
    "001000068" +
    "008500010" +
    "090000400",
};

export function parse(puzzle: string): Grid {
  return puzzle.split("").map((c) => parseInt(c, 10) || 0);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Indices of the 9 cells in block b (0..8). */
function blockCells(b: number): number[] {
  const br = Math.floor(b / 3) * 3;
  const bc = (b % 3) * 3;
  const cells: number[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push((br + r) * 9 + (bc + c));
  return cells;
}

const BLOCKS = Array.from({ length: 9 }, (_, b) => blockCells(b));

/** Fill every block with a valid permutation, keeping givens in place. */
function createIndividual(puzzle: Grid): Grid {
  const ind = puzzle.slice();
  for (const cells of BLOCKS) {
    const present = new Set<number>();
    for (const idx of cells) if (puzzle[idx]) present.add(puzzle[idx]);
    const missing = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !present.has(n)));
    let m = 0;
    for (const idx of cells) if (!puzzle[idx]) ind[idx] = missing[m++];
  }
  return ind;
}

/** Count duplicate conflicts across rows and columns (blocks are valid). */
export function fitness(ind: Grid): number {
  let conflicts = 0;
  for (let r = 0; r < 9; r++) {
    const seen = new Set<number>();
    for (let c = 0; c < 9; c++) {
      const v = ind[r * 9 + c];
      if (seen.has(v)) conflicts++;
      else seen.add(v);
    }
  }
  for (let c = 0; c < 9; c++) {
    const seen = new Set<number>();
    for (let r = 0; r < 9; r++) {
      const v = ind[r * 9 + c];
      if (seen.has(v)) conflicts++;
      else seen.add(v);
    }
  }
  return conflicts;
}

/** Cells (non-givens) that duplicate a value in their row or column. */
export function conflictCells(ind: Grid, puzzle: Grid): boolean[] {
  const bad = new Array(81).fill(false);
  const mark = (idxs: number[]) => {
    const map = new Map<number, number[]>();
    for (const idx of idxs) {
      const arr = map.get(ind[idx]) ?? [];
      arr.push(idx);
      map.set(ind[idx], arr);
    }
    for (const arr of map.values()) if (arr.length > 1) arr.forEach((i) => (bad[i] = true));
  };
  for (let r = 0; r < 9; r++) mark(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  for (let c = 0; c < 9; c++) mark(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  for (let i = 0; i < 81; i++) if (puzzle[i]) bad[i] = false;
  return bad;
}

function mutate(ind: Grid, puzzle: Grid, rate: number): Grid {
  const child = ind.slice();
  for (let b = 0; b < 9; b++) {
    if (Math.random() < rate) {
      const free = BLOCKS[b].filter((idx) => !puzzle[idx]);
      if (free.length >= 2) {
        const i = free[Math.floor(Math.random() * free.length)];
        let j = free[Math.floor(Math.random() * free.length)];
        while (j === i) j = free[Math.floor(Math.random() * free.length)];
        [child[i], child[j]] = [child[j], child[i]];
      }
    }
  }
  return child;
}

function crossover(a: Grid, b: Grid): Grid {
  const child = a.slice();
  for (let bl = 0; bl < 9; bl++) {
    if (Math.random() < 0.5) for (const idx of BLOCKS[bl]) child[idx] = b[idx];
  }
  return child;
}

interface Options {
  populationSize?: number;
  mutationRate?: number;
  eliteFrac?: number;
  tournament?: number;
}

export class GASolver {
  puzzle: Grid;
  population: Grid[];
  fitnesses: number[];
  best: Grid;
  bestFitness: number;
  generation = 0;
  /** Best fitness recorded at each generation (for the convergence chart). */
  history: number[] = [];
  private stagnation = 0;
  readonly opts: Required<Options>;

  constructor(puzzle: Grid, opts: Options = {}) {
    this.puzzle = puzzle;
    this.opts = {
      populationSize: opts.populationSize ?? 200,
      mutationRate: opts.mutationRate ?? 0.3,
      eliteFrac: opts.eliteFrac ?? 0.05,
      tournament: opts.tournament ?? 4,
    };
    this.population = Array.from({ length: this.opts.populationSize }, () =>
      createIndividual(puzzle),
    );
    this.fitnesses = this.population.map(fitness);
    const bi = this.argmin();
    this.best = this.population[bi].slice();
    this.bestFitness = this.fitnesses[bi];
    this.history = [this.bestFitness];
  }

  private argmin(): number {
    let bi = 0;
    for (let i = 1; i < this.fitnesses.length; i++)
      if (this.fitnesses[i] < this.fitnesses[bi]) bi = i;
    return bi;
  }

  private select(): Grid {
    let best = -1;
    for (let t = 0; t < this.opts.tournament; t++) {
      const i = Math.floor(Math.random() * this.population.length);
      if (best === -1 || this.fitnesses[i] < this.fitnesses[best]) best = i;
    }
    return this.population[best];
  }

  /** Advance one generation. Returns true if solved. */
  step(): boolean {
    if (this.bestFitness === 0) return true;

    const { populationSize, eliteFrac, mutationRate } = this.opts;
    const eliteCount = Math.max(2, Math.floor(populationSize * eliteFrac));
    const order = [...this.population.keys()].sort((a, b) => this.fitnesses[a] - this.fitnesses[b]);
    const mutRate = this.stagnation > 20 ? Math.min(0.8, mutationRate + 0.3) : mutationRate;
    const next: Grid[] = order.slice(0, eliteCount).map((i) => this.population[i].slice());

    while (next.length < populationSize) {
      next.push(mutate(crossover(this.select(), this.select()), this.puzzle, mutRate));
    }

    this.population = next;
    this.fitnesses = this.population.map(fitness);
    const bi = this.argmin();
    this.generation++;

    if (this.fitnesses[bi] < this.bestFitness) {
      this.bestFitness = this.fitnesses[bi];
      this.best = this.population[bi].slice();
      this.stagnation = 0;
    } else {
      this.stagnation++;
    }

    // Restart: keep a couple of elites, reseed the rest to escape local optima.
    if (this.stagnation > 40) {
      for (let i = eliteCount; i < this.population.length; i++)
        this.population[i] = createIndividual(this.puzzle);
      this.fitnesses = this.population.map(fitness);
      this.stagnation = 0;
    }

    this.history.push(this.bestFitness);
    return this.bestFitness === 0;
  }
}

/** Deterministic backtracking solver (instant, guaranteed). */
export function solveBacktrack(puzzle: Grid): Grid | null {
  const grid = puzzle.slice();
  const valid = (idx: number, v: number) => {
    const r = Math.floor(idx / 9),
      c = idx % 9;
    for (let i = 0; i < 9; i++) {
      if (grid[r * 9 + i] === v) return false;
      if (grid[i * 9 + c] === v) return false;
    }
    const br = Math.floor(r / 3) * 3,
      bc = Math.floor(c / 3) * 3;
    for (let dr = 0; dr < 3; dr++)
      for (let dc = 0; dc < 3; dc++) if (grid[(br + dr) * 9 + (bc + dc)] === v) return false;
    return true;
  };
  const solve = (pos: number): boolean => {
    if (pos === 81) return true;
    if (grid[pos]) return solve(pos + 1);
    for (let v = 1; v <= 9; v++) {
      if (valid(pos, v)) {
        grid[pos] = v;
        if (solve(pos + 1)) return true;
        grid[pos] = 0;
      }
    }
    return false;
  };
  return solve(0) ? grid : null;
}
