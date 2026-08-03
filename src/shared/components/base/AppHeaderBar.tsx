import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

import { Button } from "./Button";
import { HeaderBar, headerVariants } from "./HeaderBar";
import { Logo } from "./Logo";

export interface AppHeaderBarItem {
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface AppHeaderBarAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: "default" | "ghost" | "outline";
  disabled?: boolean;
}

export interface AppHeaderBarProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof headerVariants> {
  /** Qué mostrar como marca. `false` oculta el área de marca. ReactNode para custom. */
  brand?: React.ReactNode | false;
  /** Items de navegación principales (centro/izquierda). */
  items?: AppHeaderBarItem[];
  /** Acciones alineadas a la derecha (botones, avatar, menús). */
  actions?: React.ReactNode;
  /** Acciones como datos (alternativa a `actions` ReactNode). */
  actionItems?: AppHeaderBarAction[];
  /** Callback cuando cambia el item activo. */
  onItemClick?: (item: AppHeaderBarItem) => void;
}

/**
 * Barra de navegación superior data-driven.
 *
 * Wrapper ergonómico sobre `HeaderBar` + `Button`: describe la navegación como
 * datos (`items`, `actionItems`) y compone las piezas en el orden correcto.
 * Para estructuras distintas (mega-menús, buscador central), usa `HeaderBar`
 * directamente con `brand`/`actions` como ReactNode.
 */
export const AppHeaderBar = React.forwardRef<HTMLElement, AppHeaderBarProps>(function AppHeaderBar(
  {
    surface = "default",
    bordered,
    padding,
    sticky,
    brand,
    items,
    actions,
    actionItems,
    onItemClick,
    className,
    ...props
  },
  ref,
) {
  const logoSurface = surface === "navy" ? "dark" : "light";

  const brandArea = (
    <>
      {brand !== false && (brand ?? <Logo surface={logoSurface} />)}
      {items && items.length > 0 && (
        <nav className="hidden md:flex items-center gap-1">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => {
                if (item.onClick || onItemClick) {
                  e.preventDefault();
                  item.onClick?.();
                  onItemClick?.(item);
                }
              }}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.active
                  ? surface === "navy"
                    ? "bg-white/15 text-white"
                    : "bg-accent text-accent-foreground"
                  : surface === "navy"
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                item.disabled && "opacity-50 pointer-events-none",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </>
  );

  const actionArea =
    actionItems || actions ? (
      <>
        {actionItems?.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant ?? "default"}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {Icon && <Icon className="size-4" />}
              {action.label}
            </Button>
          );
        })}
        {actions}
      </>
    ) : undefined;

  return (
    <HeaderBar
      ref={ref}
      surface={surface}
      bordered={bordered}
      padding={padding}
      sticky={sticky}
      brand={brandArea}
      actions={actionArea}
      className={className}
      {...props}
    />
  );
});

AppHeaderBar.displayName = "AppHeaderBar";
