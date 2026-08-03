import { z } from "zod";

const camelCaseIdSchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, "Debe usar camelCase y comenzar con una letra minúscula.");

const nonEmptyTextSchema = z.string().trim().min(1, "No puede quedar vacío.");

const technicalEventIdSchema = z
  .string()
  .regex(
    /^[A-Za-z][A-Za-z0-9]*_[A-Za-z0-9]+-[A-Za-z0-9]+_V[0-9]+$/,
    "Debe usar el formato eventista Dominio_Subdominio-NombreEvento_V1.",
  );

const dataReferenceSchema = z
  .string()
  .regex(
    /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)?$/,
    "Debe referenciar una entidad o campo como entidad o entidad.campo usando camelCase.",
  );

const triggerSchema = z
  .object({
    id: camelCaseIdSchema.optional(),
    label: nonEmptyTextSchema,
    source: z.enum(["screen", "userAction", "system", "external", "unknown"]),
    description: nonEmptyTextSchema.optional(),
  })
  .strict();

const schemaReferenceSchema = z
  .object({
    schemaId: camelCaseIdSchema,
  })
  .strict();

export const dataLoadSpecSchema = z
  .object({
    id: camelCaseIdSchema,
    name: nonEmptyTextSchema,
    productDescription: nonEmptyTextSchema,
    trigger: triggerSchema,
    paramsSchema: schemaReferenceSchema.optional(),
    responseSchema: schemaReferenceSchema.optional(),
    reads: z
      .object({
        entities: z.array(camelCaseIdSchema).optional(),
        projections: z.array(camelCaseIdSchema).optional(),
        fields: z.array(dataReferenceSchema).optional(),
      })
      .strict()
      .optional(),
    visibleResult: nonEmptyTextSchema,
    pendingTi: nonEmptyTextSchema.optional(),
  })
  .strict();

export const publishedEventSpecSchema = z
  .object({
    id: camelCaseIdSchema,
    name: nonEmptyTextSchema,
    technicalId: technicalEventIdSchema,
    productDescription: nonEmptyTextSchema,
    trigger: triggerSchema,
    payloadSchema: schemaReferenceSchema.optional(),
    receiptSchema: schemaReferenceSchema.optional(),
    writes: z
      .object({
        entities: z.array(camelCaseIdSchema).optional(),
        fields: z.array(dataReferenceSchema).optional(),
      })
      .strict()
      .optional(),
    visibleResult: nonEmptyTextSchema,
    pendingTi: nonEmptyTextSchema.optional(),
  })
  .strict();

export const prototypeEventEngineContractSchema = z
  .object({
    contractVersion: z.literal("1"),
    dataLoads: z.record(camelCaseIdSchema, dataLoadSpecSchema),
    events: z.record(camelCaseIdSchema, publishedEventSpecSchema),
  })
  .strict()
  .superRefine((contract, context) => {
    for (const [loadKey, load] of Object.entries(contract.dataLoads)) {
      if (loadKey !== load.id) {
        context.addIssue({
          code: "custom",
          path: ["dataLoads", loadKey, "id"],
          message: 'El id "' + load.id + '" debe coincidir con la key "' + loadKey + '".',
        });
      }
    }

    const technicalIds = new Set<string>();
    for (const [eventKey, event] of Object.entries(contract.events)) {
      if (eventKey !== event.id) {
        context.addIssue({
          code: "custom",
          path: ["events", eventKey, "id"],
          message: 'El id "' + event.id + '" debe coincidir con la key "' + eventKey + '".',
        });
      }

      if (technicalIds.has(event.technicalId)) {
        context.addIssue({
          code: "custom",
          path: ["events", eventKey, "technicalId"],
          message: 'El ID técnico "' + event.technicalId + '" está declarado más de una vez.',
        });
      }
      technicalIds.add(event.technicalId);
    }
  });

export type PrototypeEventEngineContract = z.infer<typeof prototypeEventEngineContractSchema>;
export type DataLoadSpec = z.infer<typeof dataLoadSpecSchema>;
export type PublishedEventSpec = z.infer<typeof publishedEventSpecSchema>;

