# Popover — guía de uso

Panel flotante que se ancla a un elemento. Para contenido interactivo. El componente vive en tu proyecto: instálalo con `create-lexy add popover` y edítalo con libertad.

## Cuándo usarlo

Para contenido interactivo anclado a un elemento: un filtro rápido, un mini-formulario, un picker. Más que un tooltip (que solo informa), menos que un modal (que interrumpe).

## Composición

`PopoverTrigger` abre `PopoverContent` anclado al disparador (o a `PopoverAnchor` si el ancla es otro elemento); dentro va contenido libre.

## Uso básico

```tsx
<Popover />
```

## Reglas

- Usa Popover según el propósito descrito.
- No abuses de este componente en contexts donde no aplica.

## Import

```tsx
import { Popover } from "@/shared/components/base/Popover";
```

## Props

Consulta la story en Storybook para ver las props disponibles.

## Para IA

1. Identifica el contexto de uso del componente.
2. Importa Popover desde el path correcto.
3. Configura las props según la necesidad.
4. Verifica que el componente se integre correctamente en el layout.
5. Solo usa variantes documentadas.
