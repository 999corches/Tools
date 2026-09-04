"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { SidebarBrand } from "@/components/layout/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useCommandPalette } from "@/components/layout/command-palette";

export function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { open } = useCommandPalette();
  const pathname = usePathname();

  // Nach jedem Seitenwechsel das mobile Menü schließen.
  React.useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMenuOpen(true)}
        aria-label="Navigation öffnen"
      >
        <MenuIcon />
      </Button>

      {/* Suchfeld-Trigger — öffnet die Palette, ist selbst kein Input. */}
      <button
        type="button"
        onClick={open}
        className="group flex h-9 w-full max-w-sm items-center gap-2.5 rounded-lg border border-input bg-card/40 px-3 text-left transition-colors hover:border-brand/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate font-mono text-[0.78rem] text-muted-foreground">
          Tool suchen …
        </span>
        <kbd className="hidden shrink-0 rounded border border-border bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[0.62rem] tracking-[0.08em] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Alle Tools, nach Kategorie gruppiert.
          </SheetDescription>
          <SidebarBrand onNavigate={() => setMenuOpen(false)} />
          <SidebarNav onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
