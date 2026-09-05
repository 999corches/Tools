import {
  Braces,
  Binary,
  Fingerprint,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

/**
 * Zentrale Tool-Registry.
 *
 * Aus diesem Array werden Startseite, Sidebar und Command-Palette
 * gespeist. Ein neues Tool anzulegen heißt: hier einen Eintrag
 * ergänzen und `app/tools/<slug>/page.tsx` erstellen. Sonst nichts.
 */

export const CATEGORIES = [
  "Links",
  "Text",
  "Daten",
  "Bilder",
  "Entwickler",
  "Zeit",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Tool = {
  /** URL-Segment unter /tools/ — muss dem Ordnernamen der Seite entsprechen. */
  slug: string;
  name: string;
  /** Ein Satz, der in Karte, Sidebar-Tooltip und Tool-Kopf auftaucht. */
  description: string;
  category: Category;
  icon: LucideIcon;
  /** Zusätzliche Suchbegriffe für die Command-Palette (auch englisch). */
  keywords: string[];
  /**
   * Markiert Tools, die das (noch nicht existierende) Python-Backend
   * brauchen. Solche Tools bekommen in der Übersicht ein Badge.
   */
  requiresBackend?: boolean;
};

export const tools: Tool[] = [
  {
    slug: "dashboard",
    name: "Dashboard",
    description:
      "Direkt zu den Diensten, die ich täglich brauche — Supabase, Resend, IONOS, Cloudflare, GitHub, Vercel.",
    category: "Links",
    icon: LayoutGrid,
    keywords: [
      "dashboard",
      "links",
      "lesezeichen",
      "bookmarks",
      "supabase",
      "resend",
      "ionos",
      "cloudflare",
      "github",
      "vercel",
      "hosting",
      "dns",
      "mail",
      "deploy",
    ],
  },
  {
    slug: "json-formatter",
    name: "JSON-Formatter",
    description:
      "JSON einrücken, minifizieren oder validieren — mit Angabe der Fehlerzeile.",
    category: "Daten",
    icon: Braces,
    keywords: [
      "json",
      "format",
      "formatieren",
      "pretty",
      "print",
      "minify",
      "minifizieren",
      "validieren",
      "validate",
      "einrücken",
      "parser",
    ],
  },
  {
    slug: "base64",
    name: "Base64",
    description:
      "Text und Dateien nach Base64 kodieren oder daraus zurück dekodieren.",
    category: "Entwickler",
    icon: Binary,
    keywords: [
      "base64",
      "b64",
      "encode",
      "kodieren",
      "decode",
      "dekodieren",
      "datei",
      "file",
      "data-url",
      "btoa",
      "atob",
    ],
  },
  {
    slug: "hash",
    name: "Hash-Generator",
    description:
      "SHA-1, SHA-256 und SHA-512 über Text oder Datei — via Web Crypto API.",
    category: "Entwickler",
    icon: Fingerprint,
    keywords: [
      "hash",
      "prüfsumme",
      "checksum",
      "sha",
      "sha1",
      "sha256",
      "sha512",
      "digest",
      "fingerprint",
      "crypto",
    ],
  },
];

/** Reihenfolge der Kategorien für Übersicht und Sidebar. */
export const toolsByCategory: { category: Category; tools: Tool[] }[] =
  CATEGORIES.map((category) => ({
    category,
    tools: tools.filter((tool) => tool.category === category),
  })).filter((group) => group.tools.length > 0);

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/**
 * Liefert das Tool zum Slug oder wirft — für Tool-Seiten gedacht,
 * damit ein Tippfehler im Slug beim Build auffällt statt still zu
 * einer Seite ohne Titel zu führen.
 */
export function requireTool(slug: string): Tool {
  const tool = getTool(slug);
  if (!tool) {
    throw new Error(
      `Kein Registry-Eintrag für den Slug "${slug}". Bitte in lib/tools.ts ergänzen.`,
    );
  }
  return tool;
}
