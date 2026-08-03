import * as React from "react";
import { toast, Toaster as Sonner } from "sonner";

import { cn } from "@/shared/lib/utils/cn";

// Toaster de la app (Sonner) tematizado con tokens Lexy. Se monta UNA vez en
// el layout raíz; después se dispara imperativo desde cualquier parte:
//
//   toast.success("Cambios guardados");
//   toast.error("No pudimos guardar. Intenta de nuevo.");
//
// Los tipos success/error/warning/info colorean con los tokens semánticos del
// theme (--color-success, --color-destructive, --color-warning, --color-info)
// vía las CSS vars de Sonner, así que cambiar el theme re-tematiza los toasts.
//
// Defaults pensados para CRM (denso, escritorio): bottom-right, 4s, cola de 3.
// Para mundo cliente (flujos guiados, móvil) se recomienda position="top-center"
// y duration={6000} — ver criterio en Toaster.md.

export type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, style, toastOptions, ...props }: ToasterProps) => (
  <>
    <style dangerouslySetInnerHTML={{ __html: `
      [data-sonner-toast][data-type="success"] [data-icon] {
        color: var(--color-success) !important;
      }
      [data-sonner-toast][data-type="error"] [data-icon] {
        color: var(--color-destructive) !important;
      }
      [data-sonner-toast][data-type="warning"] [data-icon] {
        color: var(--color-warning) !important;
      }
      [data-sonner-toast][data-type="info"] [data-icon] {
        color: var(--color-info) !important;
      }
    `}} />
    <Sonner
      className={cn("toaster group", className)}
      position="bottom-right"
      duration={2000}
      visibleToasts={3}
      style={
        {
          "--normal-bg": "var(--color-background)",
          "--normal-text": "var(--color-foreground)",
          "--normal-border": "var(--color-border)",
          "--success-bg": "var(--color-background)",
          "--success-text": "var(--color-success)",
          "--success-border": "color-mix(in oklab, var(--color-success) 15%, transparent)",
          "--error-bg": "var(--color-background)",
          "--error-text": "var(--color-destructive)",
          "--error-border": "color-mix(in oklab, var(--color-destructive) 15%, transparent)",
          "--warning-bg": "var(--color-background)",
          "--warning-text": "var(--color-warning)",
          "--warning-border": "color-mix(in oklab, var(--color-warning) 15%, transparent)",
          "--info-bg": "var(--color-background)",
          "--info-text": "var(--color-info)",
          "--info-border": "color-mix(in oklab, var(--color-info) 15%, transparent)",
          "--border-radius": "var(--radius-md)",
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          // Alerta sutil, compacta y refinada.
          toast: cn(
            "group toast !shadow-sm !py-2 !px-3.5 !text-[13px] !rounded-lg border",
            toastOptions?.classNames?.toast
          ),
          success: "!border-success/20 !bg-white !text-slate-800",
          error: "!border-destructive/20 !bg-white !text-slate-800",
          warning: "!border-warning/20 !bg-white !text-slate-800",
          info: "!border-info/20 !bg-white !text-slate-800",
          description: cn("!text-muted-foreground", toastOptions?.classNames?.description),
          actionButton: cn(
            "!bg-primary !text-primary-foreground",
            toastOptions?.classNames?.actionButton,
          ),
          cancelButton: cn(
            "!bg-muted !text-muted-foreground",
            toastOptions?.classNames?.cancelButton,
          ),
        },
      }}
      {...props}
    />
  </>
);

export { toast, Toaster };
