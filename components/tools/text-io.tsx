"use client";

import * as React from "react";
import { ArrowLeftRightIcon, EraserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/copy-button";
import { ErrorAlert } from "@/components/tools/error-alert";
import { cn } from "@/lib/utils";

type TextIOProps = {
  value: string;
  onValueChange: (value: string) => void;
  /** Ergebnis — immer schreibgeschützt. */
  output: string;
  inputLabel?: string;
  outputLabel?: string;
  inputPlaceholder?: string;
  outputPlaceholder?: string;
  /**
   * Nebeneinander (Standard) oder untereinander. Unter `lg` wird
   * ohnehin gestapelt, weil Monospace-Spalten sonst zu schmal werden.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Wird der Callback übergeben, erscheint der Swap-Button. Üblich:
   * Ausgabe in die Eingabe übernehmen und den Modus umdrehen.
   */
  onSwap?: () => void;
  swapLabel?: string;
  /** Fehler des Tools — erscheint als Inline-Alert unter den Feldern. */
  error?: string | null;
  /** Überschrift des Fehler-Alerts, z. B. "Ungültiges JSON". */
  errorTitle?: string;
  /** Zusätzliche Bedienelemente in der Fußleiste, z. B. Optionen. */
  footer?: React.ReactNode;
  rows?: number;
  className?: string;
};

function countLines(text: string): number {
  if (!text) return 0;
  return text.split("\n").length;
}

function Meta({ text }: { text: string }) {
  return (
    <span className="label-mono tabular-nums">
      {text.length.toLocaleString("de-DE")} Zeichen · {countLines(text).toLocaleString("de-DE")} Zeilen
    </span>
  );
}

/**
 * Das Standardmuster fast jedes Tools: links Eingabe, rechts
 * Ausgabe, dazwischen Kopieren / Leeren / Tauschen und je ein
 * Zeichenzähler.
 */
export function TextIO({
  value,
  onValueChange,
  output,
  inputLabel = "Eingabe",
  outputLabel = "Ausgabe",
  inputPlaceholder = "Text hier einfügen …",
  outputPlaceholder = "Ergebnis erscheint hier",
  orientation = "horizontal",
  onSwap,
  swapLabel = "Tauschen",
  error,
  errorTitle,
  footer,
  rows = 16,
  className,
}: TextIOProps) {
  const horizontal = orientation === "horizontal";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className={cn(
          "grid gap-4",
          horizontal ? "lg:grid-cols-2" : "grid-cols-1",
        )}
      >
        {/* Eingabe */}
        <section className="flex min-w-0 flex-col gap-2">
          <div className="flex h-8 items-center justify-between gap-2">
            <label htmlFor="tool-input" className="label-mono">
              {inputLabel}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onValueChange("")}
              disabled={value.length === 0}
            >
              <EraserIcon />
              Leeren
            </Button>
          </div>

          <Textarea
            id="tool-input"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={inputPlaceholder}
            rows={rows}
            aria-invalid={Boolean(error)}
            className={cn(error && "border-destructive/50")}
          />
          <Meta text={value} />
        </section>

        {/* Ausgabe */}
        <section className="flex min-w-0 flex-col gap-2">
          <div className="flex h-8 items-center justify-between gap-2">
            <label htmlFor="tool-output" className="label-mono">
              {outputLabel}
            </label>
            <div className="flex items-center gap-1">
              {onSwap && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onSwap}
                  disabled={output.length === 0}
                  title="Ausgabe als neue Eingabe übernehmen"
                >
                  <ArrowLeftRightIcon />
                  {swapLabel}
                </Button>
              )}
              <CopyButton value={output} label="Kopieren" variant="ghost" />
            </div>
          </div>

          <Textarea
            id="tool-output"
            value={output}
            readOnly
            placeholder={outputPlaceholder}
            rows={rows}
            className="bg-card/50 text-foreground/90"
          />
          <Meta text={output} />
        </section>
      </div>

      <ErrorAlert error={error} title={errorTitle} />

      {footer && <div className="flex flex-wrap items-center gap-2">{footer}</div>}
    </div>
  );
}
