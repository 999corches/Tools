import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <title>Nicht gefunden · Tools</title>
      <span className="label-mono">Fehler 404</span>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Dieses Tool gibt es nicht.
      </h1>
      <p className="max-w-md text-muted-foreground text-pretty">
        Vielleicht ein Tippfehler in der Adresse — oder das Tool ist noch nicht
        gebaut.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Zur Übersicht</Link>
      </Button>
    </div>
  );
}
