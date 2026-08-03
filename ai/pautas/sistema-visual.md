# Sistema visual Lexy — valores y densidad

Esta pauta da los **valores concretos** (espaciado, densidad, tipografía, color de
estado, motion) que el tema no documenta solo. Es complemento técnico de
[diseno-cliente.md](diseno-cliente.md) y [diseno-crm-lexy.md](diseno-crm-lexy.md): la filosofía dice *por qué*; esto dice
*con qué números*. Para reglas de oficio y composición usa [buenas-practicas.md](buenas-practicas.md).

El tema sigue la convención **shadcn/Tailwind**: usa los tokens semánticos
(`bg-primary`, `text-muted-foreground`, `border-border`) y deja que el CSS resuelva
los colores. Lo que sigue cubre lo que **no** es estándar y las decisiones de
densidad inspiradas en Fluent, Material y Apple HIG, aterrizadas a Geist y al tema Lexy.

---

## 1. Tokens no estándar (no inventes equivalentes crudos)

shadcn base solo trae `primary`, `secondary`, `destructive`, `muted`, `accent`. El
tema Lexy agrega tokens de estado. **Úsalos siempre; no uses colores crudos de
Tailwind como `bg-green-500` o `text-red-600` para estado.**

| Estado | Token | Texto/icono | Fondo sutil | Borde sutil |
|---|---|---|---|---|
| Éxito | `success` | `text-success` | `bg-success/10` | `border-success/20` |
| Alerta | `warning` | `text-warning` | `bg-warning/10` | `border-warning/20` |
| Error | `destructive` | `text-destructive` | `bg-destructive/10` | `border-destructive/20` |
| Información | `info` | `text-info` | `bg-info/10` | `border-info/20` |
| Marca | `primary` | `text-primary` | `bg-primary/10` | `border-primary/20` |

Reglas:

- **Patrón de superficie de estado:** texto con el token pleno + fondo a `/10` +
  borde a `/20`. Es el patrón ya usado por `Tag` y `StatusDot` del registry.
- `accent` (`bg-accent` / `text-accent-foreground`) es el tinte sutil del primary;
  úsalo para selección, hover de items y estados activos discretos, no para CTA.
- El color **nunca** es el único signo de estado: acompáñalo con texto o icono
  (ver [buenas-practicas.md](buenas-practicas.md)).

## 2. Pesos tipográficos (Geist pinta pesado)

El tema recalibra los pesos (`medium: 450`, `semibold: 500`, `bold: 600`). **Usa las
clases de utilidad, no valores numéricos:**

- `font-normal` (400) — cuerpo, captions.
- `font-medium` (450) — labels, items de navegación, énfasis suave.
- `font-semibold` (500) — títulos de sección, headers de tabla, botones.
- `font-bold` (600) — títulos de página, números destacados.

No uses `font-[600]` ni `font-extrabold`: rompen la rampa calibrada para Geist.

## 3. Rampa tipográfica (roles)

La rampa es tipo Fluent. Elige por **rol**, no por tamaño visual:

| Clase | px / line-height | Rol |
|---|---|---|
| `text-xs` | 12 / 16 | Caption, metadatos, ayuda |
| `text-sm` | 14 / 20 | **Cuerpo por defecto** y la mayoría de la UI |
| `text-base` | 16 / 22 | Cuerpo destacado, intro de cliente |
| `text-lg` | 20 / 26 | Subtítulo |
| `text-xl` | 24 / 32 | Título 3 |
| `text-2xl` | 28 / 36 | Título 2 |
| `text-3xl` | 32 / 40 | Título 1 (título de página cliente) |
| `text-4xl` | 40 / 52 | Large title (momentos expresivos cliente) |
| `text-5xl` | 68 / 92 | Display (solo portadas/hero de marca) |

- **CRM:** el texto base de trabajo es `text-sm`. Títulos de vista en `text-lg`/`text-xl`.
  No subas de `text-2xl` en herramientas internas: la expresividad es del cliente.
- **Cliente:** título de pantalla `text-2xl`/`text-3xl`, cuerpo `text-base`, ayuda `text-sm`.
- Un solo `h1` por página. No saltes niveles de heading para conseguir un tamaño.

## 4. Espaciado — grid de 8 pt (contrato híbrido)

Base de 8 px (con medios pasos de 4 px), convención compartida por Fluent, Material
y Apple HIG. Usa la escala de Tailwind, que ya es múltiplo de 4:

- Micro (dentro de un control): `gap-1` (4) · `gap-2` (8).
- Entre elementos relacionados: `gap-3` (12) · `gap-4` (16).
- Entre grupos / secciones: `gap-6` (24) · `gap-8` (32).
- Separación de bloques mayores: `gap-12` (48) · `gap-16` (64).

Reglas del contrato (las mismas que cumplen los componentes de la librería):

- **Grilla de 4 px para todo espaciado entre elementos**: gaps, `space-*`,
  márgenes y paddings de superficie. Evita valores arbitrarios (`p-[13px]`,
  `mt-[7px]`); si necesitas algo intermedio, redondea al paso de 4 más cercano.
  La escala de Tailwind v4 es dinámica: `w-70` (280 px) o `max-h-75` (300 px)
  son válidos y preferibles a `w-[280px]`.
