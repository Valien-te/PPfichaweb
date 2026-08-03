# Infraestructura de IA

Este directorio contiene el contexto de IA del proyecto: orienta a agentes,
asistentes y devs durante el diseño y la implementación. No es parte del runtime
de la aplicación y puede retirarse antes de producción
([PRODUCTION-CLEANUP.md](PRODUCTION-CLEANUP.md)).

**El índice canónico es [../AGENTS.md](../AGENTS.md)** (regla de ruteo, mapa de
carga de contexto y referencia de cada documento y pauta). No se duplica aquí
para evitar drift. El flujo de trabajo lo definen las skills
([lexy-design](../.claude/skills/lexy-design/SKILL.md) para diseño,
[lexy-dev](../.claude/skills/lexy-dev/SKILL.md) para lo técnico); todo lo demás
en `ai/` es material que esas skills citan, no procedimientos paralelos.

Orientación mínima si aterrizaste aquí sin pasar por `AGENTS.md`:

- [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md) — brief vivo de este proyecto; se lee al inicio de cada sesión.
- [lexy-ai-manifest.json](lexy-ai-manifest.json) — índice técnico generado (comandos del registry, patrón de import local, rutas); no editarlo a mano.
- `pautas/` — criterio de diseño y contenido. Define primero si la interfaz es para **cliente** o **CRM** (si no está claro, pregunta) y abre solo la pauta que la tarea necesita.
