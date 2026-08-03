# Tooltip — guía de uso

Etiqueta breve que aparece al pasar el cursor o enfocar (Radix). Para **ayuda complementaria**, nunca para información esencial. El componente vive en tu proyecto: instálalo con `create-lexy add tooltip` y edítalo con libertad.

## Cuándo usarlo

Para ayuda complementaria al pasar el cursor o enfocar: el nombre de un botón solo-icono, una aclaración breve. Nunca para información esencial — en móvil no hay hover, y lo esencial debe estar visible.

## Composición

`TooltipProvider` una vez, arriba en el árbol; por cada caso, `Tooltip` con `TooltipTrigger` (el elemento que lo invoca) y `TooltipContent` (el texto breve).

## Uso básico

Envuelve la app (o la zona) una vez con `TooltipProvider`:

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button size="icon" aria-label="Archivar"><Archive /></Button>
    </TooltipTrigger>
    <TooltipContent>Archivar conversación</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Reglas

- El contenido es **complementario**: la interfaz debe entenderse sin leerlo.
- En botones solo-icono, el tooltip **no** reemplaza al `aria-label`: pon ambos.
- Usa `asChild` en el trigger para no anidar botones.
- Texto corto; no metas párrafos ni acciones dentro del tooltip.
- Coloca un `TooltipProvider` arriba en el árbol; no anides uno por tooltip.

## Cuándo NO usar

- **Información necesaria para decidir o actuar** → muéstrala en pantalla (texto de ayuda, `Label`, descripción).
- **Contenido rico o interactivo** (links, botones, formularios) → `Popover`.
- **Mensajes de error de formulario** → texto bajo el campo con `aria-describedby`.

## Import

```tsx
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/shared/components/base/Tooltip";
```

## Props (esenciales)

| Parte | Prop | Default | Descripción |
|---|---|---|---|
| `TooltipProvider` | `delayDuration` | `700` | Retardo antes de mostrar. |
| `TooltipTrigger` | `asChild` | — | Usa tu propio elemento como disparador. |
| `TooltipContent` | `side` | `"top"` | Lado: `top`/`right`/`bottom`/`left`. |
| `TooltipContent` | `sideOffset` | `4` | Separación del trigger. |

## Para IA

1. Pregúntate si el dato es prescindible; si es necesario, NO uses tooltip.
2. Envuelve con un `TooltipProvider` (una vez por zona).
3. Usa `TooltipTrigger asChild` sobre el control real.
4. En iconos, mantén `aria-label` además del tooltip.
5. Si necesitas contenido interactivo, cambia a `Popover`.
