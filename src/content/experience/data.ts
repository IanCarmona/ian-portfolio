import type { ExperienceItem } from "./types";

const present = { es: "Presente", en: "Present" };
const cdmx = { es: "Ciudad de México", en: "Mexico City" };

/** Reverse chronological, matching the CV. */
export const experience: ExperienceItem[] = [
  {
    company: "Amyra",
    url: "https://amyra.com.mx",
    role: { es: "AI Engineer", en: "AI Engineer" },
    start: "Nov 2025",
    end: present,
    location: cdmx,
    accent: "indigo",
    highlights: [
      {
        es: "Construí de cero un agente conversacional sobre LangGraph y Claude, integrado a WhatsApp Business Platform, que gestiona agendamiento, recordatorios, venta de membresías y consultas del negocio sin intervención humana. En producción con clientes de pago bajo suscripción.",
        en: "Built a conversational agent from scratch on LangGraph and Claude, integrated with the WhatsApp Business Platform, handling scheduling, reminders, membership sales and business queries without human intervention. Live in production with paying subscription customers.",
      },
      {
        es: "Reduje el costo por mensaje del agente en 70% (de $1 USD por cada 10 mensajes a $1 por cada 30) mediante migración de modelo, prompt caching, poda de contexto y rediseño de prompts. En turnos con caché activo baja a $1 por cada 60.",
        en: "Cut cost per message by 70% (from $1 USD per 10 messages to $1 per 30) through model migration, prompt caching, context pruning and prompt redesign. On cache-warm turns it drops to $1 per 60.",
      },
      {
        es: "Implementé un set de evals sobre conversaciones reales midiendo groundedness y consistencia entre corridas, atajando alucinaciones antes de que llegaran al usuario final.",
        en: "Implemented an eval suite over real conversations measuring groundedness and run-to-run consistency, catching hallucinations before they reached end users.",
      },
      {
        es: "Migré la base de datos a Cloud SQL en GCP y opero el stack completo: frontend, backend, APIs e infraestructura. Defino el roadmap técnico y las decisiones de producto.",
        en: "Migrated the database to Cloud SQL on GCP and own the full stack: frontend, backend, APIs and infrastructure. I define the technical roadmap and product decisions.",
      },
    ],
  },
  {
    company: "Profuturo",
    role: { es: "Data Engineer · Data Warehouse", en: "Data Engineer · Data Warehouse" },
    start: "Jul 2025",
    end: present,
    location: cdmx,
    accent: "cyan",
    highlights: [
      {
        es: "Diseño y estandarizo pipelines y modelos estrella bajo arquitectura Medallion en Databricks, integrando fuentes multi-cloud con foco en trazabilidad, gobernanza y calidad del dato.",
        en: "Design and standardize pipelines and star schemas under a Medallion architecture in Databricks, integrating multi-cloud sources with a focus on traceability, governance and data quality.",
      },
      {
        es: "Habilité dashboards ejecutivos en Power BI para una iniciativa FinOps, dando visibilidad del gasto tecnológico y consumo multi-cloud a nivel dirección.",
        en: "Enabled executive Power BI dashboards for a FinOps initiative, giving leadership visibility into tech spend and multi-cloud consumption.",
      },
      {
        es: "Automaticé la generación y validación de archivos regulatorios COSAR con Python y PySpark, eliminando +4 h diarias de trabajo manual y mitigando riesgo regulatorio.",
        en: "Automated the generation and validation of COSAR regulatory files with Python and PySpark, removing 4+ daily manual hours and mitigating regulatory risk.",
      },
    ],
  },
  {
    company: "Romboworks",
    role: { es: "AI Engineer", en: "AI Engineer" },
    start: "Ene 2024",
    end: { es: "Oct 2024", en: "Oct 2024" },
    location: cdmx,
    accent: "indigo",
    highlights: [
      {
        es: "Desarrollé un sistema conversacional para el sector financiero integrando LLMs y técnicas de procesamiento de lenguaje natural (PLN).",
        en: "Developed a conversational system for the financial sector integrating LLMs and natural language processing (NLP) techniques.",
      },
      {
        es: "Implementé arquitecturas RAG con bases de datos vectoriales, incrementando 30% la precisión contextual de las respuestas.",
        en: "Implemented RAG architectures with vector databases, increasing the system's contextual answer precision by 30%.",
      },
      {
        es: "Desarrollé el frontend y la lógica de negocio con React y Node.js, iterando con el equipo de IA en la mejora continua.",
        en: "Built the frontend and business logic with React and Node.js, iterating with the AI team on continuous improvement.",
      },
    ],
  },
];
