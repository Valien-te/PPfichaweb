# Guía técnica de uso del proyecto Lexy

Esta guía es para devs y agentes de IA que trabajan dentro de un proyecto Lexy
(creado con `create-lexy`). Es el **anexo técnico que ejecuta la skill `lexy-dev`**;
el flujo de trabajo lo define esa skill, no este documento.

## El modelo registry (léelo primero)

**Los componentes viven en tu proyecto.** No hay librería npm de componentes: el
catálogo Lexy es un registry versionado (`@lexydesign/registry`) y el CLI
`create-lexy` trae cada componente como código local — tuyo y editable.

- **Míralo** antes de instalar: `npx create-lexy view button` (código + doc + metadata).
- **Instálalo**: `npx create-lexy add button` (con sus dependencias, en la ruta de `.lexy`).
- **Edítalo localmente con libertad**: es código del proyecto, no hay internals prohibidos.
- **Mantén la divergencia visible**: `diff` y `doctor` comparan tu copia con el registry vigente.

## Archivos de referencia

- `.lexy`: configuración generada del proyecto. Define arquitectura, rutas reales y componentes instalados (con la versión del registry con la que entraron).
- [ai/lexy-ai-manifest.json](lexy-ai-manifest.json): índice técnico generado — comandos del registry, patrón de import local (`componentImportPattern`) y rutas del prototipo.
- `src/prototype/data-contract/prototype-data-contract.ts`: fuente de verdad de entidades, campos, relaciones, estados y proyecciones usados por la experiencia. Confirma la ruta exacta en el manifest.
- `src/prototype/event-engine/prototype-event-engine-contract.ts`: fuente de verdad de cargas de datos y eventos publicados.
- `src/prototype/simulator/`: perfil chileno, escenarios, fixtures, resolvers, handlers y store mock persistente.
- [ai/IMPLEMENTATION-PROTOCOL.md](IMPLEMENTATION-PROTOCOL.md): protocolo para implementar interfaces con componentes del registry.
- [AGENTS.md](../AGENTS.md): prompt base para agentes.
- [ai/pautas/](pautas/): criterios de diseño y UX writing.

Antes de crear archivos propios o escribir imports, lee `.lexy` y usa sus rutas como fuente de verdad.
Antes de implementar UI, lee `ai/IMPLEMENTATION-PROTOCOL.md`.

## Comandos del proyecto

```bash
pnpm dev              # vista previa
pnpm check:data-contract # valida el contrato de datos
pnpm check:event-engine  # valida cargas de datos y eventos publicados
pnpm check:simulator     # valida fixtures, escenarios, handlers y reglas chilenas
pnpm check:prototype     # ejecuta las tres validaciones anteriores
pnpm build            # valida el prototipo y crea el build de producción
pnpm build:app        # build de aplicación sin repetir el chequeo explícito
pnpm preview          # revisar el build
pnpm lint:geometry    # contrato de geometría Lexy (espaciado, radios, sombras)
```

## Contrato de datos

Antes de agregar un dato visible, editable, calculado o filtrable a una pantalla:

1. revisa el contrato indicado por `prototype.dataContractPath` en el manifest;
2. declara el dato y sus relaciones o proyecciones;
3. usa IDs frontend `camelCase`;
4. conserva nombres backend `snake_case` únicamente en `source.reference`;
5. marca como `generatedByUsability` + `pendingTi` lo que aún deba validar TI;
6. ejecuta `pnpm check:data-contract`.

El contrato no contiene registros mock, datos personales reales, eventos ni
persistencia. Describe qué datos existen y qué significan para la experiencia.

## Motor de eventos e interacciones

El motor separa comunicaciones externas:

- `dataLoads`: lecturas remotas que alimentan la UI;
- `events`: escrituras publicadas como hechos Lexy;
- interacciones locales: fuera del motor.

Un filtro local sobre un array ya cargado no se declara. Un filtro que pide otra
página al backend sí es carga de datos. Una acción que crea o modifica
información es evento publicado y su resultado exitoso se muestra como
“Evento publicado”.

## Simulador persistente

La data mock no vive en componentes. Vive en `src/prototype/simulator/`:

- `mock-generation-profile.ts`: contexto chileno y hints de generación;
- `mock-scenarios.ts`: fixtures y behaviors por escenario;
- `projection-resolvers.ts`: proyecciones derivadas;
- `data-load-handlers.ts`: respuestas a cargas;
- `event-handlers.ts`: cambios de estado por evento publicado.

Los datos deben ser sintéticos, explícitos y deterministas. Usa RUT, teléfonos,
fechas, CLP y correos según las reglas del perfil. Después de cambiar mock data,
ejecuta `pnpm check:simulator` y `pnpm check:prototype`.

## Comandos del registry

```bash
npx create-lexy view --list        # catálogo completo
npx create-lexy view button        # ver un componente antes de instalar
npx create-lexy view button --installed   # ver la copia local
npx create-lexy add button         # instalar (resuelve dependencias internas)
npx create-lexy add button --overwrite    # re-instalar pisando cambios locales
npx create-lexy diff button        # copia local vs registry vigente (exit 1 si difiere)
npx create-lexy doctor             # salud del proyecto + drift de lo instalado
npx create-lexy doctor --strict    # las ediciones locales también fallan (CI)
```

## Crear un proyecto nuevo

```bash
npx create-lexy create mi-app                       # interactivo
npx create-lexy create mi-app -t feature -w crm     # automatizado (feature, CRM)
npx create-lexy create mi-app -t layer -w cliente   # automatizado (layer, cliente)
```

## Arquitecturas y paths

El import local depende de la arquitectura de `.lexy`. El patrón exacto vive en
`componentImportPattern` del manifest; estos son los dos casos:

