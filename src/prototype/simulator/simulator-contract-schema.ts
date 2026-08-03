import { z } from "zod";

const camelCaseIdSchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, "Debe usar camelCase y comenzar con una letra minúscula.");

const dataReferenceSchema = z
  .string()
  .regex(
    /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/,
    "Debe referenciar un campo como entidad.campo usando camelCase.",
  );

const nonEmptyTextSchema = z.string().trim().min(1, "No puede quedar vacío.");

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type MockEntityRecord = Record<string, JsonValue>;

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const mockEntityRecordSchema = z.record(z.string(), jsonValueSchema);

export const mockSemanticSchema = z.enum([
  "personName",
  "rutCl",
  "mobilePhoneCl",
  "landlinePhoneCl",
  "email",
  "clpAmount",
  "dateCl",
  "datetimeCl",
  "regionCl",
  "communeCl",
  "addressCl",
  "companyNameCl",
  "legalCaseReferenceCl",
  "freeText",
  "custom",
]);

export const fieldMockHintSchema = z
  .object({
    semantic: mockSemanticSchema,
    description: nonEmptyTextSchema.optional(),
    examples: z.array(nonEmptyTextSchema).optional(),
    constraints: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: nonEmptyTextSchema.optional(),
        allowedValues: z.array(nonEmptyTextSchema).optional(),
      })
      .strict()
      .optional(),
    rutValidation: z.enum(["formatOnly", "validChecksum"]).optional(),
  })
  .strict();

export const mockGenerationProfileSchema = z
  .object({
    profileVersion: z.literal("1"),
    locale: z
      .object({
        language: z.literal("es"),
        locale: z.literal("es-CL"),
        country: z.literal("CL"),
        timezone: z.literal("America/Santiago"),
        currency: z.literal("CLP"),
        dateStorage: z.literal("iso8601"),
        dateDisplay: z.literal("dd-MM-yyyy"),
        timeDisplay: z.literal("24h"),
      })
      .strict(),
    safety: z
      .object({
        syntheticOnly: z.literal(true),
        allowProductionImports: z.literal(false),
        externalUse: z.literal(false),
        emailDomain: z.literal("example.com"),
      })
      .strict(),
    entityKeys: z.record(
      camelCaseIdSchema,
      z
        .object({
          field: dataReferenceSchema,
        })
        .strict(),
    ),
    relationBindings: z.record(
      camelCaseIdSchema,
      z
        .object({
          relation: camelCaseIdSchema,
          fromField: dataReferenceSchema,
          toField: dataReferenceSchema,
        })
        .strict(),
    ),
    fieldHints: z.record(dataReferenceSchema, fieldMockHintSchema),
  })
  .strict();

export const mockOperationErrorSchema = z
  .object({
    code: camelCaseIdSchema,
    message: nonEmptyTextSchema,
    recoverable: z.boolean(),
  })
  .strict();

export const mockDataLoadBehaviorSchema = z
  .object({
    latencyMs: z.number().int().min(0).optional(),
    outcome: z.enum(["normal", "empty", "error"]).optional(),
    error: mockOperationErrorSchema.optional(),
  })
  .strict()
  .superRefine((behavior, context) => {
    const outcome = behavior.outcome ?? "normal";
    if (outcome === "error" && !behavior.error) {
      context.addIssue({
        code: "custom",
        path: ["error"],
        message: "Un behavior error debe declarar el error controlado.",
      });
    }
    if (outcome !== "error" && behavior.error) {
      context.addIssue({
        code: "custom",
        path: ["error"],
        message: "Solo un behavior error puede declarar error.",
      });
    }
  });

export const mockEventBehaviorSchema = z
  .object({
    latencyMs: z.number().int().min(0).optional(),
    outcome: z.enum(["normal", "error"]).optional(),
    error: mockOperationErrorSchema.optional(),
  })
  .strict()
  .superRefine((behavior, context) => {
    const outcome = behavior.outcome ?? "normal";
    if (outcome === "error" && !behavior.error) {
      context.addIssue({
        code: "custom",
        path: ["error"],
        message: "Un behavior error debe declarar el error controlado.",
      });
    }
    if (outcome !== "error" && behavior.error) {
      context.addIssue({
        code: "custom",
        path: ["error"],
        message: "Solo un behavior error puede declarar error.",
      });
    }
  });

