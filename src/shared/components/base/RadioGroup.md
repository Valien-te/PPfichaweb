# RadioGroup — guía de uso

Selección **única** entre opciones visibles (Radix). Usa `RadioGroup` como contenedor y `RadioGroupItem` por opción. El componente vive en tu proyecto: instálalo con `create-lexy add radio-group` y edítalo con libertad.

## Cuándo usarlo

Para elegir una sola opción entre pocas visibles (2–5): tipo de documento, modalidad. Todas las opciones a la vista permiten comparar de un vistazo. Con más opciones, ahorra pantalla con `Select` o `Combobox`.

## Composición

`RadioGroup` (estado y navegación por teclado) contiene un `RadioGroupItem` por opción, cada uno con su `Label`.

## Uso básico

```tsx
<fieldset>
  <legend className="mb-2 text-sm font-medium">Plan</legend>
  <RadioGroup defaultValue="mensual">
    <div className="flex items-center gap-2">
      <RadioGroupItem value="mensual" id="r-mensual" />
      <Label htmlFor="r-mensual">Mensual</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="anual" id="r-anual" />
      <Label htmlFor="r-anual">Anual</Label>
    </div>
  </RadioGroup>
</fieldset>
```

## Reglas

- Cada `RadioGroupItem` necesita `value` único y un `Label` con `id`/`htmlFor`.
- Envuelve el grupo en `fieldset` + `legend` que nombre la decisión.
- Conceptualmente siempre hay una sola opción activa.
- Mantén el orden estable; no reordenes opciones entre renders.

## Cuándo NO usar

- **Selección múltiple** → `Checkbox`.
- **Muchas opciones (>5–7) o con búsqueda** → `Select` / `Combobox` (ahorra espacio vertical).
- **Dos estados opuestos on/off de un ajuste** → `Switch`.

## Import

```tsx
import { RadioGroup, RadioGroupItem } from "@/shared/components/base/RadioGroup";
```

## Props

### `RadioGroup`
| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` / `defaultValue` | `string` | — | Opción seleccionada (controlado / inicial). |
| `onValueChange` | `(value) => void` | — | Cambio de selección. |
| `disabled` | `boolean` | `false` | Deshabilita todo el grupo. |

### `RadioGroupItem`
| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `string` | **Requerido.** Valor de la opción. |
| `id` | `string` | Para asociar el `Label`. |
| `disabled` | `boolean` | Deshabilita esa opción. |

## Para IA

1. Confirma que es "una sola entre varias" y que ver todas a la vez ayuda a decidir.
2. Si son demasiadas o necesitan búsqueda, prefiere `Select`/`Combobox`.
3. Empareja cada opción con un `Label`; envuelve en `fieldset`/`legend`.
4. Controla con `value` + `onValueChange` cuando dependa del estado del formulario.
