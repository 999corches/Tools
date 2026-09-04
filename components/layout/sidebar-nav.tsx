"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { toolsByCategory, tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

/**
 * Navigationsinhalt der Sidebar — identisch in der festen Leiste
 * (Desktop) und im Sheet (Mobile). Gruppiert nach Kategorie, direkt
 * aus der Registry.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5" aria-label="Tools">
      <Link
        href="/"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          pathname === "/"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <HomeIcon className="size-4 shrink-0" />
        <span className="flex-1">Übersicht</span>
        <span className="label-mono tabular-nums">{tools.length}</span>
      </Link>

      {toolsByCategory.map(({ category, tools: items }) => (
        <div key={category} className="flex flex-col gap-1">
          <span className="label-mono px-3 pb-1">{category}</span>

          {items.map((tool) => {
            const href = `/tools/${tool.slug}`;
            const active = pathname === href;
            const Icon = tool.icon;

            return (
              <Link
                key={tool.slug}
                href={href}
                onClick={onNavigate}
                title={tool.description}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand" />
                )}
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    active ? "text-brand" : "group-hover:text-brand",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{tool.name}</span>
                {tool.requiresBackend && <Badge variant="amber">API</Badge>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
