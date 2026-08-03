import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

import { Button } from "./Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./Dialog";

export interface AppDialogProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DialogContent>,
  "title" | "children"
> {
  trigger: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Clase adicional para el bloque que agrupa título y descripción. */
  headerClassName?: string;
  /** Clase adicional para el título. */
  titleClassName?: string;
  /** Clase adicional para la descripción. */
  descriptionClassName?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  confirmDisabled?: boolean;
  onConfirm?: () => boolean | void | Promise<boolean | void>;
  onCancel?: () => void;
  actionsAlignment?: "right" | "center" | "left" | "space-between";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  hideFooter?: boolean;
  /** Oculta la acción secundaria y conserva únicamente la acción principal. */
  hideCancelAction?: boolean;
}

const AppDialog = React.forwardRef<React.ElementRef<typeof DialogContent>, AppDialogProps>(
  function AppDialog(
    {
      trigger,
      icon,
      title,
      description,
      headerClassName,
      titleClassName,
      descriptionClassName,
      children,
      confirmLabel = "Confirmar",
      cancelLabel = "Cancelar",
      confirmVariant = "default",
      confirmDisabled,
      onConfirm,
      onCancel,
      actionsAlignment = "right",
      open,
      onOpenChange,
      className,
      hideFooter,
      hideCancelAction,
      ...props
    },
    ref,
  ) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const handleOpenChange = (next: boolean) => {
      if (!next) onCancel?.();
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const handleConfirm = async () => {
      const result = onConfirm?.();
      const shouldClose = result instanceof Promise ? await result : result;
      if (shouldClose !== false) handleOpenChange(false);
    };

    const alignmentClasses = {
      right: "justify-end",
      center: "justify-center",
      left: "justify-start",
      "space-between": "justify-between",
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent ref={ref} className={cn("sm:max-w-md", className)} {...props}>
          {icon && (
            <div className="flex justify-center">
              <div className="text-foreground">{icon}</div>
            </div>
          )}

          <div
            className={cn(
              "flex flex-col gap-related",
              icon ? "text-center" : "text-left",
              headerClassName,
            )}
          >
            <DialogTitle
              scale="compact"
              className={cn("text-foreground", icon && "text-center", titleClassName)}
            >
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription
                className={cn("text-muted-foreground", icon && "text-center", descriptionClassName)}
              >
                {description}
              </DialogDescription>
            )}
          </div>

          {children && <div className="max-h-[60vh] overflow-y-auto">{children}</div>}

          {!hideFooter && (
            <div
              className={cn(
                "flex flex-col-reverse gap-related sm:flex-row",
                alignmentClasses[actionsAlignment],
              )}
            >
              {!hideCancelAction && (
                <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                  {cancelLabel}
                </Button>
              )}
              <Button variant={confirmVariant} disabled={confirmDisabled} onClick={handleConfirm}>
                {confirmLabel}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);
AppDialog.displayName = "AppDialog";

export { AppDialog };
