"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  /*
   * Vor dem Mount ist das Theme unbekannt. Wir rendern deshalb den
   * Dark-Zustand — den Default der App —, damit Server- und erste
   * Client-Ausgabe identisch sind: React repariert bei der Hydration
   * keine abweichenden Attribute, ein falsches aria-label bliebe
   * sonst dauerhaft stehen. Nach dem Mount folgt ein echtes Re-Render
   * mit dem tatsächlichen Theme.
   */
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Zu hellem Design wechseln" : "Zu dunklem Design wechseln"}
      title={isDark ? "Helles Design" : "Dunkles Design"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
