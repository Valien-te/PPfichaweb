# Protocolo de implementación para IA

Detalle técnico de referencia para implementar pantallas, formularios, vistas o flujos en
un proyecto Lexy. **El flujo de trabajo ordenado lo definen las skills** (`lexy-design` y
su proceso de cinco fases; `lexy-dev` para lo técnico): esta guía es el detalle que esas
skills ejecutan, no un procedimiento paralelo.

## Regla central

**Los componentes viven en tu proyecto.** No construyas interfaces Lexy desde cero con
HTML/CSS propio si existe un componente equivalente en el registry. Primero descubre
(`npx create-lexy view --list`), mira el candidato (`view {component}`), instálalo
(`add {component}`) y recién después implementa. Una vez instalado, **edítalo localmente
con libertad** cuando el diseño lo pida: no hay internals prohibidos.

Un proyecto recién generado puede verse vacío. Eso es normal. La ausencia de componentes
locales no significa que no exista sistema de diseño: significa que aún no los has
instalado del registry.

## Secuencia técnica (referencia)

> El orden autoritativo lo define la skill correspondiente. Esta secuencia es el detalle
> técnico que `lexy-dev` (Fase 4 de `lexy-design`) ejecuta al materializar la interfaz.

1. Lee [AGENTS.md](../AGENTS.md).
2. Lee `.lexy` (arquitectura, rutas e instalados) y [ai/PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) (qué se construye, para quién, referencias y decisiones ya tomadas).
3. Lee [ai/lexy-ai-manifest.json](lexy-ai-manifest.json) (comandos, patrón de import local y rutas del prototipo).
4. Si `prototype.enabled` es `true`, abre el contrato indicado por
   `prototype.dataContractPath`. Antes de implementar identifica todo dato
   visible, editable, calculado o filtrable y comprueba que exista allí.
5. Agrega al contrato las entidades, campos, relaciones, estados o proyecciones
   faltantes. Los IDs frontend usan `camelCase`; una referencia backend vive en
   `source.reference` y usa `snake_case`.
6. Si un dato nace desde la usabilidad y TI todavía no confirmó su fuente, usa
   `origin: "generatedByUsability"` y
   `technicalValidation.status: "pendingTi"` con una nota accionable.
7. Si la pantalla usa backend, abre el contrato del motor: lecturas remotas son
   cargas de datos; escrituras son eventos publicados; interacciones locales no
   se declaran.
8. Si la pantalla necesita mock data, usa el simulador (`src/prototype/simulator/`):
   fixtures, escenarios, resolvers y handlers. No pegues registros mock en
   componentes.
9. Ejecuta `pnpm check:prototype` y corrige contratos/simulador antes de escribir la UI.
10. Lee [ai/TECHNICAL-USAGE.md](TECHNICAL-USAGE.md).
11. Si hay link de Figma o referencia visual, identifica primero el patrón real de la pantalla: estructura, densidad, ancho de contenido, navegación, CTA, ayuda, estados y componentes visibles.
12. Lee la pauta de diseño que corresponda:
    - [ai/pautas/diseno-cliente.md](pautas/diseno-cliente.md) para interfaces de cliente.
    - [ai/pautas/diseno-crm-lexy.md](pautas/diseno-crm-lexy.md) para CRM e interfaces internas.
13. Lee [ai/pautas/arquitectura-informacion-ux.md](pautas/arquitectura-informacion-ux.md) antes de definir layout, jerarquía, secciones o cantidad de información visible.
14. Lee [ai/pautas/sistema-visual.md](pautas/sistema-visual.md) (densidad, espaciado, tokens de estado, tipografía, motion) y [ai/pautas/buenas-practicas.md](pautas/buenas-practicas.md) (elección de componentes, estados obligatorios, anti-patrones). Revisa [ai/pautas/recetas-layout.md](pautas/recetas-layout.md) por si hay una composición canónica que aplique.
15. Lee [ai/pautas/ux-writing.md](pautas/ux-writing.md) antes de escribir textos de interfaz.
16. Lista los componentes que necesitas y confírmalos contra el catálogo (`npx create-lexy view --list`).
17. Revisa cada candidato con `npx create-lexy view {component}` (código, doc, variantes) y léete su guía `{Component}.md`.
18. Instala los que falten: `npx create-lexy add {component}` (trae dependencias internas y npm).
19. Importa con el patrón local de `.lexy`/manifest (p. ej. `@/components/base/Button` o `@/shared/components/base/Button`).
20. Implementa la interfaz usando esos componentes. Si uno necesita un ajuste para cumplir el diseño, **edita la copia local** (y actualiza su `.md` si cambia la API).
21. Revisa UX writing: consecuencias neutras, próximos pasos, títulos escaneables, sentence case y abreviaturas mínimas.
22. Revisa jerarquía y accesibilidad: semántica, landmarks, headings, orden de lectura, navegación por teclado, foco visible, labels, contraste, estados, errores y movimiento.
23. Haz el pase final anti-genérico de [ai/pautas/calidad-industria.md](pautas/calidad-industria.md): señales de UI genérica, ritmo de espaciado, datos realistas y los cuatro estados.
24. Ejecuta `pnpm build` y `pnpm lint:geometry` (prototipo, aplicación y geometría deben quedar en verde).
25. Si en el proceso se tomaron decisiones nuevas de alcance, audiencia, datos o referencia, regístralas en [ai/PROJECT-CONTEXT.md](PROJECT-CONTEXT.md).

