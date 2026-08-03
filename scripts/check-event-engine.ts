import { ZodError } from "zod";

import { prototypeDataContractSchema } from "../src/prototype/data-contract/data-contract-schema";
import {
  prototypeEventEngineContractSchema,
  validateEventEngineReferences,
  type EventEngineValidationIssue,
} from "../src/prototype/event-engine/event-engine-contract-schema";
import { prototypePayloadSchemas } from "../src/prototype/event-engine/payload-schema";

const formatPath = (path: Array<string | number>) =>
  path.length === 0 ? "eventEngine" : path.map(String).join(".");

const printIssues = (issues: EventEngineValidationIssue[]) => {
  console.error("✗ Motor de eventos inválido");
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

  const issues: EventEngineValidationIssue[] = [];
  if (!dataContractResult.success) {
    for (const issue of dataContractResult.error.issues) {
      issues.push({
        path: ["dataContract", ...issue.path.map(String)],
        message: issue.message,
      });
    }
  }
  if (!eventEngineResult.success) {
    for (const issue of eventEngineResult.error.issues) {
      issues.push({
        path: issue.path.map(String),
        message: issue.message,
      });
    }
  }

  if (dataContractResult.success && eventEngineResult.success) {
    issues.push(
      ...validateEventEngineReferences({
        eventEngineContract: eventEngineResult.data,
        dataContract: dataContractResult.data,
        payloadSchemas: prototypePayloadSchemas,
      }),
    );
  }

  if (issues.length > 0) {
    printIssues(issues);
    process.exitCode = 1;
  } else {
    const contract = eventEngineResult.data!;
    console.log("✓ Motor de eventos válido");
    console.log("  " + Object.keys(contract.dataLoads).length + " cargas de datos");
    console.log("  " + Object.keys(contract.events).length + " eventos publicados");
  }
} catch (error) {
  if (error instanceof ZodError) {
    printIssues(
      error.issues.map((issue) => ({ path: issue.path.map(String), message: issue.message })),
    );
  } else {
    console.error("✗ No se pudo cargar el motor de eventos");
    console.error("  " + (error instanceof Error ? error.message : String(error)));
  }
  process.exitCode = 1;
}
