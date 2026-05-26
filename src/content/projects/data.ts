import type { Project } from "./types";

export const projects: Project[] = [
  {
    title: { es: "Agente conversacional WhatsApp", en: "WhatsApp conversational agent" },
    company: "Amyra",
    accent: "indigo",
    summary: {
      es: "Agente autónomo para studios de fitness que agenda citas, envía recordatorios, vende membresías y responde consultas del negocio por WhatsApp. Optimicé prompts, contexto y tokens para hacerlo rentable a escala.",
      en: "Autonomous agent for fitness studios that books appointments, sends reminders, sells memberships and answers business queries over WhatsApp. I optimized prompts, context and tokens to make it profitable at scale.",
    },
    stack: ["GPT", "Python", "RAG", "WhatsApp API", "GCP", "Cloud SQL"],
    metric: {
      value: 93,
      suffix: "%",
      label: { es: "reducción de costo operativo", en: "operating cost reduction" },
    },
    sparkline: [92, 80, 70, 58, 44, 33, 22, 12, 7],
  },
  {
    title: { es: "Automatización regulatoria COSAR", en: "COSAR regulatory automation" },
    company: "Profuturo",
    accent: "cyan",
    summary: {
      es: "Solución que automatiza la generación y validación de archivos regulatorios COSAR, eliminando el procesamiento manual diario y reduciendo el riesgo de errores con implicaciones regulatorias.",
      en: "Solution that automates the generation and validation of COSAR regulatory files, removing daily manual processing and reducing the risk of errors with regulatory implications.",
    },
    stack: ["Python", "Databricks", "PySpark", "ETL", "SQL"],
    metric: {
      value: 4,
      prefix: "+",
      suffix: "h",
      label: { es: "diarias eliminadas de trabajo manual", en: "daily manual hours removed" },
    },
    sparkline: [10, 22, 30, 45, 55, 68, 78, 88, 100],
    accent: "cyan",
  },
  {
    title: { es: "RAG financiero conversacional", en: "Financial conversational RAG" },
    company: "Romboworks",
    accent: "indigo",
    summary: {
      es: "Sistema conversacional para el sector financiero con GPT y PLN. Implementé RAG con base de datos vectorial para mejorar la recuperación de contexto y la precisión de las respuestas del modelo.",
      en: "Conversational system for the financial sector with GPT and NLP. I implemented RAG with a vector database to improve context retrieval and the model's answer precision.",
    },
    stack: ["GPT", "RAG", "Vector DB", "NLP", "React", "Node.js"],
    metric: {
      value: 30,
      prefix: "+",
      suffix: "%",
      label: { es: "precisión en las respuestas", en: "answer precision" },
    },
    sparkline: [40, 45, 52, 58, 63, 68, 72, 76, 70],
    accent: "indigo",
  },
  {
    title: { es: "Pipelines FinOps (Medallion)", en: "FinOps pipelines (Medallion)" },
    company: "Profuturo",
    accent: "cyan",
    summary: {
      es: "Pipelines de datos bajo arquitectura Medallion en Databricks con integración multi-cloud, alimentando dashboards ejecutivos en Power BI para dar visibilidad del gasto tecnológico a nivel dirección.",
      en: "Medallion-architecture data pipelines in Databricks with multi-cloud integration, feeding executive Power BI dashboards to give leadership visibility into tech spend.",
    },
    stack: ["Databricks", "PySpark", "Power BI", "Multi-cloud", "Dimensional modeling"],
    metric: {
      value: 3,
      suffix: "",
      label: { es: "capas Medallion (bronze/silver/gold)", en: "Medallion layers (bronze/silver/gold)" },
    },
    sparkline: [20, 35, 30, 50, 60, 55, 75, 85, 95],
    accent: "cyan",
  },
];
