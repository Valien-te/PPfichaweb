# Instrucciones para GitHub Copilot — Proyecto Lexy

Este proyecto usa el sistema de diseño Lexy en modelo **registry**: los componentes
viven en el proyecto (se traen con `npx create-lexy add` y se editan con libertad).
Antes de generar o modificar interfaces, sigue el contexto de IA del proyecto. No
improvises un sistema propio: ya existe uno.

## Dos modos de trabajo (enrutamiento)

El proyecto define la misma orquestación que las skills de Claude (`.claude/skills/`).
Identifica la intención y trabaja en el modo correcto:

- **Modo técnico** — encender o apagar la vista previa (`pnpm dev`), descubrir e
  instalar componentes del registry (`create-lexy view` / `add`), instalar
  dependencias, destrabar errores. Habla en lenguaje de no-coder.
  Guía: [.claude/skills/lexy-dev/SKILL.md](../.claude/skills/lexy-dev/SKILL.md) y [ai/TECHNICAL-USAGE.md](../ai/TECHNICAL-USAGE.md).
- **Modo diseño** — crear, diseñar o mejorar una pantalla: layout, jerarquía, densidad,
  elección de componentes por diseño, estados, accesibilidad y microcopy.
  Guía: [.claude/skills/lexy-design/SKILL.md](../.claude/skills/lexy-design/SKILL.md) y las pautas de [ai/pautas/](../ai/pautas/).

Frontera: **diseño decide *qué* construir; lo técnico ejecuta.** Si la intención es
ambigua, pregunta antes de actuar.

## Material de referencia

El índice completo (protocolo, manifest, guía técnica y las 8 pautas de diseño) vive en
**[AGENTS.md](../AGENTS.md)**. No se repite aquí para evitar drift: este archivo solo
enruta hacia ese índice.

- **[AGENTS.md](../AGENTS.md)** — marca Lexy, distinción cliente vs CRM, regla de ruteo, mapa de carga de contexto e índice completo de referencias.
- [ai/PROJECT-CONTEXT.md](../ai/PROJECT-CONTEXT.md) — brief vivo de este proyecto: léelo al iniciar y mantenlo al día.
- `.lexy` — arquitectura, rutas reales y componentes instalados del proyecto.

## Reglas mínimas

- Un proyecto que se ve vacío no significa que no haya sistema de diseño: el catálogo
  completo está a un `npx create-lexy add` de distancia. Descubre con `view --list`,
  instala y compón antes de crear HTML/CSS propio.
- Los componentes instalados son **código local y editable**; modifícalos cuando el
  diseño lo pida. La divergencia con el registry se mantiene visible con
  `create-lexy diff` / `doctor`, no se evita.
- El import local sale de `componentImportPattern` en `ai/lexy-ai-manifest.json`; no
  inventes rutas.
- Antes de crear un componente nuevo, confirma con `create-lexy view` que no hay equivalente.
- Determina siempre si la interfaz es para **cliente** o para **equipo (CRM)**: la
  filosofía cambia por completo. Si no está claro, pregunta.
- Accesibilidad, jerarquía y UX writing no son una pasada final: se diseñan desde el inicio.

> El contexto de IA (`AGENTS.md`, `ai/`, `CLAUDE.md`, `.claude/`, `.github/copilot-instructions.md`)
> es removible antes de producción. Ver [ai/PRODUCTION-CLEANUP.md](../ai/PRODUCTION-CLEANUP.md).
