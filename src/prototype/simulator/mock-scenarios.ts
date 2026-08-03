import { definePrototypeMockScenarios } from "./simulator-contract-schema";

/**
 * Escenarios mock persistibles.
 *
 * Un proyecto fresco nace vacío y válido. El agente agrega fixtures explícitos
 * después del kickoff y sube datasetVersion cuando cambia el dataset.
 */
export const prototypeMockScenarios = definePrototypeMockScenarios({
  scenariosVersion: "1",
  datasetVersion: 3,
  defaultScenarioId: "base",
  scenarios: {
    base: {
      id: "base",
      name: "Recorrido principal",
      description:
        "Recorrido principal con una cesión de derechos hereditarios lista para probar la carga de documentos.",
      entities: {},
    },
    empty: {
      id: "empty",
      name: "Estado vacío",
      description: "Escenario sin resultados.",
      entities: {},
    },
    edgeCases: {
      id: "edgeCases",
      name: "Casos límite",
      description:
        "Casos especiales, incluido el límite de dos escrituras inmobiliarias por tercero de confianza.",
      entities: {},
    },
  },
});
