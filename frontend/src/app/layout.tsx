import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import { CustomCursor } from "@/components/effects/CustomCursor";
import { LoadingScreen } from "@/components/effects/LoadingScreen";
import { person } from "@/lib/content";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${person.name} — AI Engineer`,
    template: `%s — ${person.shortName}`,
  },
  description: person.intro,
  keywords: [
    "AI Engineer", "LLM Engineer", "Machine Learning Engineer", "RAG", "AutoGen",
    "LangChain", "MCP", "FastAPI", "Afnan Hany", "AI Developer Egypt",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${person.name} — AI Engineer`,
    description: person.intro,
    siteName: person.shortName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${person.name} — AI Engineer`,
    description: person.intro,
  },
  robots: { index: true, follow: true },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  jobTitle: "AI Engineer",
  email: `mailto:${person.email}`,
  url: SITE_URL,
  sameAs: [person.linkedin],
  knowsAbout: ["LLM Applications", "RAG", "Multi-agent systems", "Machine Learning", "FastAPI"],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Helwan National University" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable}`}>
      <body className="noise">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <LoadingScreen />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
