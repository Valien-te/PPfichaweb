# Textarea — guía de uso

Campo de texto multilínea, redimensionable verticalmente (alto mínimo predefinido). Renderiza un `<textarea>` nativo. El componente vive en tu proyecto: instálalo con `create-lexy add textarea` y edítalo con libertad.

## Import

```tsx
import { Textarea } from "@/shared/components/base/Textarea";
```

## Uso básico

```tsx
<div className="grid gap-1.5">
  <Label htmlFor="notas">Notas del caso</Label>
  <Textarea id="notas" placeholder="Resumen de la reunión…" rows={4} />
</div>
```

## Estado con contenido

Cuando contiene texto, usa automáticamente un fondo gris muy tenue. Al recibir foco
vuelve al fondo normal; el color solo reduce la carga visual y no comunica validación.

## Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `rows` | `number` | — | Alto inicial en líneas. |
| `aria-invalid` | `boolean` | — | Activa el estilo de error. |
| `disabled` | `boolean` | `false` | Deshabilita el campo. |
| ...resto | `textarea` props | — | `value`, `onChange`, `placeholder`, `maxLength`, etc. |

## Reglas

- Asocia siempre un `Label` por `htmlFor`/`id`.
- Usa `rows` para insinuar la longitud esperada de la respuesta.
- Si hay límite de caracteres, muéstralo cerca del campo (no solo un `maxLength` silencioso).
- Marca errores con `aria-invalid` + mensaje de texto.

## Cuándo NO usar

- **Una sola línea** (nombre, email, RUT) → `Input`.
- **Editor con formato/markdown** → no existe en el registry; documenta la decisión si usas algo a medida.

## Para IA

1. Úsalo solo cuando se espera texto de varias líneas (comentarios, descripciones, notas).
2. Empareja con `Label`.
3. Ajusta `rows` a la longitud esperada.
4. Si hay tope de caracteres, hazlo visible y redacta el error como corregir.
