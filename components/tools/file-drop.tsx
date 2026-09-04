"use client";

import * as React from "react";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";

type FileDropProps = {
  /** `accept`-Wert des Datei-Dialogs, z. B. "image/*,.pdf". */
  accept?: string;
  /** Aktuell gewählte Datei — die Anzeige ist damit steuerbar. */
  file?: File | null;
  onFileChange: (file: File | null) => void;
  /** Größenlimit in Bytes. Überschreitung meldet `onError`. */
  maxBytes?: number;
  onError?: (message: string) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Drag & Drop plus klassischer Datei-Dialog. Zeigt nach der Auswahl
 * Dateinamen und Größe an; das eigentliche Lesen der Datei bleibt
 * beim jeweiligen Tool.
 */
export function FileDrop({
  accept,
  file,
  onFileChange,
  maxBytes,
  onError,
  label = "Datei hierher ziehen",
  hint = "oder klicken, um eine Datei zu wählen",
  disabled,
  className,
}: FileDropProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  // Verschachtelte dragleave-Events zählen, sonst flackert der Rahmen.
  const depth = React.useRef(0);

  const accepts = React.useCallback(
    (candidate: File) => {
      if (!accept) return true;
      const patterns = accept.split(",").map((entry) => entry.trim().toLowerCase());
      const type = candidate.type.toLowerCase();
      const name = candidate.name.toLowerCase();

      return patterns.some((pattern) => {
        if (!pattern) return false;
        if (pattern === "*/*" || pattern === "*") return true;
        if (pattern.startsWith(".")) return name.endsWith(pattern);
        if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
        return type === pattern;
      });
    },
    [accept],
  );

  const select = React.useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;

      if (!accepts(candidate)) {
        onError?.(`Dateityp wird nicht unterstützt (erlaubt: ${accept}).`);
        return;
      }
      if (maxBytes && candidate.size > maxBytes) {
        onError?.(
          `Datei ist zu groß (${formatBytes(candidate.size)}, erlaubt sind ${formatBytes(maxBytes)}).`,
        );
        return;
      }

      onFileChange(candidate);
    },
    [accept, accepts, maxBytes, onError, onFileChange],
  );

  function open() {
    if (!disabled) inputRef.current?.click();
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          depth.current += 1;
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          depth.current -= 1;
          if (depth.current <= 0) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          depth.current = 0;
          setDragging(false);
          if (!disabled) select(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
          dragging
            ? "border-brand bg-brand/10"
            : "border-input bg-card/40 hover:border-brand/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <UploadIcon className={cn("size-5", dragging ? "text-brand" : "text-muted-foreground")} />
        <span className="text-sm font-medium">{label}</span>
        <span className="label-mono normal-case">{hint}</span>
        {accept && (
          <span className="label-mono mt-1 opacity-70">{accept}</span>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={(event) => {
            select(event.target.files?.[0]);
            // Zurücksetzen, damit dieselbe Datei erneut wählbar bleibt.
            event.target.value = "";
          }}
        />
      </div>

      {file && (
        <div className="flex items-center gap-3 rounded-lg border bg-card/50 px-3.5 py-2.5">
          <FileIcon className="size-4 shrink-0 text-brand" />
          <span className="min-w-0 flex-1 truncate font-mono text-[0.78rem]" title={file.name}>
            {file.name}
          </span>
          <span className="label-mono shrink-0 tabular-nums">{formatBytes(file.size)}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => onFileChange(null)}
            aria-label="Datei entfernen"
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
