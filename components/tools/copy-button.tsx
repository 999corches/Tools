"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyButtonProps = Omit<React.ComponentProps<typeof Button>, "value"> & {
  /** Text, der in die Zwischenablage geht. Leerer Text deaktiviert den Button. */
  value: string;
  /** Beschriftung neben dem Icon. Ohne Angabe: reiner Icon-Button. */
  label?: string;
};

/**
 * Kopiert `value` und zeigt für ~1,6 s "Kopiert" statt der
 * Beschriftung. Kein Toast — das Feedback bleibt am Ort der Aktion.
 */
export function CopyButton({
  value,
  label,
  className,
  variant = "outline",
  size,
  disabled,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timeout.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback für Browser ohne Clipboard-API-Freigabe (z. B. http).
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(area);
      }
    }

    setCopied(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (label ? "sm" : "icon")}
      onClick={copy}
      disabled={disabled ?? value.length === 0}
      aria-label={label ? undefined : copied ? "Kopiert" : "In die Zwischenablage kopieren"}
      className={cn(copied && "border-brand/60 text-brand", className)}
      {...props}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {label ? (copied ? "Kopiert" : label) : null}
    </Button>
  );
}
