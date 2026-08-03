import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

// Tabla en grid de divs (no <table>): el ancho de columnas se controla con
// `columns` (grid-template-columns), lo que permite truncado y alineación
// fiables. Compound: Table + TableHeader/TableContent/TableRow/TableCell;
// los alias estáticos (Table.Header, …) se conservan por compatibilidad.

type TableVariant = "normal" | "basic" | "striped";

interface TableContextProps {
  columns?: string;
  variant: TableVariant;
  stickyHeader?: boolean;
}

const TableContext = React.createContext<TableContextProps>({
  variant: "normal",
  stickyHeader: false,
});

const tableVariants = cva(
  "flex w-full flex-col overflow-hidden rounded-md border border-border bg-card type-supporting text-foreground",
  {
    variants: {
      variant: {
        normal: "",
        basic: "border-none shadow-none",
        striped: "",
      },
    },
    defaultVariants: { variant: "normal" },
  },
);

export interface TableProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tableVariants> {
  /** grid-template-columns (p. ej. "2fr 1fr 1fr"). Sin definir: columnas iguales. */
  columns?: string;
  /** Mantiene el header visible al hacer scroll vertical. */
  stickyHeader?: boolean;
}

const TableRoot = React.forwardRef<HTMLDivElement, TableProps>(function Table(
  { children, className, columns, variant, stickyHeader = false, ...props },
  ref,
) {
  const resolvedVariant = variant ?? "normal";
  return (
    <TableContext.Provider value={{ columns, variant: resolvedVariant, stickyHeader }}>
      <div ref={ref} role="table" className={cn(tableVariants({ variant }), className)} {...props}>
        <div
          className={cn("w-full overflow-x-auto", {
            "max-h-125 overflow-y-auto": stickyHeader,
          })}
        >
          {children}
        </div>
      </div>
    </TableContext.Provider>
  );
});

const getGridStyles = (columns?: string) => {
  if (columns) return { gridTemplateColumns: columns };
  return { gridAutoFlow: "column" as const, gridAutoColumns: "1fr" };
};

const TableHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TableHeader({ children, className, style, ...props }, ref) {
    const { columns, variant, stickyHeader } = React.useContext(TableContext);

    return (
      <div
        ref={ref}
        role="rowgroup"
        style={{ ...getGridStyles(columns), ...style }}
        className={cn(
          "grid items-center px-4 py-3 font-semibold text-foreground",
          {
            "border-b border-border bg-background": variant === "basic" || variant === "normal",
            "bg-muted": variant === "striped",
            "sticky top-0 z-10 shadow-raised": stickyHeader,
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

const TableContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TableContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn("flex flex-col", className)} {...props} />;
  },
);

const TableRow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TableRow({ children, className, style, onClick, onKeyDown, tabIndex, ...props }, ref) {
    const { columns, variant } = React.useContext(TableContext);
    const isInteractive = onClick != null;

    // Fila clickable: también operable por teclado (Enter/Espacio) y focusable.
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
      onKeyDown?.(event);
      if (!isInteractive || event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <div
        ref={ref}
        role="row"
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
        style={{ ...getGridStyles(columns), ...style }}
        className={cn(
          "grid items-center px-4 py-3 transition-colors hover:bg-muted/60",
          {
            "border-b border-border last:border-0": variant === "normal",
            "border-none": variant === "basic",
            "border-none odd:bg-muted/40 even:bg-card": variant === "striped",
            "cursor-pointer": onClick,
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

const TableCell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TableCell({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="cell"
        className={cn("truncate px-1 leading-relaxed text-muted-foreground", className)}
        {...props}
      />
    );
  },
);

// Alias estáticos por compatibilidad con el uso Table.Header / Table.Row / …
const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Content: TableContent,
  Row: TableRow,
  Cell: TableCell,
});

export { Table, TableCell, TableContent, TableHeader, TableRow, tableVariants };
