import Link from "next/link";
import { TerminalIcon } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";

/** Wortmarke im Stil des Portfolio-Prompts: constantin@tools:~$ */
export function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex h-14 shrink-0 items-center gap-2.5 border-b px-5 font-mono text-[0.8rem] tracking-tight"
    >
      <TerminalIcon className="size-4 text-brand" />
      <span className="text-muted-foreground">
        constantin@tools:<span className="text-brand">~</span>$
      </span>
    </Link>
  );
}

/** Feste Seitenleiste ab `lg`. Darunter übernimmt das Sheet im Header. */
export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card/40 backdrop-blur-xl lg:flex">
      <SidebarBrand />
      <SidebarNav />
      <div className="shrink-0 border-t px-5 py-3">
        <span className="label-mono">v0.1 · lokal &amp; clientseitig</span>
      </div>
    </aside>
  );
}
