import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ErrorAlertProps = {
  /** Nichts gesetzt heißt: kein Fehler, nichts wird gerendert. */
  error?: string | null;
  title?: string;
};

/**
 * Inline-Fehleranzeige. Bewusst kein Toast: Fehler stehen direkt
 * unter der Eingabe, bleiben stehen und verschwinden erst, wenn
 * das Tool wieder ein gültiges Ergebnis liefert.
 */
export function ErrorAlert({ error, title = "Fehler" }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangleIcon />
      <div className="min-w-0 space-y-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="break-words">{error}</AlertDescription>
      </div>
    </Alert>
  );
}
