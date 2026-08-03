import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

function tieneContenido(value: React.ComponentProps<"textarea">["value"]) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, value, defaultValue, onChange, ...props }, ref) => {
    const [contenidoNoControlado, setContenidoNoControlado] = React.useState(() =>
      tieneContenido(defaultValue),
    );
    const tieneValor = value !== undefined ? tieneContenido(value) : contenidoNoControlado;

    return (
      <textarea
        value={value}
        defaultValue={defaultValue}
        data-filled={tieneValor}
        onChange={(event) => {
          if (value === undefined) {
            setContenidoNoControlado(tieneContenido(event.target.value));
          }
          onChange?.(event);
        }}
        className={cn(
          "flex min-h-20 w-full resize-y rounded border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors duration-150",
          "data-[filled=true]:bg-muted/50 focus-visible:bg-background",
          "placeholder:text-muted-foreground",
          "hover:border-muted-foreground/40",
          "focus-visible:border-primary",
          "aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
