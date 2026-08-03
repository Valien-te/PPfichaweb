# AppHeaderBar — guía de uso

Barra de navegación superior **data-driven**. Describe la navegación como datos
(`items`, `actionItems`) y el componente compone internamente las primitivas de
`HeaderBar`. **Esta es la vía a usar para construir header bars.** No compongas a
mano `HeaderBar` directamente si `AppHeaderBar` cubre el caso. El componente vive en tu proyecto: instálalo con `create-lexy add app-header-bar` y edítalo con libertad.

## Import

```tsx
import { AppHeaderBar } from "@/shared/components/base/AppHeaderBar";
```

## Uso básico

```tsx
<AppHeaderBar
  items={[
    { label: "Dashboard", href: "/", active: true },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Configuración", href: "/config", disabled: true },
  ]}
  actionItems={[
    { label: "Nuevo", icon: Plus, onClick: () => openModal() },
  ]}
/>
```

## Uso con marca personalizada

```tsx
<AppHeaderBar
  brand={<Logo layout="horizontal" />}
  items={[
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
  ]}
  actions={<UserMenu />}
/>
```

## Sin marca

```tsx
<AppHeaderBar
  brand={false}
  items={[
    { label: "Inicio", href: "/" },
  ]}
/>
```

## Marca como imagen

```tsx
<AppHeaderBar
  brand={<img src="/logo.png" alt="Mi Marca" className="h-8 w-auto" />}
  items={[
    { label: "Inicio", href: "/" },
  ]}
/>
```

## Props

### `AppHeaderBar`

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `brand` | `ReactNode` | — | Marca del producto (por defecto, `Logo`). |
| `items` | `AppHeaderBarItem[]` | — | Items de navegación principales. |
| `actions` | `ReactNode` | — | Acciones como ReactNode (a la derecha). |
| `actionItems` | `AppHeaderBarAction[]` | — | Acciones como datos (alternativa a `actions`). |
| `onItemClick` | `(item) => void` | — | Callback al hacer click en un item. |
| `surface` | `"default" \| "transparent" \| "navy"` | `"default"` | Superficie de fondo. |
| `bordered` | `boolean` | `true` | Borde inferior. |
| `padding` | `"page" \| "none"` | `"page"` | Padding horizontal. |
| `sticky` | `boolean` | `false` | Fija en la parte superior. |

### `AppHeaderBarItem`

| Campo | Tipo | Descripción |
|---|---|---|
| `label` | `string` | Texto visible. |
| `href` | `string?` | URL de navegación. |
| `active` | `boolean?` | Marca el item activo. |
| `disabled` | `boolean?` | No navegable, atenuado. |
| `onClick` | `() => void` | Callback al hacer click. |

### `AppHeaderBarAction`

| Campo | Tipo | Descripción |
|---|---|---|
| `label` | `string` | Texto del botón. |
| `icon` | `LucideIcon?` | Icono a la izquierda. |
| `onClick` | `() => void` | Callback al hacer click. |
| `variant` | `"default" \| "ghost" \| "outline"` | Variante del botón. |
| `disabled` | `boolean?` | Deshabilita el botón. |

## Receta compuesta

`AppHeaderBar` es un wrapper ergonómico sobre `HeaderBar` + `Button`: describe la navegación como datos y compone las piezas en el orden correcto; las props extra pasan al `<header>` y el `ref` apunta a ese nodo. Para estructuras distintas (mega-menús, buscador central), usa `HeaderBar` directamente con `brand`/`actions` como ReactNode.

## Reglas

- Define la navegación como datos y pásala en `items`.
- Usa `actionItems` para botones de acción a la derecha.
- Usa `actions` (ReactNode) solo si necesitas componentes complejos (menus, dropdowns).
- Marca la ruta actual con `active`.
- Usa `disabled` para opciones bloqueadas en vez de ocultarlas.
- `surface="navy"` usa el color de marca `#0b013c`.
- Para casos a medida que no encajen en `items`/`actionItems`, usa `HeaderBar` directamente.

## Para IA

1. Identifica la navegación principal de la página.
2. Crea `AppHeaderBarItem[]` con los items de navegación.
3. Define `active` en el item de la ruta actual.
4. Crea `AppHeaderBarAction[]` para botones de acción (nuevo, crear, etc.).
5. Usa `onItemClick` si necesitas navegación client-side (React Router, etc.).
6. Si necesitas menus complejos o dropdowns, usa `actions` (ReactNode) en vez de `actionItems`.
7. Solo usa `HeaderBar` primitivo si necesitas un layout que no encaje en `items`/`actionItems`.
