# Breadcrumb
Componente Breadcrumb.

## Cuándo usarlo

Para ubicar a la persona en jerarquías de más de dos niveles y darle retorno: Casos / Caso 482 / Documentos. Si la app es plana (una sidebar y ya), el breadcrumb es ruido.

## Composición

`Breadcrumb` > `BreadcrumbList` > `BreadcrumbItem`s: `BreadcrumbLink` para los antecesores, `BreadcrumbPage` para el nivel actual, con `BreadcrumbSeparator` entre medio y `BreadcrumbEllipsis` para rutas largas.

## Uso básico

```tsx
<Breadcrumb />
```

## Reglas

- Usa Breadcrumb según el propósito descrito.
- No abuses de este componente en contexts donde no aplica.

## Import

```tsx
import { Breadcrumb } from "@/shared/components/base/Breadcrumb";
```

## Props

Consulta la story en Storybook para ver las props disponibles.

## Para IA

1. Identifica el contexto de uso del componente.
2. Importa Breadcrumb desde el path correcto.
3. Configura las props según la necesidad.
4. Verifica que el componente se integre correctamente en el layout.
5. Solo usa variantes documentadas.
