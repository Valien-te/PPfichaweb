# StatusDot — guía de uso

Punto de estado con color, pensado para acompañar texto (estado de una fila, disponibilidad, conexión). El color **nunca** es la única señal: va con texto o `aria-label`. El componente vive en tu proyecto: instálalo con `create-lexy add status-dot` y edítalo con libertad.

## Import

```tsx
import { StatusDot } from "@/shared/components/base/StatusDot";
```

## Uso básico

```tsx
<StatusDot tone="success">Activo</StatusDot>
<StatusDot tone="warning">Pendiente</StatusDot>
<StatusDot tone="danger">Vencido</StatusDot>
```

Si va solo (sin texto visible), agrega `aria-label`:

```tsx
<StatusDot tone="success" aria-label="En línea" />
```

## Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `tone` | `"gray" \| "brand" \| "success" \| "warning" \| "danger" \| "info"` | `"gray"` | Color del estado. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Tamaño del punto. |
| `children` | `ReactNode` | — | Texto del estado junto al punto. |

## Reglas

- Acompaña el punto con texto (`children`) o, si va solo, con `aria-label`. El color por sí solo no comunica estado (accesibilidad).
- Usa el `tone` por significado: `success`/`warning`/`danger` para estados; `gray`/`info`/`brand` para neutros.
- Mantén el texto de estado corto.

## Cuándo NO usar

- **Etiqueta de estado con fondo** (chip) → `Badge`.
- **Conteo numérico** → `CounterBadge`.
- **Chip removible / filtro** → `Tag`.

## Para IA

1. Úsalo para señalar el estado de un ítem o fila, casi siempre dentro de una `Table` o lista.
2. Empareja el color con texto visible; si no hay texto, agrega `aria-label`.
3. Elige `tone` por significado, no por estética.
