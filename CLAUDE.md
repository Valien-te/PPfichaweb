# CLAUDE.md — Proyecto Lexy

Este proyecto usa el sistema de diseño Lexy en modelo **registry**: los
componentes viven en el proyecto, se descubren y traen con el CLI `create-lexy`
y se editan con libertad. El contexto completo para agentes vive en `AGENTS.md`
y en `ai/`.

## Orquestación por skills

Este proyecto define dos skills en `.claude/skills/`. Enruta cada tarea a la skill
correcta según su intención:

- **`lexy-dev`** — asistencia técnica para un diseñador no-coder: encender o apagar la
  vista previa (servidor de desarrollo), instalar componentes del registry
  (`create-lexy add`), instalar dependencias, y entender o destrabar errores. Úsala
  cuando la persona quiera *ver* su proyecto, instalar o agregar algo, o cuando algo
  *no funciona / da error*.
- **`lexy-design`** — diseño de interfaces de UI: layout, jerarquía, densidad, elección
  de componentes por criterio de diseño, estados, accesibilidad y microcopy. Úsala cuando
  la persona quiera *crear, diseñar o mejorar* una pantalla o flujo.

Frontera: **`lexy-design` decide *qué* construir; `lexy-dev` ejecuta *lo técnico*.**
Cuando diseño necesite levantar la vista previa o instalar un componente,
delega a `lexy-dev`. Si la intención es ambigua, pregunta antes de actuar.

## Material de referencia

El índice completo de referencias y los fundamentos de marca viven en **[AGENTS.md](AGENTS.md)**
(router canónico). No se repiten aquí para evitar drift: este archivo solo enruta.

- **[AGENTS.md](AGENTS.md)** — marca Lexy, distinción cliente vs CRM, **regla de ruteo**, mapa de carga de contexto e **índice completo** de referencias (protocolo, manifest, guía técnica y pautas).
- [ai/PROJECT-CONTEXT.md](ai/PROJECT-CONTEXT.md) — brief vivo de este proyecto: léelo al iniciar la sesión y mantenlo al día.
- [ai/README.md](ai/README.md) — orientación mínima del directorio `ai/` (apunta a AGENTS.md como índice canónico).
- Skills: [lexy-design](.claude/skills/lexy-design/SKILL.md) (qué construir) · [lexy-dev](.claude/skills/lexy-dev/SKILL.md) (lo técnico).
- `.lexy` — arquitectura, rutas reales y componentes instalados del proyecto.

## Reglas mínimas

- **Los componentes viven en tu proyecto.** Un proyecto vacío no carece de sistema
  de diseño: descubre el catálogo con `npx create-lexy view --list`, mira un
  componente con `view`, instálalo con `add` y edítalo localmente con libertad.
- No reemplaces con HTML/CSS propio un componente que existe en el registry: instálalo.
- Antes de crear un componente nuevo, confirma con `view` que no hay equivalente.
- El import local sale de `componentImportPattern` en `ai/lexy-ai-manifest.json`
  (derivado de `.lexy`); no inventes rutas.
- Define siempre si la interfaz es para cliente o para CRM. Si no está claro, pregunta.
- Accesibilidad, jerarquía y UX writing se diseñan desde el inicio, no al final.
- La geometría se fiscaliza en este repo: `pnpm lint:geometry` debe quedar en verde.

> El contexto de IA (`AGENTS.md`, `ai/`, `CLAUDE.md`, `.claude/`, `.github/copilot-instructions.md`)
> es removible antes de producción. Ver [ai/PRODUCTION-CLEANUP.md](ai/PRODUCTION-CLEANUP.md).
