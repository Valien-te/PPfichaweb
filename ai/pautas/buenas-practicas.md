# Buenas prácticas de implementación Lexy

Reglas de oficio accionables: cuándo usar qué componente, cómo armar formularios,
qué estados son obligatorios y qué anti-patrones evitar. Heredan principios de
Fluent, Material y Apple HIG, aterrizados al registry Lexy y a React.

Esto responde *cuándo y cómo*. Para *valores* (espaciado, color, densidad) usa
[sistema-visual.md](sistema-visual.md); para *layouts completos* usa [recetas-layout.md](recetas-layout.md).

---

## 1. Elegir el componente correcto

- **`Card` vs continuidad.** Usa `Card` para agrupar contenido independiente que se
  consulta como unidad (un resumen, un item de lista). **No** envuelvas cada sección
  de un formulario en una card: rompe la continuidad de lectura. En CRM, prefiere
  superficie plana y tablas antes que muchas cards compitiendo.
- **`Dialog` vs `Sheet` vs página.**
  - `Dialog`: confirmación o tarea corta y focal que no debe perder el contexto detrás.
  - `Sheet`: panel lateral para detalle o edición sin abandonar la lista (típico CRM).
  - Página: flujos largos, multi-paso o que merecen URL propia. No metas un wizard
    completo en un dialog.
- **Tabla vs lista.** Tabla cuando comparas registros por las mismas columnas
  (escaneo en diagonal, CRM). Lista cuando cada item es heterogéneo o se lee como
  bloque. No uses tabla para dos campos; no uses cards para 200 filas.
- **`Tabs` vs secciones.** Tabs para categorías pares que no se necesitan ver a la
  vez. Si el usuario debe comparar o leer todo en orden, usa secciones apiladas.
- **Botones.** `default` = acción primaria (una sola por vista/sección),
  `secondary`/`outline` = secundarias, `ghost` = terciarias o de baja jerarquía,
  `link` = navegación inline, `destructive` = solo acciones que borran o revierten.
- **Data-driven antes que primitivas.** Para sidebar, header, diálogo estándar y
  acordeón usa `AppSidebar`, `AppHeaderBar`, `AppDialog` y `AppAccordion` (les
  pasas datos y componen solos); para una app interna completa parte de
  `SidebarProvider` + `AppSidebar` + `SidebarInset` (receta 7). Las primitivas
  (`Sidebar`, `HeaderBar`, `Dialog`, `Accordion`) quedan para composiciones a
  medida que el wrapper no cubre.
- **Listas largas.** Usa `Pagination` antes de renderizar cientos de filas o
  cortar la lista arbitrariamente. `ScrollArea` es para desborde controlado de
  paneles internos (no reemplaza el scroll de página ni la paginación).
- **Fechas.** Campo de fecha en formulario = `DatePicker`; selección visual de
  rango o navegación por mes = `Calendar` directo.
- **`Separator` solo cuando es estrictamente necesario.** Prefiere el espaciado y la
  agrupación (grid 8pt, fondos `card`, encabezados) para separar; el divisor es el
  último recurso, no el primero. Úsalo únicamente para un corte jerárquico real
  (p. ej. entre secciones de un menú o grupos de acciones), nunca entre cada
  elemento de una lista ni para decorar. Por defecto, **no agregues divisores**: si
  el layout se entiende sin ellos, déjalo sin ellos.

## 2. Formularios

- **`Label` siempre**, asociado con `htmlFor`/`id`. El placeholder **no** reemplaza al
  label: es un ejemplo o instrucción de acción.
- **Una columna por defecto.** Empareja campos (`grid grid-cols-2`) solo si se
  responden juntos y ayuda a escanear (ej. ciudad/región).
- **Agrupa con `fieldset`/`legend`** los campos de una misma decisión. El `legend`
  puede ir `sr-only` si el título visible ya lo cubre.
- **Validación en el momento correcto:** valida al salir del campo (`onBlur`) o al
  enviar, no en cada tecla. El error va **junto al campo**, dice qué pasó y cómo
  corregir, en tono neutro (ver [ux-writing.md](ux-writing.md)).
- **Estados del control:** marca inválido con `aria-invalid` (el `Input` ya lo
  estiliza), deshabilita con motivo, y en envío usa estado `loading` en el botón sin
  bloquear toda la pantalla.
- **Obligatorios:** indícalos de forma consistente y accesible, no solo con un
  asterisco suelto. Orden de tabulación = orden visual y de lectura.
- **No pierdas trabajo:** confirma antes de descartar cambios; preserva lo escrito
  ante un error de red.

## 3. Estados obligatorios (regla, no opción)

Toda vista que depende de datos resuelve **los cuatro**:

1. **Loading** — `Skeleton` con la forma del contenido real cuando el layout es
   conocido; `Spinner` solo para esperas puntuales sin layout (acción de botón,
   envío). Marca `aria-busy`/`aria-live`.
