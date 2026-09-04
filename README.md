# Tools

Persönliche Sammlung kleiner Utility-Tools als Web-App. Alles läuft
clientseitig im Browser — keine Uploads, keine Konten, keine Datenbank.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 ·
shadcn/ui · lucide-react · cmdk · next-themes. Deployment-Ziel ist Vercel.

Das Design übernimmt die Terminal-Ästhetik des Portfolios
(netzer.cloud): nahezu neutrale Dunkelflächen, Phosphor-Grün als
einziger Akzent, Glaskarten, Monospace für alle Ein- und Ausgabefelder.
Dark Mode ist Standard.

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Produktions-Build
npm run lint
```

## Ein neues Tool hinzufügen

Zwei Schritte — mehr nicht.

### 1. Eintrag in die Registry

`lib/tools.ts` ist die einzige Quelle der Wahrheit. Aus ihr speisen sich
automatisch die Startseite (Karten-Grid nach Kategorie), die
Sidebar-Navigation und die Command-Palette.

```ts
import { Ruler } from "lucide-react";

export const tools: Tool[] = [
  // …
  {
    slug: "einheiten",              // = Ordnername der Seite
    name: "Einheiten-Umrechner",
    description: "Längen, Massen und Temperaturen umrechnen.",
    category: "Daten",              // Text | Daten | Bilder | Entwickler | Zeit
    icon: Ruler,                    // lucide-react
    keywords: ["einheiten", "umrechnen", "convert", "meter", "celsius"],
  },
];
```

`keywords` gehen in die unscharfe Suche der Command-Palette ein — dort
ruhig auch englische Begriffe und Abkürzungen eintragen.

### 2. Seite anlegen

`app/tools/<slug>/page.tsx`, wobei `<slug>` exakt dem Registry-Eintrag
entspricht. Das Grundgerüst ist immer dasselbe:

```tsx
"use client";

import * as React from "react";

import { TextIO } from "@/components/tools/text-io";
import { ToolShell } from "@/components/tools/tool-shell";
import { requireTool } from "@/lib/tools";

const tool = requireTool("einheiten"); // wirft beim Build, wenn der Slug fehlt

export default function EinheitenPage() {
  const [input, setInput] = React.useState("");
  const output = React.useMemo(() => input.toUpperCase(), [input]);

  return (
    <ToolShell tool={tool}>
      <TextIO value={input} onValueChange={setInput} output={output} />
    </ToolShell>
  );
}
```

Fertig. Startseite, Sidebar und Palette kennen das Tool ab sofort;
Titel, Beschreibung und Kategorie kommen aus der Registry, sodass
Übersicht und Detailseite nicht auseinanderlaufen können.

> Der Ordnername ist der Slug — es gibt bewusst **keine** dynamische
> `[slug]`-Route. So bleibt jedes Tool eine eigenständige, statisch
> vorgerenderte Seite und kann eigene Zustände und Abhängigkeiten
> mitbringen, ohne die anderen zu belasten.

## Bausteine

Fast jedes Tool ist „Eingabe → Verarbeitung → Ausgabe". Dafür gibt es
fertige Komponenten in `components/tools/`:

| Komponente      | Zweck |
| --------------- | ----- |
| `<ToolShell>`   | Rahmen jeder Seite: Kategorie-Label, Titel, Beschreibung, Content-Slot. Setzt nebenbei den Seitentitel. Optionale `actions` für Modus-Umschalter. |
| `<TextIO>`      | Zwei Textareas (neben- oder untereinander) mit Kopieren, Leeren, optionalem Tauschen und Zeichen-/Zeilenzähler. Zeigt Fehler inline an. |
| `<FileDrop>`    | Drag & Drop plus Datei-Dialog, konfigurierbare `accept`-Typen, Größenlimit, Vorschau von Dateiname und -größe. |
| `<CopyButton>`  | Kopiert einen Wert und zeigt kurz „Kopiert". |
| `<ErrorAlert>`  | Inline-Alert für Fehler — bewusst kein Toast. |

Fehler gehören unter die Eingabe, nicht in eine Ecke des Bildschirms:
Sie bleiben stehen, bis das Tool wieder ein gültiges Ergebnis liefert.

### Beispiel-Tools

Die drei mitgelieferten Tools zeigen das Muster jeweils etwas anders:

- **JSON-Formatter** (`Daten`) — `TextIO` mit Modus-Umschalter
  (Formatieren / Minifizieren / Validieren) und Fehlerzeile.
- **Base64** (`Entwickler`) — `TextIO` mit Swap-Button plus zweiter
  Reiter mit `FileDrop` für Dateien und Data-URLs.
- **Hash-Generator** (`Entwickler`) — `FileDrop` und `CopyButton` ohne
  `TextIO`, weil die Ausgabe aus drei Prüfsummen besteht (Web Crypto).

## Bedienung

- **⌘K / Strg+K** öffnet die Command-Palette. Die Suche geht unscharf
  über Namen, Kategorie und Keywords; **Enter** öffnet das Tool.
- Die Sidebar ist ab `lg` fest, darunter klappt sie als Sheet auf.
- Der Theme-Toggle im Header schaltet zwischen Dark (Standard) und Light.

## Später: Tools mit Python-Backend

Für schwere Tools (MarkItDown, PDF-Manipulation, ffmpeg) ist bereits
vorbereitet — implementiert ist das Backend **noch nicht**:

- `lib/api.ts` — Fetch-Wrapper gegen `process.env.NEXT_PUBLIC_API_URL`
  mit `apiFetch`, `apiUpload` (multipart) und `apiDownload` (Blob).
  Fehler kommen als `ApiError` mit lesbarer deutscher Meldung zurück
  und lassen sich direkt an `<ErrorAlert>` durchreichen.
- `requiresBackend: true` in der Registry markiert solche Tools. Sie
  bekommen in der Übersicht ein Badge „Backend" und in der Sidebar
  „API".

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Ist die Variable nicht gesetzt, schlagen Backend-Aufrufe mit einer
klaren Meldung fehl, statt gegen die eigene Origin zu laufen.

## Struktur

```
app/
  layout.tsx              Sidebar + Header + Theme + Command-Palette
  page.tsx                Startseite: Karten-Grid nach Kategorie
  tools/<slug>/page.tsx   je ein Tool
components/
  layout/                 Sidebar, Header, Command-Palette, Theme-Toggle
  tools/                  ToolShell, TextIO, FileDrop, CopyButton, ErrorAlert
  ui/                     shadcn/ui-Primitive
lib/
  tools.ts                die Registry
  api.ts                  Fetch-Wrapper fürs spätere Backend
  utils.ts                cn(), formatBytes()
```
