import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono, Fraunces } from "next/font/google";

import { LanguageProvider } from "@/providers/LanguageProvider";
import { SITE } from "@/constants/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

// Serif display for headings — gives the site its own editorial character.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const description =
  "Ingeniero en Inteligencia Artificial · Data Engineer · Full-Stack. Construyo agentes de IA, pipelines de datos y plataformas full-stack en producción.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.shortName} — AI & Data Engineer`,
  description,
  keywords: [
    "Ian Carmona",
    "AI Engineer",
    "Data Engineer",
    "Full-Stack",
    "RAG",
    "Databricks",
    "Next.js",
    "Machine Learning",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    title: `${SITE.shortName} — AI & Data Engineer`,
    description,
    url: SITE.url,
    siteName: SITE.shortName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.shortName} — AI & Data Engineer`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0D12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jetbrains.variable} ${fraunces.variable} antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