2. **Empty** — usa el componente `Empty` (título + descripción + acción): explica
   por qué está vacío y ofrece la acción de salida (ej. «Crear primer caso»). Un
   vacío sin acción es un callejón.
3. **Error** — di qué falló y ofrece reintentar; no escondas el error ni muestres
   datos a medias.
4. **Contenido** — el estado normal.

Éxito puntual (guardado, envío) → `Toast` con el siguiente paso, no un estado de
página. Ver receta 6 en [recetas-layout.md](recetas-layout.md).

## 4. Feedback y motion

- **Feedback inmediato.** Toda acción confirma su resultado: cambio de estado,
  toast, o transición. Nunca dejes al usuario sin saber si algo pasó.
- **No bloquees sin progreso.** Operación > ~400 ms muestra loading (botón, skeleton
  o barra). Para listas, prefiere optimistic UI solo si puedes revertir con claridad.
- **Motion corto y con propósito** (120–200 ms, sobre `opacity`/`transform`) y
  respeta `prefers-reduced-motion`. Detalles en [sistema-visual.md](sistema-visual.md). El movimiento
  nunca es la única señal de un cambio.

## 5. Densidad y responsive

- **Móvil primero en cliente; desktop primero en CRM** (el trabajo intensivo vive en
  pantallas grandes), pero ambos deben degradar con dignidad.
- **Qué colapsa:** en móvil, tablas densas pasan a lista o scroll horizontal
  controlado; toolbars apilan; sidebars se vuelven `Sheet`. No escondas acciones
  frecuentes, esconde detalle secundario.
- **Target táctil mínimo** ~44×44 px en superficies touch: usa `size='default'`
  (`h-10`) en cliente; reserva `sm` para toolbars de CRM con mouse.
- **Texto fluido:** no fijes alturas que rompan con texto más largo o zoom; respeta
  reflow hasta 200%.

## 6. React y código

- **Composición sobre props booleanas.** Prefiere componer (`Card` + contenido) antes
  que un mega-componente con diez flags. Si acumulas `isX`, `hasY`, `showZ`, divide.
- **Respeta la API del registry.** Usa las variantes que expone el componente
  (`variant`, `size`, `tone`); no sobreescribas su estructura con `className` que
  rompa su comportamiento. Extiende vía `className` con `cn()`, no clonando estilos.
- **No reinventes lo que existe.** Antes de crear un control, busca en
  `lexy-ai-manifest.json`. Si falta, créalo siguiendo los patrones del proyecto.
- **`cn()` para clases condicionales**, nunca concatenación de strings con template
  literals sueltos.
- **Keys estables** en listas (id real, no índice cuando el orden cambia).
- **Sin estado derivado.** No guardes en estado lo que puedes calcular en render;
  evita efectos que solo sincronizan props con estado.
- **Accesibilidad en el código:** HTML semántico, un `main`, landmarks, headings sin
  saltos, foco visible, `aria-label` en botones solo-icono. Ver
  [arquitectura-informacion-ux.md](arquitectura-informacion-ux.md).

## 7. Convenciones de código (biblia front-end)

### Arquitectura del proyecto

La arquitectura no se elige por gusto técnico sino por la **forma del producto**
(el mismo criterio que usa la TUI de `create-lexy`, en `projectShape.ts`):

| Forma del producto | Arquitectura | Router |
|---|---|---|
| Una pantalla o flujo corto (landing, formulario, demo) | **layered** (`src/components`, `src/views`…) | sin router |
| Una app con secciones y navegación (dashboard, listados, detalle) | **feature** (`src/features`, `src/app`…) | **react-router** |

- En **feature**, la navegación entre vistas se hace con `react-router` (ya
  viene instalado): el `App` monta `<Routes>` y cada vista nueva es un `<Route>`.
  La app se envuelve en `<BrowserRouter>` en `main.tsx`.
- En **layered** no hay router: una sola pantalla o un flujo corto sin URLs
  propias. Si el proyecto crece a varias secciones, esa es la señal para haber
  partido en feature.
- **React Compiler** está activo en ambos (memoización automática vía babel en
  `vite.config.ts`): no agregues `useMemo`/`useCallback` defensivos: confía en el
  compilador y reserva la memoización manual para casos medidos.

### Nomenclatura

| Qué | Convención | Ejemplo |
|---|---|---|
| Componentes y vistas | PascalCase | `Button.tsx`, `CasosDesk.tsx` |
| Hooks | `useX.ts` (camelCase con prefijo `use`) | `useCasos.ts`, `useIsMobile.ts` |
| Servicios y utils | kebab-case | `casos-service.ts`, `format-rut.ts` |
| Tipos (archivos) | kebab-case | `caso.types.ts`, `api-types.ts` |
| Variables y funciones | camelCase | `casosActivos`, `formatearPlazo()` |
| Borde back→front | `snake_case → camelCase` al recibir | `fecha_limite` → `fechaLimite` |

