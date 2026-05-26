import type { Profile } from "./types";

export const profile: Profile = {
  roles: [
    { label: { es: "agentes de IA", en: "AI agents" } },
    { label: { es: "pipelines de datos", en: "data pipelines" } },
    { label: { es: "apps full-stack", en: "full-stack apps" } },
    { label: { es: "productos con IA", en: "AI products" } },
  ],
  bio: [
    {
      es: "Soy Ingeniero en Inteligencia Artificial (IPN — ESCOM) con experiencia en Data Engineering y en el desarrollo de agentes conversacionales en producción.",
      en: "I'm an Artificial Intelligence Engineer (IPN — ESCOM) with experience in Data Engineering and building conversational agents in production.",
    },
    {
      es: "He construido pipelines bajo arquitectura Medallion, modelos dimensionales y automatizaciones en entornos multi-cloud, además de plataformas full-stack completas desde el diseño hasta el despliegue.",
      en: "I've built Medallion-architecture pipelines, dimensional models and automations across multi-cloud environments, plus full-stack platforms end-to-end from design to deployment.",
    },
    {
      es: "Combino formación técnica sólida en ingeniería de datos con experiencia práctica aplicando IA a problemas de negocio reales.",
      en: "I combine solid technical training in data engineering with hands-on experience applying AI to real business problems.",
    },
  ],
  stats: [
    { value: 93, suffix: "%", labelKey: "costReduction" },
    { value: 30, prefix: "+", suffix: "%", labelKey: "ragPrecision" },
    { value: 4, prefix: "+", suffix: "h", labelKey: "hoursSaved" },
    { value: 24, suffix: "/7", labelKey: "uptime" },
  ],
  education: [
    {
      degree: {
        es: "Ingeniería en Inteligencia Artificial",
        en: "B.Eng. in Artificial Intelligence",
      },
      school: "Instituto Politécnico Nacional — ESCOM",
      detail: { es: "Egresado · Titulación en proceso", en: "Graduate · Degree in progress" },
    },
    {
      degree: {
        es: "Técnico en Sistemas de Control Eléctrico",
        en: "Technician in Electrical Control Systems",
      },
      school: "Instituto Politécnico Nacional — CECyT 3",
      detail: { es: "Graduado · 2021", en: "Graduated · 2021" },
    },
  ],
  terminalLines: [
    "$ whoami",
    "ian_carmona — AI & Data Engineer",
    "$ cat stack.txt",
    "python · sql · react · next.js · node",
    "databricks · pyspark · gcp · rag · gpt",
    "$ ./run --status",
    "✓ shipping AI to production",
  ],
};
