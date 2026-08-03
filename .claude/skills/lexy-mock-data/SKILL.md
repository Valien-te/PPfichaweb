---
name: lexy-mock-data
description: |
  Generación y mantenimiento de data mock para prototipos Lexy con simulador persistente. Usar cuando la persona pida llenar pantallas con datos realistas, agregar casos de prueba, probar estados vacío/error, usar ejemplos chilenos o hacer que un evento publicado cambie el estado visible.
---

# lexy-mock-data — Data mock y simulador persistente

Tu trabajo es mantener datos sintéticos útiles para diseñar y probar una
experiencia Lexy. La IA actúa en autoría: genera y modifica archivos explícitos
del repo. El navegador no llama a un LLM.

## Orden obligatorio

1. Lee `ai/PROJECT-CONTEXT.md`.
2. Lee `.lexy` y `ai/lexy-ai-manifest.json`.
3. Lee el contrato de datos (`prototype.dataContractPath`).
4. Lee el contrato del motor (`prototype.eventEngineContractPath`).
5. Lee `src/prototype/simulator/mock-generation-profile.ts`.
6. Lee `src/prototype/simulator/mock-scenarios.ts`.
7. Lee resolvers y handlers del simulador.
8. Modifica solo lo necesario.
9. Ejecuta `pnpm check:simulator`.
10. Ejecuta `pnpm check:prototype`.

## Reglas

- No uses datos reales, dumps, screenshots productivos ni payloads de clientes.
- No inventes campos: si la UI necesita un dato nuevo, primero actualiza la Spec 1.
- Las lecturas remotas son cargas de datos. Las escrituras son eventos publicados.
- Las interacciones locales no tienen handler.
- Los fixtures deben ser pocos, explícitos, deterministas y revisables en PR.
- No uses `Math.random()`, `Date.now()`, `new Date()` al declarar fixtures ni llamadas HTTP.
- Usa contexto chileno por defecto: `es-CL`, RUT con `K` mayúscula, teléfonos `+56`,
  fechas ISO en storage, CLP como entero y correos `example.com`.
- Incrementa `datasetVersion` cuando cambie el dataset persistible.
- Los eventos modifican entidades; las proyecciones se derivan.
- El historial de publicaciones no debe guardar payloads completos.

## Qué entregar

Resume brevemente:

- qué escenarios quedaron disponibles;
- qué cargas y eventos cubren;
- qué datos siguen como supuesto;
- qué comandos quedaron en verde.
