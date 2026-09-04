import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { toolsByCategory, tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Tools · Werkzeugkasten",
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4 border-b pb-9">
        <span className="label-mono">
          {tools.length} {tools.length === 1 ? "Tool" : "Tools"} ·{" "}
          {toolsByCategory.length} Kategorien
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Werkzeugkasten
        </h1>
        <p className="max-w-2xl text-muted-foreground text-pretty">
          Kleine Utilities, die ich regelmäßig brauche — an einem Ort. Alles
          läuft im Browser: keine Uploads, keine Konten, keine Server.
        </p>
        <p className="label-mono normal-case tracking-normal">
          Tipp: mit{" "}
          <kbd className="rounded border border-border bg-foreground/[0.05] px-1.5 py-0.5 text-[0.68rem]">
            ⌘K
          </kbd>{" "}
          bzw.{" "}
          <kbd className="rounded border border-border bg-foreground/[0.05] px-1.5 py-0.5 text-[0.68rem]">
            Strg+K
          </kbd>{" "}
          direkt zum Tool springen.
        </p>
      </section>

      {toolsByCategory.map(({ category, tools: items }) => (
        <section key={category} className="flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {category}
            </h2>
            <span className="label-mono tabular-nums">{items.length}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="glass group relative flex flex-col gap-3 rounded-xl p-5 transition-[transform,border-color,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_34px_70px_-34px_rgba(0,0,0,0.9)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-brand">
                      <Icon className="size-4" />
                    </span>

                    <div className="flex items-center gap-2">
                      {tool.requiresBackend && (
                        <Badge variant="amber">Backend</Badge>
                      )}
                      <ArrowUpRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-brand" />
                    </div>
                  </div>

                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground text-pretty">
                    {tool.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
