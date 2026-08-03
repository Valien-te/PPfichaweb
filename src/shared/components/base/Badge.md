# Badge — guía de uso

Etiqueta de estado o categoría, **no interactiva** (`<span>`). Para marcar estados ("Activo", "Pendiente") o clasificar. El componente vive en tu proyecto: instálalo con `create-lexy add badge` y edítalo con libertad.

## Import

```tsx
import { Badge } from "@/shared/components/base/Badge";
```

## Uso básico

```tsx
<Badge>Nuevo</Badge>
<Badge variant="secondary">Borrador</Badge>
<Badge variant="destructive">Vencido</Badge>
<Badge variant="outline">Archivado</Badge>
```

## Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline"` | `"default"` | Tono visual. |
| ...resto | `span` props | — | `className`, `aria-*`, etc. |

## Reglas

- El badge siempre lleva texto: no comuniques estado solo por color (accesibilidad).
- Es informativo, no clicable. Si necesitas que haga algo, usa `Button` o `DropdownMenu`.
- Mantén el texto corto (1–2 palabras).
- Para un punto de estado mínimo junto a texto usa `StatusDot`; para contadores numéricos, `CounterBadge`.

## Cuándo NO usar

- **Conteo numérico** (mensajes, ítems) → `CounterBadge`.
- **Indicador de estado tipo punto** junto a una fila → `StatusDot`.
- **Etiqueta removible / chip de filtro** → `Tag` (tiene `removable`).
- **Algo clicable** → `Button`.

## Para IA

1. ¿Es una etiqueta de estado/categoría estática y corta? Entonces `Badge`.
2. Elige la variante por intención: `destructive` para estados negativos, `secondary`/`outline` para neutros.
3. Si es número, punto de estado o chip removible, usa `CounterBadge`/`StatusDot`/`Tag`.
4. No lo uses como botón.