El mapeo `snake_case → camelCase` ocurre **una vez, en el borde** (el servicio que
consume la API); del servicio hacia adentro todo el front habla camelCase. No
dejes que el deletreo del backend se filtre a componentes o vistas.

### Estado global

- **Zustand es el estándar por defecto** para estado global (stores chicos,
  selectores, sin boilerplate).
- **Jotai** solo para casos genuinamente atómicos (muchas piezas de estado
  independientes y derivadas).
- **Redux** solo en escenarios complejos o legacy que ya lo usan; no para empezar.
- **No uses Context API para estado global.** Context es para inyección de
  dependencias de bajo cambio (tema, locale, usuario autenticado); como store
  re-renderiza árboles completos y no escala.
- Antes de subir algo a un store global pregunta: ¿de verdad lo comparten vistas
  lejanas? El estado local (`useState`) y el de URL siguen siendo lo primero.

### Validación

- **Zod es mandatorio en formularios**: el schema valida y **`z.infer` es la única
  fuente de verdad del tipado** — no declares a mano un tipo que duplica el schema.
- El componente `Form` del registry ya integra react-hook-form + zodResolver:
  instálalo con `create-lexy add form` (trae `zod` y `@hookform/resolvers`).
- Los mensajes de error viven en el schema, en español neutro que dice cómo
  corregir (ver [ux-writing.md](ux-writing.md)).
- El mismo criterio aplica al borde back→front: si parseas respuestas de API,
  valida con zod y deriva el tipo con `z.infer`.

### Barrels (index.ts)

- **Solo como API pública de una feature hacia afuera**: `features/casos/index.ts`
  exporta lo que otras features pueden consumir.
- **Dentro de una feature, imports directos al archivo hermano**
  (`./casos-service`, `./CasoCard`) — nunca a través del barrel propio (ciclos,
  bundles inflados, jumps de navegación).
- En arquitectura layer no hay barrels: se importa directo del archivo
  (`@/components/base/Button`).

## 8. Performance percibida

- **Lazy de vistas pesadas** (`React.lazy` + `Suspense`) con un fallback que respete
  el layout, no un salto en blanco.
- **Sin layout shift:** reserva espacio para imágenes (`width`/`height` o aspect),
  skeletons del tamaño final, y evita que el contenido «salte» al cargar.
- **Listas largas:** pagina o virtualiza antes de renderizar miles de filas.

## 9. Anti-patrones Lexy (lista negra)

No hagas esto, aunque «se vea bien»:

- **Eyebrow decorativo** (`PASO 1`, `CLIENTE`, `LEGAL TECH`) que repite el título o
  solo adorna. Solo si comunica estado, ubicación real o categoría que cambia la decisión.
- **Hero comercial en un intake o formulario.** Una ficha no es una landing.
- **Card envolviendo cada sección** de un formulario o cada fila de una tabla.
- **Color como único signo de estado.** Siempre acompaña con texto o icono.
- **Title Case** en UI. Usa sentence case (mayúscula solo inicial).
- **«¿Estás seguro?»** sin explicar la consecuencia concreta y cómo deshacer.
- **Emoji** en la interfaz: no son parte de la identidad Lexy.
- **Densidad sin jerarquía** en CRM: meter datos sin alineación ni agrupación no es
  eficiencia, es ruido.
- **Aire de cliente en una herramienta de trabajo** (y viceversa): confundir los dos
  mundos es el error más grave.
- **Esconder con progressive disclosure** costos, riesgos, plazos, errores
  bloqueantes o próximos pasos.
- **Context API como store global** o tipos duplicando un schema de zod a mano:
  van contra las convenciones de la sección 7.

## 10. Kit HTML para prototipos low-fi

Para bocetar una página sin montar React existe el **kit HTML** (`@lexydesign/kit`):
los mismos componentes y blocks del registry en HTML plano, con el mismo look vía
`kit.css`. Tráelo con `npx create-lexy kit` (lo copia a `lexy-kit/`).

- Es un **artefacto derivado del registry — nunca se edita a mano.** Si algo del kit
  no calza, se corrige en la fuente (`registry/`) y se regenera; no se parchea el HTML.
- Úsalo para **prototipar low-fi**: `lexy-kit/manifest.json` lista el inventario y
  `kit.css` da el estilo; componiendo el markup se arma una página con el look real.
- **No sustituye al registry.** El producto se construye con los componentes React
  instalados (`create-lexy add`); el kit es para explorar, no para producción.

---

## Checklist antes de entregar

1. ¿El componente elegido es el correcto para la tarea (no card por defecto)?
2. ¿Una sola acción primaria por vista/sección?
3. ¿Formularios con `Label`, error junto al campo y orden de tab correcto?
4. ¿Resolviste loading, empty, error y contenido?
5. ¿Hay feedback de toda acción y nada bloquea sin progreso?
6. ¿Responsive: colapsa detalle, no acciones frecuentes; target táctil suficiente?
7. ¿Código accesible, semántico y respetando la API del registry?
8. ¿Ningún anti-patrón de la lista negra?
