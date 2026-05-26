import type { Hobby } from "./types";

export const hobbies: Hobby[] = [
  {
    label: { es: "Natación", en: "Swimming" },
    description: {
      es: "Mi forma favorita de despejar la mente — en el agua me siento libre y relajado.",
      en: "My favorite way to clear my head — in the water I feel free and relaxed.",
    },
    icon: "Waves",
    accent: "cyan",
  },
  {
    label: { es: "Música", en: "Music" },
    description: {
      es: "Aprendo todos los instrumentos que puedo: ya toco piano, batería y guitarra; vienen saxofón, violín y bajo.",
      en: "Learning every instrument I can: I play piano, drums and guitar; saxophone, violin and bass are next.",
    },
    icon: "Music",
    accent: "indigo",
  },
  {
    label: { es: "Lectura", en: "Reading" },
    description: {
      es: "Novelas de misterio, de Agatha Christie a la saga de Harry Potter.",
      en: "Mystery novels, from Agatha Christie to the Harry Potter saga.",
    },
    icon: "BookOpen",
    accent: "cyan",
  },
];
