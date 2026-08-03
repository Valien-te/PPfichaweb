import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

import { Logo } from "./Logo";

// `brand-navy` = navy/ink de marca Lexy (mismo del wordmark oscuro), definido
// en el theme como --color-brand-navy.
const headerVariants = cva("flex h-16 w-full shrink-0 items-center justify-between gap-6", {
  variants: {
    surface: {
      default: "bg-background text-foreground",
      transparent: "bg-transparent text-foreground",
      navy: "bg-brand-navy text-white",
    },
    bordered: { true: "border-b", false: "" },
    padding: {
      page: "px-4 md:px-6 lg:px-8",
      none: "px-0",
    },
    sticky: { true: "sticky top-0 z-50", false: "" },
  },
  compoundVariants: [
    { surface: "default", bordered: true, class: "border-border" },
    { surface: "transparent", bordered: true, class: "border-border" },
    { surface: "navy", bordered: true, class: "border-white/15" },
  ],
  defaultVariants: {
    surface: "default",
    bordered: true,
    padding: "page",
    sticky: false,
  },
});

export interface HeaderBarProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof headerVariants> {
  /** Acciones alineadas a la derecha (botones, avatar, menús). */
  actions?: React.ReactNode;
  /** Sobrescribe el área de marca (por defecto, el `Logo`). */
  brand?: React.ReactNode;
}

export const HeaderBar = React.forwardRef<HTMLElement, HeaderBarProps>(function HeaderBar(
  { surface = "default", bordered, padding, sticky, actions, brand, className, ...props },
  ref,
) {
  const logoSurface = surface === "navy" ? "dark" : "light";

  return (
    <header
      ref={ref}
      className={cn(headerVariants({ surface, bordered, padding, sticky }), className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-6">
        {brand ?? <Logo surface={logoSurface} />}
      </div>
      {actions != null && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
});

HeaderBar.displayName = "HeaderBar";

export { headerVariants };
