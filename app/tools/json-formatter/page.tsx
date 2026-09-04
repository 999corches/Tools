"use client";

import * as React from "react";
import { CheckCircle2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextIO } from "@/components/tools/text-io";
import { ToolShell } from "@/components/tools/tool-shell";
import { requireTool } from "@/lib/tools";

const tool = requireTool("json-formatter");

type Mode = "format" | "minify" | "validate";

const MODES: { id: Mode; label: string }[] = [
  { id: "format", label: "Formatieren" },
  { id: "minify", label: "Minifizieren" },
  { id: "validate", label: "Validieren" },
];

/** Rechnet einen Zeichen-Offset in "Zeile N, Spalte M" um. */
function positionToLineColumn(source: string, position: number) {
  const upto = source.slice(0, Math.max(0, Math.min(position, source.length)));
  const lines = upto.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/**
 * Übersetzt die je nach Engine unterschiedlich formulierte
 * JSON-Parse-Meldung in einen Satz mit Zeilenangabe. Die eigentliche
 * Ursache stammt aus der JS-Engine und bleibt englisch — der Ort des
 * Fehlers ist die Information, auf die es ankommt.
 */
function describeError(error: unknown, source: string): string {
  const message = error instanceof Error ? error.message : String(error);

  // Die Positionsangabe der Engine abtrennen, damit sie nicht doppelt
  // neben der selbst berechneten Zeile steht.
  const reason = message
    .replace(/^JSON\.parse:\s*/i, "")
    .replace(/\s*in JSON at position \d+.*$/i, "")
    .replace(/\s*at line \d+ column \d+.*$/i, "")
    .trim();

  const byPosition = message.match(/position (\d+)/i);
  if (byPosition) {
    const { line, column } = positionToLineColumn(source, Number(byPosition[1]));
    return `Zeile ${line}, Spalte ${column} — ${reason}`;
  }

  const byLine = message.match(/line (\d+) column (\d+)/i);
  if (byLine) {
    return `Zeile ${byLine[1]}, Spalte ${byLine[2]} — ${reason}`;
  }

  return reason || "Die Eingabe ist kein gültiges JSON.";
}

export default function JsonFormatterPage() {
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<Mode>("format");
  const [indent, setIndent] = React.useState(2);

  const result = React.useMemo(() => {
    if (!input.trim()) {
      return { output: "", error: null as string | null, valid: false };
    }

    try {
      const parsed: unknown = JSON.parse(input);

      if (mode === "validate") {
        return { output: "", error: null, valid: true };
      }

      return {
        output:
          mode === "minify"
            ? JSON.stringify(parsed)
            : JSON.stringify(parsed, null, indent),
        error: null,
        valid: true,
      };
    } catch (error) {
      return { output: "", error: describeError(error, input), valid: false };
    }
  }, [input, mode, indent]);

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-card/40 p-1">
          {MODES.map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={mode === id ? "secondary" : "ghost"}
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
            >
              {label}
            </Button>
          ))}
        </div>
      }
    >
      <TextIO
        value={input}
        onValueChange={setInput}
        output={result.output}
        inputLabel="JSON"
        outputLabel={mode === "validate" ? "Prüfung" : "Ergebnis"}
        inputPlaceholder={'{\n  "hallo": "welt"\n}'}
        outputPlaceholder={
          mode === "validate"
            ? "Das Ergebnis der Prüfung erscheint unten."
            : "Formatiertes JSON erscheint hier"
        }
        error={result.error}
        errorTitle="Ungültiges JSON"
        rows={18}
        footer={
          mode === "format" ? (
            <div className="flex items-center gap-2">
              <span className="label-mono">Einrückung</span>
              {[2, 4].map((width) => (
                <Button
                  key={width}
                  type="button"
                  size="sm"
                  variant={indent === width ? "secondary" : "ghost"}
                  onClick={() => setIndent(width)}
                  aria-pressed={indent === width}
                >
                  {width} Leerzeichen
                </Button>
              ))}
            </div>
          ) : null
        }
      />

      {result.valid && mode === "validate" && (
        <Alert variant="success" className="mt-4">
          <CheckCircle2Icon />
          <div className="space-y-1">
            <AlertTitle>Gültiges JSON</AlertTitle>
            <AlertDescription>
              Die Eingabe wurde vollständig geparst.
            </AlertDescription>
          </div>
        </Alert>
      )}
    </ToolShell>
  );
}