- **Medio-pasos de 2 px solo DENTRO de un control**: padding fino de items de
  menú (`py-1.5`), iconos pequeños (`size-3.5`) y offsets de alineación. Nunca
  para separar hermanos o secciones.
- **Nudge óptico de 2 px (`m*-0.5`)**: permitido solo como compensación
  deliberada de baseline u óptica (icono junto a texto, asterisco de label).
- **Caja compuesta simétrica**: en un componente o bloque con header/contenido/
  footer, el espacio sobre el primer slot debe igualar el espacio bajo el
  último, todos los slots comparten el mismo riel horizontal (`px`), y los gaps
  entre slots son uniformes o decrecen con jerarquía clara. Cumplir la grilla
  valor a valor no basta si la unidad queda asimétrica.

## 5. Densidad — cliente vs CRM (el ajuste que más cambia el resultado)

La misma jerarquía, dos densidades. No las mezcles.

### Cliente (aire = calma)

- Contenedor de contenido: `max-w-xl` (formularios) a `max-w-2xl` (lectura).
- Padding de sección: `p-6` a `p-8`. Padding de página: `px-4` móvil, `px-6`+ desktop.
- Separación entre campos de formulario: `gap-5` / `space-y-5`.
- Separación entre secciones: `gap-8` a `gap-12`.
- Altura de inputs y botones: `h-10` (default del registry). No compactes.
- Una idea principal por pantalla; deja respirar.

### CRM (densidad jerarquizada = velocidad)

- Contenedor: ancho completo del área de trabajo (`w-full`), sin `max-w` estrecho.
- Padding de superficie: `p-4` (paneles), `px-4 py-3` (toolbars).
- Separación entre campos: `gap-3` / `space-y-3`.
- Filas de tabla: `h-10` cómoda, `h-9` compacta; celdas `px-3 py-2`.
- Densidad alta solo si está jerarquizada (alineación, peso, agrupación). Densidad
  sin jerarquía es ruido, no eficiencia.
- Prefiere edición en línea y acciones por fila sobre navegar a otra pantalla.

## 6. Superficie, bordes y radios

- **Elevación contenida.** Lexy usa superficie y borde antes que sombras fuertes.
  Cards y paneles: `bg-card border border-border` con `shadow-sm` como máximo.
  Capas flotantes (dropdown, popover, toast): `shadow-md`. `shadow-lg` queda
  reservado a overlays modales (Dialog, Sheet); `shadow-xl` no existe en el
  sistema.
- **Radio.** El tema usa `rounded` (controles — no escribas `rounded-sm`, que en
  Tailwind v4 es el mismo valor: un solo deletreo), `rounded-md`/`rounded-lg`
  (superficies), `rounded-xs` (detalles de 2 px) y `rounded-full` (avatares, dots,
  badges de conteo). `rounded-xl` no es parte del vocabulario. Mantén el radio
  consistente dentro de una misma vista.
- **Jerarquía por superficie:** `background` (fondo de app) < `card` (panel) <
  `popover` (flotante). No pongas card sobre card sobre card; aplana.

## 7. Iconografía (lucide-react)

- Tamaño por defecto en botones y junto a texto: `size-4` (16 px) — el registry ya
  lo aplica con `[&_svg]:size-4`. Iconos sueltos de acción: `size-4`/`size-5`.
- El icono **acompaña**, no es la única explicación: botón solo-icono requiere
  `aria-label`. Estado por icono requiere también texto.
- Estilo consistente: trazo lineal de lucide, no mezcles con emoji (Lexy no usa emoji).
- No decores cada sección con un icono. Un icono se gana su lugar si ayuda a
  reconocer o actuar más rápido.

## 8. Motion

Inspirado en Material/Apple: el movimiento orienta, no entretiene.

- **Duraciones cortas:** 120–200 ms para hover, foco y cambios de estado
  (`duration-150` es el default del registry). Transiciones de entrada de capas:
  150–250 ms. Nada por encima de ~300 ms en UI funcional.
- **Easing:** `ease-out` para entradas, `ease-in-out` para cambios reversibles.
- Anima `opacity` y `transform`, no `width`/`height`/`top` (evita reflow y jank).
- **Respeta `prefers-reduced-motion`:** envuelve animaciones no esenciales y
  ofrece una versión sin desplazamiento. Nunca dependas del movimiento para
  comunicar (un cambio de estado debe leerse también detenido).
- En CRM el movimiento es mínimo: feedback inmediato sobre animación elaborada.

---

## Checklist visual antes de entregar

1. ¿Usaste tokens de estado (`success`/`warning`/`info`) y no colores crudos?
2. ¿El estado se comunica con texto o icono además del color?
3. ¿Pesos vía clases (`font-medium`/`font-semibold`), sin valores numéricos?
4. ¿Espaciado en múltiplos de 4/8, sin valores arbitrarios?
5. ¿Las cajas compuestas son simétricas (espacio tope = base, riel `px` único entre header/contenido/footer, gaps uniformes)?
6. ¿La densidad corresponde al mundo (aire en cliente, compacto en CRM)?
7. ¿Un solo `h1` y headings sin saltos por tamaño?
8. ¿Elevación contenida (borde/superficie antes que sombra)?
9. ¿Motion corto, sobre opacity/transform y con `prefers-reduced-motion`?
