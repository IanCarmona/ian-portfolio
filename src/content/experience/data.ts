import type { ExperienceItem } from "./types";

const present = { es: "Presente", en: "Present" };
const cdmx = { es: "Ciudad de México", en: "Mexico City" };

export const experience: ExperienceItem[] = [
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
    company: "Amyra",
    url: "https://amyra.com.mx",
    role: { es: "Tech Lead", en: "Tech Lead" },
    start: "Nov 2025",
    end: present,
    location: cdmx,
    accent: "indigo",
    highlights: [
      {
        es: "Lidero el desarrollo técnico de una plataforma SaaS conversacional para estudios de fitness y negocios de membresías; defino el roadmap y las decisiones de producto.",
        en: "Lead the technical development of a conversational SaaS platform for fitness studios and membership businesses; I own the roadmap and product decisions.",
      },
      {
        es: "Construí un agente autónomo por WhatsApp (GPT) que agenda citas, envía recordatorios, vende membresías y resuelve consultas del negocio sin intervención humana.",
        en: "Built an autonomous WhatsApp agent (GPT) that books appointments, sends reminders, sells memberships and resolves business queries with no human intervention.",
      },
      {
        es: "Reduje el costo de inferencia de IA en 93% (de $1 por 10 a $1 por 150 mensajes) optimizando contexto, prompts y gestión de tokens.",
        en: "Cut AI inference cost by 93% (from $1 per 10 to $1 per 150 messages) by optimizing context, prompts and token usage.",
      },
      {
        es: "Migré la infraestructura a Google Cloud (Cloud SQL) y mantengo el stack completo: frontend, backend, APIs e integraciones.",
        en: "Migrated the infrastructure to Google Cloud (Cloud SQL) and maintain the full stack: frontend, backend, APIs and integrations.",
      },
    ],
  },
  {
    company: "MOSSAIC",
    role: { es: "Full-Stack Engineer", en: "Full-Stack Engineer" },
    start: "Nov 2025",
    end: present,
    location: cdmx,
    accent: "cyan",
    highlights: [
      {
        es: "Construyo y despliego aplicaciones web, APIs y plataformas cloud para clientes de distintas industrias, de la definición técnica a producción.",
        en: "Build and deploy web apps, APIs and cloud platforms for clients across industries, from technical definition to production.",
      },
      {
        es: "Defino arquitecturas y selecciono el stack según los objetivos de cada proyecto, priorizando escalabilidad y mantenibilidad.",
        en: "Define architectures and choose the stack based on each project's goals, prioritizing scalability and maintainability.",
      },
      {
        es: "Aporto en la incubadora interna de productos, del concepto al desarrollo de nuevas soluciones digitales.",
        en: "Contribute to the internal product incubator, from concept to building new digital solutions.",
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
        es: "Construí sistemas conversacionales para el sector financiero con modelos GPT y técnicas de procesamiento de lenguaje natural (PLN).",
        en: "Built conversational systems for the financial sector using GPT models and natural language processing (NLP).",
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
