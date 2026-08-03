import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

function tieneContenido(value: React.ComponentProps<"input">["value"]) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, defaultValue, onChange, ...props }, ref) => {
    const [contenidoNoControlado, setContenidoNoControlado] = React.useState(() =>
      tieneContenido(defaultValue),
    );
    const tieneValor = value !== undefined ? tieneContenido(value) : contenidoNoControlado;

    return (
      <input
        type={type}
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
          "flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150",
          "data-[filled=true]:bg-muted/50 focus-visible:bg-background",
          "placeholder:text-muted-foreground",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "hover:border-muted-foreground/40",
          "focus-visible:border-primary",
          "aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input",
          className,
        )}
        ref={ref}
        {...props}
        data-slot="input"
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
