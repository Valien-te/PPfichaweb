# Dialog
Diálogo modal primitivo (Radix). **Para la mayoría de los casos usa `AppDialog`**, que ya arma la composición Material 3 (icono, título, descripción, acciones). Usa `Dialog` directo solo para layouts modales a medida sin esa estructura.

## Cuándo usarlo

El modal primitivo para layouts a medida: formularios en modal, contenido especial. Para la mayoría de los casos usa `AppDialog`, que ya trae la estructura canónica; `Dialog` es el plan B cuando esa estructura no alcanza.

## Composición

Composición Radix: `DialogTrigger` abre `DialogContent` (overlay y portal ya resueltos); dentro van `DialogHeader` (`DialogTitle`, `DialogDescription`), el cuerpo libre y `DialogFooter`; `DialogClose` cierra.

## Uso básico

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Ver detalle</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Detalle del documento</DialogTitle>
      <DialogDescription>Resumen generado automáticamente.</DialogDescription>
    </DialogHeader>
    {/* contenido a medida */}
    <DialogFooter>
      <DialogClose asChild><Button variant="ghost">Cerrar</Button></DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Reglas

- Incluye **siempre** un `DialogTitle` (accesibilidad: nombra el diálogo). Si lo ocultas visualmente, mantenlo para lectores de pantalla.
- `DialogTitle` usa 24/32 por defecto; usa `scale="compact"` para una composición 22/28 como la de `AppDialog`.
- Usa `DialogDescription` para el contexto; no dejes el cuerpo sin explicación.
- Usa `DialogTrigger asChild` / `DialogClose asChild` sobre tus propios botones.
- No anides diálogos; un modal a la vez.
- El diálogo **no trae X de cierre**: se cierra con Escape, click en el overlay o un botón explícito con `DialogClose` (el patrón Lexy es nombrar la acción, p. ej. «Cancelar»).
- Explica la consecuencia de las acciones (ver pauta de UX writing), sin "¿estás seguro?".

## Cuándo NO usar

- **Confirmación o formulario modal estándar** → `AppDialog` (menos código, patrón correcto).
- **Panel lateral** (filtros, detalle largo) → `Sheet`.
- **Ayuda breve anclada a un control** → `Popover`/`Tooltip`.
- **Mensaje efímero de resultado** → `Toast`.

## Import

```tsx
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/shared/components/base/Dialog";
```

## Exports

`Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal`.

## Para IA

1. Pregúntate primero si `AppDialog` cubre el caso (confirmación/formulario): si sí, úsalo.
2. Usa `Dialog` directo solo para un layout modal a medida.
3. Garantiza `DialogTitle` (visible o sr-only) y descripción.
4. Conecta trigger/close con `asChild` a tus botones.
5. Redacta acciones por su consecuencia; usa `Sheet`/`Popover`/`Toast` si encajan mejor.
