# Retirar infraestructura de IA

Estos archivos son contexto de trabajo para IA y documentacion interna. No son necesarios para ejecutar la aplicacion.

Antes de preparar un artefacto de produccion, puedes retirarlos con:

```bash
rm -rf AGENTS.md CLAUDE.md .claude .github/copilot-instructions.md ai
```

Luego revisa que no queden referencias a estos documentos:

```bash
rg "AGENTS.md|CLAUDE.md|.claude/|copilot-instructions|ai/|lexy-ai-manifest|IMPLEMENTATION-PROTOCOL|TECHNICAL-USAGE|PRODUCTION-CLEANUP|PROJECT-CONTEXT|lexy-dev|lexy-design|diseno-cliente|diseno-crm-lexy|sistema-visual|recetas-layout|buenas-practicas|arquitectura-informacion-ux|ux-writing|calidad-industria"
```

Si el proyecto usa esta documentacion en CI, prompts o scripts internos, elimina primero esas referencias y despues borra la carpeta.