### Feature

- Componentes: `src/shared/components/base`
- Hooks: `src/shared/hooks` · Servicios: `src/shared/services` · Utilidades: `src/shared/lib` · Vistas: `src/features`
- Helper `cn`: `@/shared/lib/utils/cn`
- Import: `import { Button } from "@/shared/components/base/Button";`

### Layer

- Componentes: `src/components/base`
- Hooks: `src/hooks` · Servicios: `src/services` · Utilidades: `src/lib` · Vistas: `src/views`
- Helper `cn`: `@/lib/utils/cn`
- Import: `import { Button } from "@/components/base/Button";`

## Qué hace `add` exactamente

- Resuelve el componente y sus **dependencias internas transitivas** (por ejemplo, un combobox trae también su popover y su botón).
- Copia los archivos a la ruta de componentes definida en `.lexy`, **incluida la guía `{Component}.md`** (viaja junto al código para que un agente la lea al trabajar).
- Adapta el import del helper `cn` a la arquitectura del proyecto.
- Instala **solo** las dependencias npm que el proyecto aún no tiene.
- Anota la versión en `.lexy` → `installed`, para que `diff`/`doctor` puedan razonar el drift.
- Si tu copia local tiene cambios, **pide confirmación** antes de sobrescribir (`--overwrite` para CI/agentes).

## Editar componentes instalados

Editar la copia local es el flujo normal del modelo — no hay "internals" prohibidos.
Reglas de oficio:

- Mantén `pnpm lint:geometry` en verde: el contrato de geometría se fiscaliza en cada repo.
- Actualiza el `{Component}.md` local si cambias la API o el comportamiento.
- La divergencia queda visible en `doctor` como _"editado localmente"_: es información, no error. Si más adelante quieres volver a la versión del registry, `add --overwrite`.

## Diagnosticar el proyecto

Comando de solo lectura. No modifica ni instala nada:

```bash
npx create-lexy doctor
```

Verifica:

- `.lexy` existe y es JSON válido (arquitectura, rutas, instalados).
- El theme (`src/lexy-theme.css`) y el helper `cn` están presentes.
- Por cada componente instalado: archivos presentes y su estado frente al registry vigente — **al día**, **desactualizado** (el registry avanzó; exit 1) o **editado localmente** (aviso; con `--strict`, exit 1).
- La capa de IA instalada (este directorio) está completa según el manifest.

Exit code `0` si todo está OK y `1` si hay algo roto o desactualizado, por lo que sirve en CI.

## Componentes disponibles

El catálogo vivo es el registry: `npx create-lexy view --list` lo consulta
(no se duplica aquí ni en el manifest — así no puede driftar). La guía de uso de
cada componente es su companion doc `{Component}.md`: instalada junto al
componente, o visible con `view` antes de instalar.

Regla rápida para componer: para sidebar, header, diálogo y acordeón usa las
versiones **data-driven** (`AppSidebar`, `AppHeaderBar`, `AppDialog`,
`AppAccordion`); para el layout de una app interna, `SidebarProvider` +
`AppSidebar` + `SidebarInset`. Las primitivas equivalentes son para
composiciones a medida.

## Reglas para agentes de IA

1. Antes de implementar una interfaz, descubre los componentes con `npx create-lexy view --list` y revisa los elegidos con `view {component}`.
2. Si un componente existe en el registry, **instálalo** (`add`) — no lo reescribas a mano ni lo reemplaces con HTML/CSS propio.
3. La ausencia de componentes locales no significa ausencia de sistema; significa que aún no los has instalado.
4. Usa el import local que corresponde a `.lexy` (`componentImportPattern` del manifest). No inventes rutas.
5. Edita los componentes instalados cuando el diseño lo pida — esa libertad es el modelo. Mantén `lint:geometry` en verde y el `{Component}.md` al día.
6. Si necesitas un componente que no está en el catálogo, confirma con `view` que no hay equivalente y créalo siguiendo los patrones del proyecto (o propónlo para el registry).
7. Todo lo de **diseño** (qué componente elegir y por qué, cliente vs CRM, densidad y espaciado, accesibilidad, jerarquía y landmarks, UX writing, progressive disclosure) tiene su fuente de verdad en las pautas de `ai/pautas/`. Léelas según el tema; no infieras estas reglas desde este documento ni desde el manifest.
8. Antes de cerrar, valida contra el `## Criterio final` de `ai/IMPLEMENTATION-PROTOCOL.md`: contratos de experiencia, técnico, accesibilidad, jerarquía, microcopy y arquitectura de información.
9. No agregues a la UI datos que no estén declarados en el contrato cuando
   `prototype.enabled` sea `true`.
10. No pegues fixtures mock en componentes; usa el simulador.
11. No llames evento a una lectura remota; declárala como carga de datos.

## Cuando implementes desde Figma

La referencia visual es un **contrato de patrón**. Las reglas de lectura (qué
observar y conservar) viven en
[ai/pautas/arquitectura-informacion-ux.md](pautas/arquitectura-informacion-ux.md)
(«Referencias visuales») y el detalle de implementación en
[ai/IMPLEMENTATION-PROTOCOL.md](IMPLEMENTATION-PROTOCOL.md) («Cuando hay
referencia Figma»). En corto: identifica el patrón antes de escribir código,
materialízalo con componentes del registry y no agregues secciones que la
referencia no muestra.

## Retirar la infraestructura de IA

Los archivos de contexto de IA no son necesarios para ejecutar la aplicación y
pueden retirarse antes de producción. El comando exacto y la verificación de
referencias residuales viven **solo** en
[ai/PRODUCTION-CLEANUP.md](PRODUCTION-CLEANUP.md); síguelo desde ahí para no
borrar de más ni de menos.
