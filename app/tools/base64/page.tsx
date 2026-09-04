"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/copy-button";
import { ErrorAlert } from "@/components/tools/error-alert";
import { FileDrop } from "@/components/tools/file-drop";
import { TextIO } from "@/components/tools/text-io";
import { ToolShell } from "@/components/tools/tool-shell";
import { requireTool } from "@/lib/tools";
import { formatBytes } from "@/lib/utils";

const tool = requireTool("base64");

/** 10 MB — darüber wird der Base64-String im Browser unhandlich. */
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function bytesToBase64(bytes: Uint8Array): string {
  // In Blöcken, sonst sprengt fromCharCode(...) bei großen Dateien den Stack.
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const cleaned = value.replace(/\s+/g, "");
  const binary = atob(cleaned);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeText(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text));
}

function decodeText(value: string): string {
  // `fatal` sorgt dafür, dass Binärdaten nicht still zu "" werden.
  return new TextDecoder("utf-8", { fatal: true }).decode(base64ToBytes(value));
}

type Tab = "text" | "file";
type Direction = "encode" | "decode";

export default function Base64Page() {
  const [tab, setTab] = React.useState<Tab>("text");

  // --- Text ---
  const [input, setInput] = React.useState("");
  const [direction, setDirection] = React.useState<Direction>("encode");

  const text = React.useMemo(() => {
    if (!input) return { output: "", error: null as string | null };

    try {
      return {
        output: direction === "encode" ? encodeText(input) : decodeText(input),
        error: null,
      };
    } catch {
      return {
        output: "",
        error:
          direction === "encode"
            ? "Text konnte nicht kodiert werden."
            : "Kein gültiges Base64 — oder das Ergebnis ist kein UTF-8-Text. Für Binärdaten den Reiter „Datei“ nutzen.",
      };
    }
  }, [input, direction]);

  // --- Datei ---
  const [file, setFile] = React.useState<File | null>(null);
  const [fileOutput, setFileOutput] = React.useState("");
  const [asDataUrl, setAsDataUrl] = React.useState(false);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!file) {
      setFileOutput("");
      return;
    }

    let cancelled = false;
    setBusy(true);
    setFileError(null);

    file
      .arrayBuffer()
      .then((buffer) => {
        if (cancelled) return;
        const encoded = bytesToBase64(new Uint8Array(buffer));
        const mime = file.type || "application/octet-stream";
        setFileOutput(asDataUrl ? `data:${mime};base64,${encoded}` : encoded);
      })
      .catch(() => {
        if (!cancelled) setFileError("Datei konnte nicht gelesen werden.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file, asDataUrl]);

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center gap-1 rounded-lg border bg-card/40 p-1">
          {(
            [
              { id: "text", label: "Text" },
              { id: "file", label: "Datei" },
            ] as const
          ).map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={tab === id ? "secondary" : "ghost"}
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
            >
              {label}
            </Button>
          ))}
        </div>
      }
    >
      {tab === "text" ? (
        <TextIO
          value={input}
          onValueChange={setInput}
          output={text.output}
          inputLabel={direction === "encode" ? "Klartext" : "Base64"}
          outputLabel={direction === "encode" ? "Base64" : "Klartext"}
          inputPlaceholder={
            direction === "encode" ? "Text zum Kodieren …" : "Base64 zum Dekodieren …"
          }
          error={text.error}
          swapLabel="Richtung tauschen"
          onSwap={() => {
            setInput(text.output);
            setDirection(direction === "encode" ? "decode" : "encode");
          }}
          footer={
            <div className="flex items-center gap-1 rounded-lg border bg-card/40 p-1">
              {(
                [
                  { id: "encode", label: "Kodieren" },
                  { id: "decode", label: "Dekodieren" },
                ] as const
              ).map(({ id, label }) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant={direction === id ? "secondary" : "ghost"}
                  onClick={() => setDirection(id)}
                  aria-pressed={direction === id}
                >
                  {label}
                </Button>
              ))}
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <FileDrop
            file={file}
            onFileChange={(next) => {
              setFileError(null);
              setFile(next);
            }}
            onError={setFileError}
            maxBytes={MAX_FILE_BYTES}
            hint={`beliebiger Dateityp, bis ${formatBytes(MAX_FILE_BYTES)}`}
          />

          <div className="flex flex-col gap-2">
            <div className="flex h-8 items-center justify-between gap-2">
              <span className="label-mono">
                Base64 {busy && "· wird gelesen …"}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={asDataUrl ? "secondary" : "ghost"}
                  onClick={() => setAsDataUrl((current) => !current)}
                  aria-pressed={asDataUrl}
                  disabled={!file}
                >
                  Als Data-URL
                </Button>
                <CopyButton value={fileOutput} label="Kopieren" variant="ghost" />
              </div>
            </div>

            <Textarea
              value={fileOutput}
              readOnly
              rows={14}
              placeholder="Base64 der Datei erscheint hier"
              className="bg-card/50"
            />
            <span className="label-mono tabular-nums">
              {fileOutput.length.toLocaleString("de-DE")} Zeichen
            </span>
          </div>

          <ErrorAlert error={fileError} />
        </div>
      )}
    </ToolShell>
  );
}