export const mockScenarioSchema = z
  .object({
    id: camelCaseIdSchema,
    name: nonEmptyTextSchema,
    description: nonEmptyTextSchema,
    entities: z.record(camelCaseIdSchema, z.array(mockEntityRecordSchema)),
    behaviors: z
      .object({
        dataLoads: z.record(camelCaseIdSchema, mockDataLoadBehaviorSchema).optional(),
        events: z.record(camelCaseIdSchema, mockEventBehaviorSchema).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const prototypeMockScenariosSchema = z
  .object({
    scenariosVersion: z.literal("1"),
    datasetVersion: z.number().int().positive(),
    defaultScenarioId: camelCaseIdSchema,
    scenarios: z.record(camelCaseIdSchema, mockScenarioSchema),
  })
  .strict()
  .superRefine((catalog, context) => {
    if (!catalog.scenarios[catalog.defaultScenarioId]) {
      context.addIssue({
        code: "custom",
        path: ["defaultScenarioId"],
        message: 'El escenario default "' + catalog.defaultScenarioId + '" no existe.',
      });
    }

    for (const [scenarioKey, scenario] of Object.entries(catalog.scenarios)) {
      if (scenarioKey !== scenario.id) {
        context.addIssue({
          code: "custom",
          path: ["scenarios", scenarioKey, "id"],
          message: 'El id "' + scenario.id + '" debe coincidir con la key "' + scenarioKey + '".',
        });
      }
    }
  });

export type MockSemantic = z.infer<typeof mockSemanticSchema>;
export type FieldMockHint = z.infer<typeof fieldMockHintSchema>;
export type MockGenerationProfile = z.infer<typeof mockGenerationProfileSchema>;
export type MockOperationError = z.infer<typeof mockOperationErrorSchema>;
export type MockDataLoadBehavior = z.infer<typeof mockDataLoadBehaviorSchema>;
export type MockEventBehavior = z.infer<typeof mockEventBehaviorSchema>;
export type MockScenario = z.infer<typeof mockScenarioSchema>;
export type PrototypeMockScenarios = z.infer<typeof prototypeMockScenariosSchema>;

export type SimulatorValidationIssue = {
  path: Array<string | number>;
  message: string;
};

type DataContractFieldLike = {
  dataType: "string" | "number" | "boolean" | "date" | "datetime" | "enum" | "identifier";
  required: boolean;
  enumValues?: string[];
};

type DataContractLike = {
  entities: Record<
    string,
    {
      fields: Record<string, DataContractFieldLike>;
    }
  >;
  relations: Array<{ id: string; fromEntity: string; toEntity: string }>;
  projections: Record<string, unknown>;
};

type EventEngineContractLike = {
  dataLoads: Record<string, unknown>;
  events: Record<string, unknown>;
};

const splitReference = (reference: string) => {
  const [entityId, fieldId] = reference.split(".");
  return { entityId, fieldId };
};

const getField = (dataContract: DataContractLike, reference: string) => {
  const { entityId, fieldId } = splitReference(reference);
  return {
    entityId,
    fieldId,
    entity: dataContract.entities[entityId],
    field: dataContract.entities[entityId]?.fields[fieldId],
  };
};

const isSemanticCompatible = (semantic: MockSemantic, field: DataContractFieldLike): boolean => {
  if (semantic === "custom") return true;
  if (semantic === "clpAmount") return field.dataType === "number";
  if (semantic === "dateCl") return field.dataType === "date";
  if (semantic === "datetimeCl") return field.dataType === "datetime";
  if (field.dataType === "enum") return ["regionCl", "communeCl", "custom"].includes(semantic);
  return ["string", "identifier"].includes(field.dataType);
};

const rutFormat = /^[0-9]{7,8}-[0-9K]$/;

const isValidRutChecksum = (rut: string) => {
  if (!rutFormat.test(rut)) return false;
  const [body, verifier] = rut.split("-");
  let sum = 0;
  let multiplier = 2;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const result = 11 - (sum % 11);
  const expected = result === 11 ? "0" : result === 10 ? "K" : String(result);
  return verifier === expected;
};

const mobilePhoneFormat = /^\+56 9 [0-9]{4} [0-9]{4}$/;
const landlinePhoneFormat = /^\+56 [2-9] [0-9]{4} [0-9]{4}$/;
const isoDateFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const datetimeWithOffsetFormat =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{3})?(?:Z|[+-][0-9]{2}:[0-9]{2})$/;
const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const secretLikeFormat =
  /(sk-[a-z0-9_-]{12,}|ghp_[a-z0-9_]{12,}|api[_-]?key|secret|token|password|BEGIN PRIVATE KEY)/i;

const validateChileanValue = (input: {
  value: JsonValue;
  hint: FieldMockHint;
  emailDomain: string;
}): string | null => {
  const { value, hint, emailDomain } = input;
  if (value === null) return null;

  if (hint.semantic === "rutCl") {
    if (typeof value !== "string" || !rutFormat.test(value)) {
      return "El RUT debe usar formato 12345678-9 y K mayúscula.";
    }
    if (hint.rutValidation === "validChecksum" && !isValidRutChecksum(value)) {
      return "El RUT no cumple el dígito verificador módulo 11.";
    }
  }

  if (
    hint.semantic === "mobilePhoneCl" &&
    (typeof value !== "string" || !mobilePhoneFormat.test(value))
  ) {
    return "El móvil chileno debe usar formato +56 9 XXXX XXXX.";
  }

  if (
    hint.semantic === "landlinePhoneCl" &&
    (typeof value !== "string" || !landlinePhoneFormat.test(value))
  ) {
    return "El teléfono fijo chileno debe usar formato +56 X XXXX XXXX.";
  }

  if (hint.semantic === "dateCl" && (typeof value !== "string" || !isoDateFormat.test(value))) {
    return "La fecha de storage debe usar ISO YYYY-MM-DD.";
  }

  if (
    hint.semantic === "datetimeCl" &&
    (typeof value !== "string" || !datetimeWithOffsetFormat.test(value))
  ) {
    return "El datetime debe usar ISO 8601 con offset o Z.";
  }

  if (hint.semantic === "clpAmount" && (!Number.isInteger(value) || typeof value !== "number")) {
    return "Los montos CLP deben almacenarse como enteros sin decimales.";
  }

  if (hint.semantic === "email") {
    if (typeof value !== "string" || !emailFormat.test(value)) {
      return "El correo debe tener formato válido.";
    }
    if (!value.endsWith("@" + emailDomain)) {
      return 'Los correos mock deben usar el dominio "' + emailDomain + '".';
    }
  }

  return null;
};

const validateValueType = (field: DataContractFieldLike, value: JsonValue): string | null => {
  if (value === null) return null;
  if (field.dataType === "number" && typeof value !== "number") return "Debe ser number.";
  if (field.dataType === "boolean" && typeof value !== "boolean") return "Debe ser boolean.";
  if (
    ["string", "identifier", "date", "datetime", "enum"].includes(field.dataType) &&
    typeof value !== "string"
  ) {
    return "Debe ser string.";
  }
  if (field.dataType === "date" && typeof value === "string" && !isoDateFormat.test(value)) {
    return "Debe usar fecha ISO YYYY-MM-DD.";
  }
  if (
    field.dataType === "datetime" &&
    typeof value === "string" &&
    !datetimeWithOffsetFormat.test(value)
  ) {
    return "Debe usar datetime ISO 8601 con offset o Z.";
  }
  if (
    field.dataType === "enum" &&
    typeof value === "string" &&
    !field.enumValues?.includes(value)
  ) {
    return 'El valor "' + value + '" no existe en enumValues.';
  }
  return null;
};

const visitStringValues = (value: JsonValue, visitor: (text: string) => void): void => {
  if (typeof value === "string") {
    visitor(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) visitStringValues(item, visitor);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) visitStringValues(item, visitor);
  }
};

export const validateMockProfileReferences = (input: {
  profile: MockGenerationProfile;
  dataContract: DataContractLike;
}): SimulatorValidationIssue[] => {
  const issues: SimulatorValidationIssue[] = [];
  const { profile, dataContract } = input;

  for (const [entityId, binding] of Object.entries(profile.entityKeys)) {
    const { entityId: fieldEntityId, fieldId, field } = getField(dataContract, binding.field);
    if (!dataContract.entities[entityId]) {
      issues.push({
        path: ["entityKeys", entityId],
        message: 'La entidad "' + entityId + '" no existe en la Spec 1.',
      });
    }
    if (fieldEntityId !== entityId) {
      issues.push({
        path: ["entityKeys", entityId, "field"],
        message: "La key de entidad debe apuntar a un campo de la misma entidad.",
      });
    }
    if (!field) {
      issues.push({
        path: ["entityKeys", entityId, "field"],
        message: 'El campo "' + fieldEntityId + "." + fieldId + '" no existe.',
      });
    } else if (!["identifier", "string", "number"].includes(field.dataType)) {
      issues.push({
        path: ["entityKeys", entityId, "field"],
        message: "La key debe ser identifier, string o number.",
      });
    }
  }

  for (const [bindingId, binding] of Object.entries(profile.relationBindings)) {
    const relation = dataContract.relations.find((candidate) => candidate.id === binding.relation);
    if (!relation) {
      issues.push({
        path: ["relationBindings", bindingId, "relation"],
        message: 'La relación "' + binding.relation + '" no existe en la Spec 1.',
      });
    }
    for (const key of ["fromField", "toField"] as const) {
      const { entityId, fieldId, field } = getField(dataContract, binding[key]);
      if (!field) {
        issues.push({
          path: ["relationBindings", bindingId, key],
          message: 'El campo "' + entityId + "." + fieldId + '" no existe.',
        });
      }
    }
  }

  for (const [reference, hint] of Object.entries(profile.fieldHints)) {
    const { entityId, fieldId, field } = getField(dataContract, reference);
    if (!field) {
      issues.push({
        path: ["fieldHints", reference],
        message: 'El campo "' + entityId + "." + fieldId + '" no existe.',
      });
      continue;
    }
    if (!isSemanticCompatible(hint.semantic, field)) {
      issues.push({
        path: ["fieldHints", reference, "semantic"],
        message:
          'La semántica "' + hint.semantic + '" no es compatible con ' + field.dataType + ".",
      });
    }
    if (field.dataType === "enum" && hint.constraints?.allowedValues) {
      for (const value of hint.constraints.allowedValues) {
        if (!field.enumValues?.includes(value)) {
          issues.push({
            path: ["fieldHints", reference, "constraints", "allowedValues"],
            message: 'El valor "' + value + '" no existe en enumValues.',
          });
        }
      }
    }
  }

  return issues;
};

export const validateMockScenarios = (input: {
  profile: MockGenerationProfile;
  scenarios: PrototypeMockScenarios;
  dataContract: DataContractLike;
  eventEngineContract: EventEngineContractLike;
}): SimulatorValidationIssue[] => {
  const issues: SimulatorValidationIssue[] = [];
  const { profile, scenarios, dataContract, eventEngineContract } = input;

  for (const [scenarioId, scenario] of Object.entries(scenarios.scenarios)) {
    for (const [entityId, records] of Object.entries(scenario.entities)) {
      const entity = dataContract.entities[entityId];
      if (!entity) {
        issues.push({
          path: ["scenarios", scenarioId, "entities", entityId],
          message: 'La entidad "' + entityId + '" no existe en la Spec 1.',
        });
        continue;
      }

      const keyBinding = profile.entityKeys[entityId];
      const seenKeys = new Set<JsonValue>();
      for (const [recordIndex, record] of records.entries()) {
        for (const fieldKey of Object.keys(record)) {
          if (!entity.fields[fieldKey]) {
            issues.push({
              path: ["scenarios", scenarioId, "entities", entityId, recordIndex, fieldKey],
              message: 'El campo "' + fieldKey + '" no existe en la entidad "' + entityId + '".',
            });
          }
        }

        for (const [fieldKey, field] of Object.entries(entity.fields)) {
          const value = record[fieldKey];
          if (field.required && value === undefined) {
            issues.push({
              path: ["scenarios", scenarioId, "entities", entityId, recordIndex, fieldKey],
              message: "El campo requerido está ausente.",
            });
            continue;
          }
          if (value !== undefined) {
            const typeMessage = validateValueType(field, value);
            if (typeMessage) {
              issues.push({
                path: ["scenarios", scenarioId, "entities", entityId, recordIndex, fieldKey],
                message: typeMessage,
              });
            }

            const hint = profile.fieldHints[entityId + "." + fieldKey];
            if (hint) {
              const chileMessage = validateChileanValue({
                value,
                hint,
                emailDomain: profile.safety.emailDomain,
              });
              if (chileMessage) {
                issues.push({
                  path: ["scenarios", scenarioId, "entities", entityId, recordIndex, fieldKey],
                  message: chileMessage,
                });
              }
            }

            visitStringValues(value, (text) => {
              if (emailFormat.test(text) && !text.endsWith("@" + profile.safety.emailDomain)) {
                issues.push({
                  path: ["scenarios", scenarioId, "entities", entityId, recordIndex, fieldKey],
                  message:
                    'Los correos mock deben usar el dominio "' + profile.safety.emailDomain + '".',
                });
              }
              if (secretLikeFormat.test(text)) {
                issues.push({
                  path: ["scenarios", scenarioId, "entities", entityId, recordIndex, fieldKey],
                  message: "El valor parece contener un secreto, token o credencial.",
                });
              }
            });
          }
        }

        if (keyBinding) {
          const { fieldId } = splitReference(keyBinding.field);
          const keyValue = record[fieldId];
          if (keyValue !== undefined) {
            if (seenKeys.has(keyValue)) {
              issues.push({
                path: ["scenarios", scenarioId, "entities", entityId, recordIndex, fieldId],
                message: 'La key "' + String(keyValue) + '" está duplicada.',
              });
            }
            seenKeys.add(keyValue);
          }
        }
      }
    }

    for (const [bindingId, binding] of Object.entries(profile.relationBindings)) {
      const from = splitReference(binding.fromField);
      const to = splitReference(binding.toField);
      const fromRecords = scenario.entities[from.entityId] ?? [];
      const toRecords = scenario.entities[to.entityId] ?? [];
      const targetValues = new Set(toRecords.map((record) => record[to.fieldId]));

      for (const [recordIndex, record] of fromRecords.entries()) {
        const value = record[from.fieldId];
        if (value !== undefined && value !== null && !targetValues.has(value)) {
          issues.push({
            path: ["scenarios", scenarioId, "entities", from.entityId, recordIndex, from.fieldId],
            message:
              'Referencia "' +
              String(value) +
              '" inexistente para relationBinding "' +
              bindingId +
              '".',
          });
        }
      }
    }

    for (const [loadId, behavior] of Object.entries(scenario.behaviors?.dataLoads ?? {})) {
      if (!eventEngineContract.dataLoads[loadId]) {
        issues.push({
          path: ["scenarios", scenarioId, "behaviors", "dataLoads", loadId],
          message: 'La carga "' + loadId + '" no existe en la Spec 2.',
        });
      }
      if ((behavior.outcome ?? "normal") === "empty" && behavior.error) {
        issues.push({
          path: ["scenarios", scenarioId, "behaviors", "dataLoads", loadId, "error"],
          message: "El outcome empty no puede incluir error.",
        });
      }
    }

    for (const eventId of Object.keys(scenario.behaviors?.events ?? {})) {
      if (!eventEngineContract.events[eventId]) {
        issues.push({
          path: ["scenarios", scenarioId, "behaviors", "events", eventId],
          message: 'El evento "' + eventId + '" no existe en la Spec 2.',
        });
      }
    }
  }

  return issues;
};

export function defineMockGenerationProfile(profile: MockGenerationProfile): MockGenerationProfile {
  return mockGenerationProfileSchema.parse(profile);
}

export function definePrototypeMockScenarios(
  scenarios: PrototypeMockScenarios,
): PrototypeMockScenarios {
  return prototypeMockScenariosSchema.parse(scenarios);
}
