"use client";

import * as React from "react";
import {
  ArrowUpRightIcon,
  CloudIcon,
  DatabaseIcon,
  GithubIcon,
  GripVerticalIcon,
  LinkIcon,
  MailIcon,
  PlusIcon,
  ServerIcon,
  TriangleIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";

import { ToolShell } from "@/components/tools/tool-shell";
import { Button } from "@/components/ui/button";
import { requireTool } from "@/lib/tools";

const tool = requireTool("dashboard");

const STORAGE_KEY = "tools.dashboard.links";

type Shortcut = { id: string; name: string; href: string; hint: string };

/** Icons der mitgelieferten Einträge; selbst angelegte bekommen LinkIcon. */
const ICONS: Record<string, LucideIcon> = {
  supabase: DatabaseIcon,
  resend: MailIcon,
  ionos: ServerIcon,
  cloudflare: CloudIcon,
  github: GithubIcon,
  vercel: TriangleIcon,
};

const DEFAULTS: Shortcut[] = [
  {
    id: "supabase",
    name: "Supabase",
    href: "https://supabase.com/dashboard/projects",
    hint: "Datenbank, Auth, Storage",
  },
  {
    id: "resend",
    name: "Resend",
    href: "https://resend.com/overview",
    hint: "Transaktionsmails, Domains",
  },
  {
    id: "ionos",
    name: "IONOS",
    href: "https://my.ionos.de/",
    hint: "Domains, Verträge, Hosting",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    href: "https://dash.cloudflare.com/",
    hint: "DNS, Proxy, Zertifikate",
  },
  {
    id: "github",
    name: "GitHub",
    href: "https://github.com/",
    hint: "Repos, Issues, Actions",
  },
  {
    id: "vercel",
    name: "Vercel",
    href: "https://vercel.com/dashboard",
    hint: "Deployments, Logs, Domains",
  },
];

/** Verschiebt ein Element innerhalb der Liste. */
export function move<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

/** Ergänzt ein fehlendes Schema, damit href nicht relativ auflöst. */
function normalizeHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export default function DashboardPage() {
  const [items, setItems] = React.useState<Shortcut[]>(DEFAULTS);
  const [loaded, setLoaded] = React.useState(false);
  const dragIndex = React.useRef<number | null>(null);

  // Erst nach dem Mount lesen — sonst weicht das Server-HTML ab.
  React.useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw) as Shortcut[]);
      } catch {
        // kaputter Eintrag: Standardliste behalten
      }
    }
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const href = String(data.get("href") ?? "").trim();
    if (!name || !href) return;

    setItems((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name,
        href: normalizeHref(href),
        hint: String(data.get("hint") ?? "").trim(),
      },
    ]);
    form.reset();
  }

  return (
    <ToolShell tool={tool}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = ICONS[item.id] ?? LinkIcon;

          return (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              draggable
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(event) => {
                event.preventDefault();
                const from = dragIndex.current;
                if (from === null || from === index) return;
                dragIndex.current = index;
                setItems((current) => move(current, from, index));
              }}
              onDragEnd={() => {
                dragIndex.current = null;
              }}
              className="glass group flex flex-col gap-3 rounded-xl p-5 transition-[transform,border-color,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_34px_70px_-34px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-brand">
                  <Icon className="size-4" />
                </span>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <GripVerticalIcon className="size-4 cursor-grab opacity-0 transition-opacity group-hover:opacity-100" />
                  <button
                    type="button"
                    aria-label={`${item.name} entfernen`}
                    onClick={(event) => {
                      event.preventDefault();
                      setItems((current) =>
                        current.filter((entry) => entry.id !== item.id),
                      );
                    }}
                    className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                  >
                    <XIcon className="size-4" />
                  </button>
                  <ArrowUpRightIcon className="size-4 transition-colors group-hover:text-brand" />
                </div>
              </div>

              <h2 className="font-display text-base font-semibold tracking-tight">
                {item.name}
              </h2>
              <p className="text-sm text-muted-foreground text-pretty">
                {item.hint}
              </p>
            </a>
          );
        })}

        <form
          onSubmit={handleAdd}
          className="glass flex flex-col gap-2 rounded-xl border-dashed p-5"
        >
          <span className="label-mono">Neuer Link</span>
          <input
            name="name"
            required
            placeholder="Name"
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus-visible:border-brand/50"
          />
          <input
            name="href"
            required
            placeholder="https://…"
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus-visible:border-brand/50"
          />
          <input
            name="hint"
            placeholder="Notiz (optional)"
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus-visible:border-brand/50"
          />
          <Button type="submit" variant="outline" size="sm" className="mt-1 self-start">
            <PlusIcon className="size-4" />
            Hinzufügen
          </Button>
        </form>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Karten lassen sich per Drag &amp; Drop sortieren; Reihenfolge und
        eigene Links liegen im Browser (localStorage).{" "}
        <button
          type="button"
          onClick={() => setItems(DEFAULTS)}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Zurücksetzen
        </button>
      </p>
    </ToolShell>
  );
}
