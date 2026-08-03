import { ZodError } from "zod";

import { prototypeDataContractSchema } from "../src/prototype/data-contract/data-contract-schema";
import { prototypeEventEngineContractSchema } from "../src/prototype/event-engine/event-engine-contract-schema";
import { dataLoadHandlers } from "../src/prototype/simulator/data-load-handlers";
import { eventHandlers } from "../src/prototype/simulator/event-handlers";
import { mockGenerationProfile } from "../src/prototype/simulator/mock-generation-profile";
import { prototypeMockScenarios } from "../src/prototype/simulator/mock-scenarios";
import { projectionResolvers } from "../src/prototype/simulator/projection-resolvers";
import {
  mockGenerationProfileSchema,
  prototypeMockScenariosSchema,
  validateMockProfileReferences,
  validateMockScenarios,
  type SimulatorValidationIssue,
} from "../src/prototype/simulator/simulator-contract-schema";

const formatPath = (path: Array<string | number>) =>
  path.length === 0 ? "simulator" : path.map(String).join(".");

const printIssues = (issues: SimulatorValidationIssue[]) => {
  console.error("✗ Simulador inválido");
  for (const issue of issues) {
    console.error("  " + formatPath(issue.path));
    console.error("  " + issue.message);
  }
};

try {
  const dataContractModule = await import("../src/prototype/data-contract/prototype-data-contract");
  const eventEngineModule =
    await import("../src/prototype/event-engine/prototype-event-engine-contract");

  const dataContractResult = prototypeDataContractSchema.safeParse(
    dataContractModule.prototypeDataContract,
  );
  const eventEngineResult = prototypeEventEngineContractSchema.safeParse(
    eventEngineModule.prototypeEventEngineContract,
  );
  const profileResult = mockGenerationProfileSchema.safeParse(mockGenerationProfile);
  const scenariosResult = prototypeMockScenariosSchema.safeParse(prototypeMockScenarios);

  const issues: SimulatorValidationIssue[] = [];
  for (const [prefix, result] of [
    ["dataContract", dataContractResult],
    ["eventEngine", eventEngineResult],
    ["profile", profileResult],
    ["scenarios", scenariosResult],
  ] as const) {
    if (!result.success) {
      for (const issue of result.error.issues) {
        issues.push({
          path: [prefix, ...issue.path.map(String)],
          message: issue.message,
        });
      }
    }
  }

  if (
    dataContractResult.success &&
    eventEngineResult.success &&
    profileResult.success &&
    scenariosResult.success
  ) {
    issues.push(
      ...validateMockProfileReferences({
        profile: profileResult.data,
        dataContract: dataContractResult.data,
      }),
      ...validateMockScenarios({
        profile: profileResult.data,
        scenarios: scenariosResult.data,
        dataContract: dataContractResult.data,
        eventEngineContract: eventEngineResult.data,
      }),
    );

    for (const projectionId of Object.keys(projectionResolvers)) {
      if (!dataContractResult.data.projections[projectionId]) {
        issues.push({
          path: ["projectionResolvers", projectionId],
          message: 'La proyección "' + projectionId + '" no existe en la Spec 1.',
        });
      }
    }

    const requiredProjections = new Set<string>();
    for (const load of Object.values(eventEngineResult.data.dataLoads)) {
      for (const projectionId of load.reads?.projections ?? [])
        requiredProjections.add(projectionId);
    }
    for (const projectionId of requiredProjections) {
      if (!projectionResolvers[projectionId]) {
        issues.push({
          path: ["projectionResolvers", projectionId],
          message: 'Falta resolver para la proyección consumida "' + projectionId + '".',
        });
      }
    }

    for (const loadId of Object.keys(eventEngineResult.data.dataLoads)) {
      if (!dataLoadHandlers[loadId]) {
        issues.push({
          path: ["dataLoadHandlers", loadId],
          message: 'Falta handler para la carga "' + loadId + '".',
        });
      }
    }
    for (const handlerId of Object.keys(dataLoadHandlers)) {
      if (!eventEngineResult.data.dataLoads[handlerId]) {
        issues.push({
          path: ["dataLoadHandlers", handlerId],
          message: 'El handler "' + handlerId + '" no corresponde a ninguna carga.',
        });
      }
    }

    for (const eventId of Object.keys(eventEngineResult.data.events)) {
      if (!eventHandlers[eventId]) {
        issues.push({
          path: ["eventHandlers", eventId],
          message: 'Falta handler para el evento "' + eventId + '".',
        });
      }
    }
    for (const handlerId of Object.keys(eventHandlers)) {
      if (!eventEngineResult.data.events[handlerId]) {
        issues.push({
          path: ["eventHandlers", handlerId],
          message: 'El handler "' + handlerId + '" no corresponde a ningún evento.',
        });
      }
    }
  }

  if (issues.length > 0) {
    printIssues(issues);
    process.exitCode = 1;
  } else {
    console.log("✓ Simulador válido");
    console.log("  " + Object.keys(prototypeMockScenarios.scenarios).length + " escenarios");
    console.log("  datasetVersion " + prototypeMockScenarios.datasetVersion);
  }
} catch (error) {
  if (error instanceof ZodError) {
    printIssues(
      error.issues.map((issue) => ({ path: issue.path.map(String), message: issue.message })),
    );
  } else {
    console.error("✗ No se pudo cargar el simulador");
    console.error("  " + (error instanceof Error ? error.message : String(error)));
  }
  process.exitCode = 1;
}
