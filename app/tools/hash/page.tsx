"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/tools/copy-button";
import { ErrorAlert } from "@/components/tools/error-alert";
import { FileDrop } from "@/components/tools/file-drop";
import { ToolShell } from "@/components/tools/tool-shell";
import { requireTool } from "@/lib/tools";
import { formatBytes } from "@/lib/utils";

const tool = requireTool("hash");

/** 100 MB — darüber dauert das Einlesen im Browser spürbar lang. */
const MAX_FILE_BYTES = 100 * 1024 * 1024;

const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-512"] as const;
type Algorithm = (typeof ALGORITHMS)[number];

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

type Tab = "text" | "file";
type Digests = Record<Algorithm, string>;

const EMPTY: Digests = { "SHA-1": "", "SHA-256": "", "SHA-512": "" };

export default function HashPage() {
  const [tab, setTab] = React.useState<Tab>("text");
  const [input, setInput] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [digests, setDigests] = React.useState<Digests>(EMPTY);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const source = tab === "text" ? input : file;

    if (!source || (tab === "text" && input.length === 0)) {
      setDigests(EMPTY);
      setBusy(false);
      return;
    }

    let cancelled = false;
    setBusy(true);
    setError(null);

    async function run() {
      try {
        const data =
          tab === "text"
            ? new TextEncoder().encode(input)
            : new Uint8Array(await (file as File).arrayBuffer());

        // Web Crypto ist nur in sicheren Kontexten verfügbar
        // (https oder localhost).
        if (!globalThis.crypto?.subtle) {
          throw new Error(
            "Web Crypto steht nicht zur Verfügung. Die Seite muss über HTTPS oder localhost laufen.",
          );
        }

        const results = await Promise.all(
          ALGORITHMS.map(async (algorithm) => {
            const digest = await crypto.subtle.digest(
              algorithm,
              data as unknown as BufferSource,
            );
            return [algorithm, toHex(digest)] as const;
          }),
        );

        if (cancelled) return;
        setDigests(Object.fromEntries(results) as Digests);
      } catch (cause) {
        if (cancelled) return;
        setDigests(EMPTY);
        setError(
          cause instanceof Error
            ? cause.message
            : "Hash konnte nicht berechnet werden.",
        );
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [tab, input, file]);

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
      <div className="flex flex-col gap-6">
        {tab === "text" ? (
          <div className="flex flex-col gap-2">
            <div className="flex h-8 items-center justify-between gap-2">
              <label htmlFor="hash-input" className="label-mono">
                Eingabe
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setInput("")}
                disabled={input.length === 0}
              >
                Leeren
              </Button>
            </div>
            <Textarea
              id="hash-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={8}
              placeholder="Text, der gehasht werden soll …"
            />
            <span className="label-mono tabular-nums">
              {input.length.toLocaleString("de-DE")} Zeichen
            </span>
          </div>
        ) : (
          <FileDrop
            file={file}
            onFileChange={(next) => {
              setError(null);
              setFile(next);
            }}
            onError={setError}
            maxBytes={MAX_FILE_BYTES}
            hint={`beliebiger Dateityp, bis ${formatBytes(MAX_FILE_BYTES)}`}
          />
        )}

        <ErrorAlert error={error} />

        <div className="flex flex-col gap-3">
          <span className="label-mono">
            Prüfsummen {busy && "· wird berechnet …"}
          </span>

          {ALGORITHMS.map((algorithm) => {
            const value = digests[algorithm];

            return (
              <div
                key={algorithm}
                className="flex flex-col gap-2 rounded-lg border bg-card/40 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="label-mono w-20 shrink-0 text-brand">
                  {algorithm}
                </span>
                <code className="min-w-0 flex-1 font-mono text-[0.76rem] leading-relaxed break-all text-foreground/90">
                  {value || (
                    <span className="text-muted-foreground/70">
                      {busy ? "…" : "—"}
                    </span>
                  )}
                </code>
                <CopyButton value={value} className="shrink-0 self-start sm:self-auto" />
              </div>
            );
          })}
        </div>
      </div>
    </ToolShell>
  );
}
