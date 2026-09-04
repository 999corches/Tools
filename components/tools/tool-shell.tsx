import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/tools";

type ToolShellProps = {
  tool: Tool;
  /** Optionale Aktionsleiste rechts vom Titel (Modus-Umschalter o. Ä.). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Rahmen jeder Tool-Seite: Kategorie-Label, Titel, Beschreibung und
 * darunter der Content-Slot. Titel und Text kommen aus der Registry,
 * damit Übersicht und Detailseite nicht auseinanderlaufen.
 */
export function ToolShell({ tool, actions, children, className }: ToolShellProps) {
  const Icon = tool.icon;

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* React hebt title/meta selbst in den <head> — so bleibt jede
          Tool-Seite eine einzige Datei, auch als Client-Komponente. */}
      <title>{`${tool.name} · Tools`}</title>
      <meta name="description" content={tool.description} />

      <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="flex min-w-0 gap-4">
          <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand">
            <Icon className="size-5" />
          </span>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono">{tool.category}</span>
              {tool.requiresBackend && <Badge variant="amber">Backend</Badge>}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {tool.name}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
              {tool.description}
            </p>
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
