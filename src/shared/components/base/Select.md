# Select — guía de uso

Lista desplegable de selección **única** (Radix). Ahorra espacio cuando hay muchas opciones y no necesitas verlas todas a la vez. El componente vive en tu proyecto: instálalo con `create-lexy add select` y edítalo con libertad.

## Import

```tsx
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/shared/components/base/Select";
```

## Uso básico

```tsx
<div className="grid gap-1.5">
  <Label htmlFor="region">Región</Label>
  <Select onValueChange={setRegion}>
    <SelectTrigger id="region">
      <SelectValue placeholder="Selecciona una región" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="rm">Metropolitana</SelectItem>
      <SelectItem value="v">Valparaíso</SelectItem>
      <SelectItem value="viii">Biobío</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## Con grupos

```tsx
<SelectContent>
  <SelectGroup>
    <SelectLabel>Zona norte</SelectLabel>
    <SelectItem value="i">Tarapacá</SelectItem>
  </SelectGroup>
  <SelectSeparator />
  <SelectGroup>
    <SelectLabel>Zona centro</SelectLabel>
    <SelectItem value="rm">Metropolitana</SelectItem>
  </SelectGroup>
</SelectContent>
```

## Estado con contenido

El trigger usa un fondo gris muy tenue cuando existe una selección. Mientras muestra
el placeholder o recibe foco conserva el fondo normal; el color no comunica validación.

## Exports

`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`.

## Props (esenciales)

| Parte | Prop | Descripción |
|---|---|---|
| `Select` | `value` / `defaultValue` | Selección controlada / inicial. |
| `Select` | `onValueChange` | Cambio de selección. |
| `SelectTrigger` | `id` | Para asociar el `Label`. |
| `SelectValue` | `placeholder` | Texto cuando no hay selección. |
| `SelectItem` | `value` | **Requerido.** Valor de la opción. |

## Reglas

- Asocia el `SelectTrigger` con un `Label` (`id`/`htmlFor`).
- Usa `SelectValue` con `placeholder` claro; no dejes el trigger vacío.
- Agrupa con `SelectGroup`/`SelectLabel` si hay categorías.
- Cada `SelectItem` necesita `value` único.

## Cuándo NO usar

- **Pocas opciones (2–4) que conviene ver siempre** → `RadioGroup`.
- **Necesitas escribir para filtrar** → `Combobox`.
- **Selección múltiple** → `Checkbox` o `Combobox` con multiselección (no este Select).
- **Acciones (no selección de valor)** → `DropdownMenu`.

## Para IA

1. Confirma que es selección única de un valor de formulario (no acciones, no multiselección).
2. Si son ≤4 opciones siempre visibles, considera `RadioGroup`; si requieren búsqueda, `Combobox`.
3. Arma `Select > SelectTrigger (con SelectValue) > SelectContent > SelectItem`.
4. Asocia el trigger con un `Label`.
5. Controla con `value`/`onValueChange` cuando alimente un formulario.
