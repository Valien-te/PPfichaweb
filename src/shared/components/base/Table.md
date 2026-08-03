# Table
Tabla de datos para comparar/escanear filas y columnas. Componente compuesto (`TableHeader`, `TableContent`, `TableRow`, `TableCell` — también disponibles como alias `Table.Header`, `Table.Content`, `Table.Row`, `Table.Cell`) basado en CSS grid.

## Cuándo usarlo

Para comparar y escanear filas homogéneas: casos, facturas, personas. Es la pieza central del CRM — densidad cómoda, estado por fila y acciones cerca. Si cada elemento pide narrativa propia (foto, párrafos), una lista de cards cuenta mejor.

## Composición

Compuesto basado en CSS grid: `Table` define las columnas, `TableHeader` la fila de encabezados, `TableContent` el cuerpo y `TableRow`/`TableCell` cada fila y celda (también como alias `Table.Header`, `Table.Row`…). El estado por fila se acompaña con `StatusDot` o `Tag`.

## Uso básico

```tsx
<Table columns="2fr 1fr 1fr">
  <Table.Header>
    <Table.Cell>Cliente</Table.Cell>
    <Table.Cell>Estado</Table.Cell>
    <Table.Cell>Monto</Table.Cell>
  </Table.Header>
  <Table.Content>
    {filas.map((f) => (
      <Table.Row key={f.id} onClick={() => abrir(f.id)}>
        <Table.Cell>{f.cliente}</Table.Cell>
        <Table.Cell><StatusDot tone={f.tone}>{f.estado}</StatusDot></Table.Cell>
        <Table.Cell>{f.monto}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Content>
</Table>
```

## Reglas

- Las celdas de `Table.Header` y de cada `Table.Row` deben tener el **mismo número** de columnas que `columns`.
- Usa `columns` con `fr`/anchos para alinear; no metas anchos a mano por celda.
- Si las filas son clicables (`onClick`), que toda la fila sea el objetivo y el cursor lo indique.
- Para estado por fila combina con `StatusDot`/`Badge` (texto, no solo color).
- `stickyHeader` para listas largas; mantén el header escaneable.

## Cuándo NO usar

- **Lista de un solo dato por ítem** → una lista simple, no una tabla.
- **Tarjetas con jerarquía visual rica** → `Card`/`FeatureCard`.
- **Pocos pares clave-valor de un registro** → lista de definición (`dl`) o `Card`, no tabla.

## Import

```tsx
import { Table } from "@/shared/components/base/Table";
```

## Props

### `Table`
| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `columns` | `string` | — | `grid-template-columns` (p. ej. `"2fr 1fr 1fr"`). Si se omite, columnas iguales automáticas. |
| `variant` | `"normal" \| "basic" \| "striped"` | `"normal"` | Con borde/relleno, sin bordes, o filas alternadas. |
| `stickyHeader` | `boolean` | `false` | Header fijo con scroll vertical (alto máx. ~500px). |

### Subcomponentes
`TableHeader`, `TableContent`, `TableRow` (acepta `onClick`), `TableCell` — alias: `Table.Header`, `Table.Content`, `Table.Row`, `Table.Cell`. Todos aceptan `className`, esparcen `...props` al nodo raíz y reenvían `ref`. `tableVariants` (CVA) se exporta para extender estilos.

## Para IA

1. Usa tabla solo cuando hay varias columnas que se comparan entre filas.
2. Define `columns` y respeta ese número de `Table.Cell` en header y filas.
3. Elige `variant` (`striped` ayuda a escanear filas largas; `basic` para tablas embebidas).
4. Para estados, añade `StatusDot`/`Badge` con texto, no solo color.
5. Si las filas navegan, usa `onClick` en `Table.Row` y deja claro que es clicable.
