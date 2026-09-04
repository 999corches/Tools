import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full resize-y rounded-lg border border-input bg-background/60 px-3.5 py-3",
        "font-mono text-[0.82rem] leading-relaxed",
        "placeholder:text-muted-foreground/70",
        "outline-none transition-colors focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      spellCheck={false}
      {...props}
    />
  );
}

export { Textarea };
