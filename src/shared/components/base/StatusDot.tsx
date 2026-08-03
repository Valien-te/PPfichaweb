import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    tone: {
      gray: "bg-muted-foreground",
      brand: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-destructive",
      info: "bg-info",
    },
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
  },
  defaultVariants: { tone: "gray", size: "md" },
});

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusDotVariants> {
  /** Requerido cuando no hay texto (punto solo). */
  "aria-label"?: string;
}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  { tone, size, children, "aria-label": ariaLabel, className, ...props },
  ref,
) {
  return (
    <span ref={ref} className={cn("inline-flex min-w-0 items-center gap-2", className)} {...props}>
      <span className={statusDotVariants({ tone, size })} aria-hidden />
      {children ? (
        <span className="text-sm text-foreground">{children}</span>
      ) : (
        <span className="sr-only">{ariaLabel ?? "Estado"}</span>
      )}
    </span>
  );
});
StatusDot.displayName = "StatusDot";

export { StatusDot, statusDotVariants };
