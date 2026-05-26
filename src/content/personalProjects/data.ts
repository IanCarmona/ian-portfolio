import type { PersonalProject } from "./types";

export const personalProjects: PersonalProject[] = [
  {
    title: "Optimizador de CV (ATS)",
    emoji: "🎯",
    accent: "indigo",
    description: {
      es: "Compara tu CV con una oferta de trabajo y descubre qué palabras clave te faltan para pasar los filtros ATS, con score de match y sugerencias accionables.",
      en: "Compare your resume against a job posting and find the missing keywords you need to pass ATS filters, with a match score and actionable suggestions.",
    },
    stack: ["TypeScript", "NLP", "ATS"],
    demoUrl: "/lab/cv",
  },
  {
    title: "Image Studio",
    emoji: "🖼️",
    accent: "cyan",
    description: {
      es: "Kit real de imagen en el navegador: comprime y convierte fotos (PNG/JPG/WebP), digitaliza documentos, recorta para redes y aplica filtros de visión por computadora.",
      en: "A real in-browser image toolkit: compress and convert photos (PNG/JPG/WebP), scan documents, resize for social and apply computer-vision filters.",
    },
    stack: ["Canvas API", "TypeScript", "Procesamiento de imágenes"],
    demoUrl: "/lab/imagen",
  },
  {
    title: "Dashboard de sismos en vivo",
    emoji: "📊",
    accent: "cyan",
    description: {
      es: "Tablero de BI que consume en vivo la API pública del USGS y la convierte en métricas, mapa geográfico y gráficas, con exportación a CSV. Sin backend.",
      en: "BI dashboard that consumes the public USGS API live and turns it into metrics, a geographic map and charts, with CSV export. No backend.",
    },
    stack: ["TypeScript", "Data / BI", "API pública"],
    demoUrl: "/lab/datos",
  },
  {
    title: "Optimizador de rutas (TSP)",
    emoji: "🚚",
    accent: "indigo",
    description: {
      es: "Encuentra la ruta de reparto más corta entre varias paradas con un algoritmo genético (Problema del Agente Viajero), animado en vivo.",
      en: "Finds the shortest delivery route across multiple stops with a genetic algorithm (Traveling Salesman Problem), animated live.",
    },
    stack: ["TypeScript", "Algoritmos Genéticos", "Optimización"],
    demoUrl: "/lab/rutas",
  },
  {
    title: "Sudoku resuelto con IA",
    emoji: "🧩",
    accent: "indigo",
    description: {
      es: "Un algoritmo genético que resuelve Sudoku evolucionando una población de soluciones, con gráfica de convergencia y heurísticas. Incluye solución instantánea.",
      en: "A genetic algorithm that solves Sudoku by evolving a population of solutions, with a convergence chart and heuristics. Includes instant solve.",
    },
    stack: ["TypeScript", "Algoritmos Genéticos", "IA"],
    demoUrl: "/lab/sudoku",
  },
];
