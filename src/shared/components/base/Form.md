# Form — guía de uso

Formularios con validación (patrón shadcn sobre `react-hook-form` + `zod`). `Form` provee el contexto, `FormField` registra cada campo y `FormItem`/`FormLabel`/`FormControl` cablean ids y `aria-*` automáticamente; `FormMessage` muestra el error del campo. `create-lexy add form` instala también `zod` y `@hookform/resolvers`. El componente vive en tu proyecto: instálalo con `create-lexy add form` y edítalo con libertad.

## Import

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/base/Form";
```

## Uso básico

```tsx
const schema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  nombre: z.string().min(2, "Ingresa tu nombre completo"),
});

function PerfilForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", nombre: "" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    // values ya viene validado y tipado
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Correo</FormLabel>
              <FormControl>
                <Input type="email" placeholder="nombre@empresa.cl" {...field} />
              </FormControl>
              <FormDescription>Usaremos este correo para avisarte.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Guardar cambios</Button>
      </form>
    </Form>
  );
}
```

## Integración con los inputs del sistema

`FormControl` es un Slot: envuelve cualquier control del registry sin nodo extra. Con `Input`, `Textarea` y `Searchbox` pasa `{...field}` directo. Para controles con API propia, mapea explícito:

```tsx
{/* Select */}
<Select onValueChange={field.onChange} value={field.value}>
  <FormControl>
    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
  </FormControl>
  <SelectContent>…</SelectContent>
</Select>

{/* Checkbox / Switch */}
<FormControl>
  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
</FormControl>

{/* DatePicker */}
<FormControl>
  <DatePicker value={field.value} onChange={field.onChange} />
</FormControl>
```

## Props

| Pieza | Qué es |
|---|---|
| `Form` | Alias de `FormProvider` de react-hook-form: recibe `{...form}`. |
| `FormField` | `Controller` + contexto del nombre del campo (`control`, `name`, `render`). |
| `FormItem` | Contenedor del campo (`grid gap-2`); genera el id base. `className`, `...props`, `ref`. |
| `FormLabel` | `Label` del sistema conectado al control (`htmlFor` automático, rojo con error). Acepta `required`. |
| `FormControl` | Slot que inyecta `id`, `aria-describedby`, `aria-invalid` al control envuelto. |
| `FormDescription` | Ayuda contextual (`text-muted-foreground`). |
| `FormMessage` | Error del campo (`text-destructive`); no renderiza nada si no hay error. |
| `useFormField` | Hook con el estado del campo, para piezas custom. |

## Reglas (UX writing de errores)

- El mensaje de error dice **qué pasó y cómo arreglarlo, en tono neutro**: *"Ingresa un correo válido"*, no *"Error de validación"* ni *"Campo inválido"*.
- Escribe los mensajes en el schema de zod (segundo argumento de cada validación): ahí viven junto a la regla.
- El label existe siempre, aunque haya placeholder; campo obligatorio se marca con `required` en `FormLabel`.
- Los inputs del sistema ya pintan el borde rojo con `aria-invalid` (se lo pone `FormControl`); no dupliques estilos de error.
- Valida en el submit (default de react-hook-form); evita validar tecla a tecla salvo necesidad real (`mode: "onBlur"` si el flujo lo pide).

## Cuándo NO usar

- **Un solo campo suelto** (un buscador, un toggle) → usa el control directo con estado local; el patrón Form paga cuando hay validación y varios campos.
- **Filtros que aplican al instante** → estado local o de URL, sin submit.

## Para IA

1. Define el schema zod arriba del componente; mensajes de error en español neutro que digan cómo corregir.
2. Un `FormField` por campo, siempre con `FormItem` + `FormLabel` + `FormControl` + `FormMessage`.
3. Usa los controles del registry dentro de `FormControl` (Input, Select, Checkbox, DatePicker…), no inputs nativos sin estilo.
4. `FormDescription` solo si la ayuda aporta; no repitas el label.
5. El botón de submit es `Button` con `type="submit"` dentro del `<form>`.
