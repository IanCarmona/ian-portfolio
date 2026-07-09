import type { SkillCategory } from "./types";

export const skillCategories: SkillCategory[] = [
  {
    title: { es: "Inteligencia Artificial", en: "Artificial Intelligence" },
    icon: "Brain",
    accent: "indigo",
    skills: [
      "LangGraph",
      "LangChain",
      "Claude",
      "OpenAI",
      "RAG",
      "Vector DBs",
      "Evals",
      "Prompt Caching",
      "PLN / NLP",
      "Machine Learning",
      "Deep Learning",
      "Visión por Computadora",
      "Algoritmos Bioinspirados",
    ],
  },
  {
    title: { es: "Data & Analytics", en: "Data & Analytics" },
    icon: "Database",
    accent: "cyan",
    skills: [
      "Databricks",
      "PySpark",
      "Pandas",
      "NumPy",
      "ETL / ELT",
      "Modelado Dimensional",
      "Arquitectura Medallion",
      "Power BI",
    ],
  },
  {
    title: { es: "Lenguajes & Frameworks", en: "Languages & Frameworks" },
    icon: "Code2",
    accent: "indigo",
    skills: ["Python", "JavaScript", "TypeScript", "SQL", "React", "Next.js", "Node.js", "C"],
  },
  {
    title: { es: "Cloud & Infraestructura", en: "Cloud & Infrastructure" },
    icon: "Cloud",
    accent: "cyan",
    skills: ["GCP (Cloud SQL, Functions)", "Azure", "AWS", "Git"],
  },
  {
    title: { es: "Herramientas", en: "Tools" },
    icon: "Wrench",
    accent: "indigo",
    skills: ["Supabase", "WhatsApp Business Platform", "Clerk", "WorkOS", "Figma"],
  },
];

/** Flat marquee list used for the scrolling tech strip. */
export const marqueeSkills: string[] = [
  "Python",
  "Next.js",
  "Databricks",
  "RAG",
  "Claude",
  "LangGraph",
  "PySpark",
  "React",
  "GCP",
  "SQL",
  "Node.js",
  "Power BI",
  "Vector DBs",
  "TypeScript",
  "ETL",
];