## Cuando hay referencia Figma

No trates el Figma como inspiración vaga: es un **contrato de patrón**. Las
reglas completas de lectura de referencias (qué observar y conservar: tipo de
pantalla, navegación, densidad, contenedores, CTA, ayuda y ancho) viven en
[ai/pautas/arquitectura-informacion-ux.md](pautas/arquitectura-informacion-ux.md),
sección «Referencias visuales» — no se duplican aquí. Lo específico de la
implementación:

- Usa componentes del registry para materializar el patrón, pero no cambies el patrón solo porque el catálogo tenga `Card` o `Badge`.
- Si hay que apartarse de la referencia por limitación técnica, deja explícito qué cambió y por qué.

## Comandos base

```bash
npx create-lexy view button     # mirar antes de instalar (código + doc + metadata)
npx create-lexy add button      # instalar local y editable, con sus deps
```

Después de instalar, el import es local según la arquitectura de `.lexy`:

```tsx
import { Button } from "@/components/base/Button"; // layer
import { Button } from "@/shared/components/base/Button"; // feature
```

La divergencia con el registry se gestiona, no se teme: `diff {component}` la muestra,
`doctor` la vigila, y `add --overwrite` vuelve a la versión del catálogo si hace falta.

## Cuándo usar HTML nativo

Puedes usar HTML nativo para:

- Estructura semántica: `main`, `section`, `header`, `form`, `fieldset`, `legend`.
- Layout y agrupación cuando no hay componente Lexy equivalente.
- Texto, listas y contenido estático.
- Un control que no existe en el catálogo, siempre que confirmes con `view --list` y documentes por qué.

No uses HTML nativo para reemplazar componentes que sí existen en el registry, como `Button`, `Input`, `Label`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`, `Card`, `Table`, `Dialog`, `Tabs` o `Tooltip`: instálalos.

## Diseño: accesibilidad, jerarquía y UX writing

Estas reglas **no se detallan aquí**: su fuente de verdad son las pautas en `ai/pautas/`. No
las infieras ni reescribas desde este protocolo; léelas según el tema antes de implementar y
antes de validar:

- **Accesibilidad** (semántica, teclado, foco visible, `Label` asociado, contraste, estados, nombres accesibles, `prefers-reduced-motion`) → [ai/pautas/buenas-practicas.md](pautas/buenas-practicas.md).
- **Jerarquía, landmarks y estructura web** (orden de lectura = orden DOM, un solo `main`, `nav`/`aside`/`section` correctos, headings sin saltos, grillas) → [ai/pautas/arquitectura-informacion-ux.md](pautas/arquitectura-informacion-ux.md).
- **UX writing** (consecuencias sin alarmismo, próximos pasos, títulos escaneables, sentence case, abreviaturas mínimas) → [ai/pautas/ux-writing.md](pautas/ux-writing.md).
- **Densidad, espaciado y tokens de estado** → [ai/pautas/sistema-visual.md](pautas/sistema-visual.md). **Composiciones canónicas** → [ai/pautas/recetas-layout.md](pautas/recetas-layout.md).
- **Vara de calidad y pase anti-genérico** → [ai/pautas/calidad-industria.md](pautas/calidad-industria.md).

El `## Criterio final` de abajo resume los contratos que toda pantalla debe cumplir; las
pautas son el detalle accionable de cada contrato.

## Señales que no son excusa para saltarse el sistema

- `src/shared/components/base` o `src/components/base` está vacío.
- `installed: {}` en `.lexy`.
- El componente que necesitas no está en el proyecto.

Todas esas señales significan lo mismo: **instala con `create-lexy add`**, no abandones
el sistema ni escribas HTML/CSS propio para reemplazar componentes del catálogo.

## Criterio final

Una pantalla Lexy correcta debe cumplir estos contratos:

- Contrato de experiencia: seguir la pauta de cliente o CRM y la guía de UX writing.
- Contrato técnico: usar componentes del registry cuando existan, instalados en las rutas de `.lexy` e importados con el patrón local; `lint:geometry` en verde.
- Contrato de datos: ningún dato visible, editable, calculado o filtrable queda
  fuera del contrato; cargas/eventos y simulador coherentes; `pnpm check:prototype` en verde.
- Contrato de accesibilidad: garantizar uso por teclado, semántica, labels, foco, contraste, estados y mensajes comprensibles.
- Contrato de jerarquía: conservar landmarks, headings y orden de lectura coherentes con la prioridad visual.
- Contrato de microcopy: explicar consecuencias sin alarmismo, usar textos escaneables, sentence case y abreviaturas mínimas.

Además debe cumplir el contrato de arquitectura de información:

- Evitar eyebrows decorativos o genéricos.
- Usar títulos que expliquen tarea, estado o beneficio.
- Aplicar progressive disclosure para reducir carga visual.
- Mostrar primero lo necesario para avanzar.
- No esconder riesgos, costos, errores, plazos ni próximos pasos.
- Respetar el patrón de una referencia visual cuando exista, antes de optimizar o reinterpretar.
