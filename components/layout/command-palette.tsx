"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeftIcon } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { toolsByCategory } from "@/lib/tools";

type CommandPaletteContextValue = {
  open: () => void;
  setOpen: (open: boolean) => void;
  isOpen: boolean;
};

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(
  null,
);

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette muss innerhalb von <CommandPalette> stehen.");
  }
  return context;
}

/**
 * Command-Palette über ⌘K / Strg+K. Die Einträge kommen direkt aus
 * der Registry; cmdk sucht unscharf über Name, Kategorie und die
 * hinterlegten Keywords. Enter öffnet das Tool.
 */
export function CommandPalette({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const open = React.useCallback(() => setOpen(true), []);
  const value = React.useMemo(() => ({ open, setOpen, isOpen }), [open, isOpen]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/tools/${slug}`);
  }

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}

      <CommandDialog open={isOpen} onOpenChange={setOpen}>
        <CommandInput placeholder="Tool suchen …" />
        <CommandList>
          <CommandEmpty>Kein Tool gefunden.</CommandEmpty>

          {toolsByCategory.map(({ category, tools }) => (
            <CommandGroup key={category} heading={category}>
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <CommandItem
                    key={tool.slug}
                    value={tool.name}
                    keywords={[tool.slug, category, ...tool.keywords]}
                    onSelect={() => go(tool.slug)}
                  >
                    <Icon className="text-brand" />
                    <span className="min-w-0 flex-1 truncate">{tool.name}</span>
                    {tool.requiresBackend && <Badge variant="amber">Backend</Badge>}
                    <CommandShortcut className="flex items-center">
                      <CornerDownLeftIcon className="size-3" />
                    </CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  );
}
