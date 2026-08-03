# Input — guía de uso

Campo de texto de una línea. Renderiza un `<input>` nativo; acepta todos sus atributos (`type`, `value`, `onChange`, `placeholder`, `aria-*`). El componente vive en tu proyecto: instálalo con `create-lexy add input` y edítalo con libertad.

## Import

```tsx
import { Input } from "@/shared/components/base/Input";
```

## Uso básico

Siempre con un `Label` asociado por `id`/`htmlFor`:

```tsx
<div className="grid gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="nombre@empresa.cl" />
</div>
```

## Estado de error

```tsx
<div className="grid gap-1.5">
  <Label htmlFor="rut">RUT</Label>
  <Input id="rut" aria-invalid aria-describedby="rut-error" />
  <p id="rut-error" className="text-sm text-destructive">
    Ingresa un RUT válido, por ejemplo 12.345.678-9.
  </p>
</div>
```

## Estado con contenido

Cuando el campo contiene un valor, usa automáticamente un fondo gris muy tenue para
facilitar el recorrido visual de formularios largos. Al recibir foco vuelve al fondo
normal. Los valores elegidos desde el autocompletado del navegador conservan exactamente
el mismo tratamiento, sin la superficie azul predeterminada de Chrome, Edge o Safari.
Este cambio no comunica validación ni reemplaza los mensajes de error.

## Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `type` | `string` | `"text"` | `text`, `email`, `password`, `number`, `search`, `file`, etc. |
| `aria-invalid` | `boolean` | — | Activa el estilo de error (borde destructive). |
| `disabled` | `boolean` | `false` | Deshabilita el campo. |
| ...resto | `input` props | — | `value`, `onChange`, `placeholder`, `name`, `required`, etc. |

## Reglas

- **Siempre** asocia un `Label` por `htmlFor`/`id`. El `placeholder` no es un label: desaparece al escribir.
- Marca el error con `aria-invalid` **y** un mensaje de texto cercano; el color del borde no basta (accesibilidad).
- Enlaza el mensaje de error con `aria-describedby` para lectores de pantalla.
- Usa el `type` correcto (`email`, `number`, `tel`): mejora el teclado móvil y la validación.

## Cuándo NO usar

- **Texto largo / multilínea** → `Textarea`.
- **Elegir de una lista fija** → `Select` (o `Combobox` si hay búsqueda).
- **Sí/no o selección múltiple** → `Checkbox` / `RadioGroup` / `Switch`.
- **Buscar con icono y limpiar** → `Searchbox`.

## Para IA

1. Confirma que el dato es texto corto de una línea; si no, elige el control adecuado (ver arriba).
2. Crea el par `Label` + `Input` con `htmlFor`/`id` coincidentes.
3. Elige `type` según el dato.
4. Para validación, usa `aria-invalid` + mensaje con `aria-describedby`, redactado como corregir (no solo "campo inválido").
5. No uses el `placeholder` como única etiqueta.