export type EventEngineValidationIssue = {
  path: Array<string | number>;
  message: string;
};

type DataContractLike = {
  entities: Record<string, { fields: Record<string, unknown> }>;
  projections: Record<string, unknown>;
};

type PayloadSchemasLike = Record<string, unknown>;

const hasOwn = (record: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(record, key);

const validateDataReference = (
  reference: string,
  dataContract: DataContractLike,
): string | null => {
  const [entityId, fieldId] = reference.split(".");
  const entity = dataContract.entities[entityId];
  if (!entity) return 'La entidad "' + entityId + '" no existe en el contrato de datos.';
  if (fieldId && !hasOwn(entity.fields, fieldId)) {
    return 'El campo "' + reference + '" no existe en el contrato de datos.';
  }
  return null;
};

export const validateEventEngineReferences = (input: {
  eventEngineContract: PrototypeEventEngineContract;
  dataContract: DataContractLike;
  payloadSchemas: PayloadSchemasLike;
}): EventEngineValidationIssue[] => {
  const issues: EventEngineValidationIssue[] = [];
  const { eventEngineContract, dataContract, payloadSchemas } = input;

  for (const [loadId, load] of Object.entries(eventEngineContract.dataLoads)) {
    for (const [schemaKey, schemaRef] of [
      ["paramsSchema", load.paramsSchema],
      ["responseSchema", load.responseSchema],
    ] as const) {
      if (schemaRef && !hasOwn(payloadSchemas, schemaRef.schemaId)) {
        issues.push({
          path: ["dataLoads", loadId, schemaKey, "schemaId"],
          message: 'El schema "' + schemaRef.schemaId + '" no existe en payload-schema.ts.',
        });
      }
    }

    for (const [index, entityId] of (load.reads?.entities ?? []).entries()) {
      if (!dataContract.entities[entityId]) {
        issues.push({
          path: ["dataLoads", loadId, "reads", "entities", index],
          message: 'La entidad "' + entityId + '" no existe en el contrato de datos.',
        });
      }
    }
    for (const [index, projectionId] of (load.reads?.projections ?? []).entries()) {
      if (!dataContract.projections[projectionId]) {
        issues.push({
          path: ["dataLoads", loadId, "reads", "projections", index],
          message: 'La proyección "' + projectionId + '" no existe en el contrato de datos.',
        });
      }
    }
    for (const [index, reference] of (load.reads?.fields ?? []).entries()) {
      const message = validateDataReference(reference, dataContract);
      if (message) {
        issues.push({
          path: ["dataLoads", loadId, "reads", "fields", index],
          message,
        });
      }
    }
  }

  for (const [eventId, event] of Object.entries(eventEngineContract.events)) {
    for (const [schemaKey, schemaRef] of [
      ["payloadSchema", event.payloadSchema],
      ["receiptSchema", event.receiptSchema],
    ] as const) {
      if (schemaRef && !hasOwn(payloadSchemas, schemaRef.schemaId)) {
        issues.push({
          path: ["events", eventId, schemaKey, "schemaId"],
          message: 'El schema "' + schemaRef.schemaId + '" no existe en payload-schema.ts.',
        });
      }
    }

    for (const [index, entityId] of (event.writes?.entities ?? []).entries()) {
      if (!dataContract.entities[entityId]) {
        issues.push({
          path: ["events", eventId, "writes", "entities", index],
          message: 'La entidad "' + entityId + '" no existe en el contrato de datos.',
        });
      }
    }
    for (const [index, reference] of (event.writes?.fields ?? []).entries()) {
      const message = validateDataReference(reference, dataContract);
      if (message) {
        issues.push({
          path: ["events", eventId, "writes", "fields", index],
          message,
        });
      }
    }
  }

  return issues;
};

export function definePrototypeEventEngineContract(
  contract: PrototypeEventEngineContract,
): PrototypeEventEngineContract {
  return prototypeEventEngineContractSchema.parse(contract);
}
