import { ZodError } from "zod";

import { prototypeDataContractSchema } from "../src/prototype/data-contract/data-contract-schema";

const formatPath = (path: PropertyKey[]) =>
  path.length === 0 ? "contrato" : path.map(String).join(".");

const printIssues = (error: ZodError) => {
  console.error("✗ Contrato de datos inválido");
  for (const issue of error.issues) {
    console.error("  " + formatPath(issue.path));
    console.error("  " + issue.message);
  }
};

const countPendingValidations = (value: unknown): number => {
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countPendingValidations(item), 0);
  }
  if (!value || typeof value !== "object") return 0;

  const record = value as Record<string, unknown>;
  const ownPending =
    record.technicalValidation &&
    typeof record.technicalValidation === "object" &&
    (record.technicalValidation as Record<string, unknown>).status === "pendingTi"
      ? 1
      : 0;

  return Object.values(record).reduce(
    (total, item) => total + countPendingValidations(item),
    ownPending,
  );
};

try {
  const module = await import("../src/prototype/data-contract/prototype-data-contract");
  const result = prototypeDataContractSchema.safeParse(module.prototypeDataContract);

  if (!result.success) {
    printIssues(result.error);
    process.exitCode = 1;
  } else {
    const contract = result.data;
    console.log("✓ Contrato de datos válido");
    console.log("  " + Object.keys(contract.entities).length + " entidades");
    console.log("  " + contract.relations.length + " relaciones");
    console.log("  " + Object.keys(contract.projections).length + " proyecciones");
    console.log(
      "  " + countPendingValidations(contract) + " elementos pendientes de validación con TI",
    );
  }
} catch (error) {
  if (error instanceof ZodError) {
    printIssues(error);
  } else {
    console.error("✗ No se pudo cargar el contrato de datos");
    console.error("  " + (error instanceof Error ? error.message : String(error)));
  }
  process.exitCode = 1;
}
