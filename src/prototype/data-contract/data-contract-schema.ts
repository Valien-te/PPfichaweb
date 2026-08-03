import { z } from "zod";

const camelCaseIdSchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, "Debe usar camelCase y comenzar con una letra minúscula.");

const nonEmptyTextSchema = z.string().trim().min(1, "No puede quedar vacío.");
const experienceLabelsSchema = z
  .array(nonEmptyTextSchema)
  .min(1, "Debe indicar al menos un uso dentro de la experiencia.");

export const dataOriginSchema = z.enum([
  "lexyConfirmed",
  "productAssumption",
  "generatedByUsability",
]);

export const technicalValidationStatusSchema = z.enum(["validated", "pendingTi", "rejected"]);

export const dataClassificationSchema = z.enum(["public", "internal", "sensitive", "restricted"]);

export const technicalValidationSchema = z
  .object({
    status: technicalValidationStatusSchema,
    note: nonEmptyTextSchema.optional(),
    validatedBy: nonEmptyTextSchema.optional(),
    validatedAt: z.string().datetime({ offset: true }).optional(),
    evidence: nonEmptyTextSchema.optional(),
  })
  .strict()
  .superRefine((validation, context) => {
    if (validation.status === "pendingTi" && !validation.note) {
      context.addIssue({
        code: "custom",
        path: ["note"],
        message: "Un pendiente de TI debe explicar qué necesita validarse.",
      });
    }

    if (validation.status === "validated") {
      if (!validation.validatedBy) {
        context.addIssue({
          code: "custom",
          path: ["validatedBy"],
          message: "Un dato validado debe indicar quién lo validó.",
        });
      }
      if (!validation.validatedAt) {
        context.addIssue({
          code: "custom",
          path: ["validatedAt"],
          message: "Un dato validado debe indicar cuándo fue validado.",
        });
      }
    }
  });

const backendReferenceSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
    "Las referencias de Lexy deben usar snake_case, por ejemplo cliente.rut_cliente.",
  );

export const sourceReferenceSchema = z
  .object({
    kind: z.enum(["lexyEntity", "lexyProjection", "api", "derived", "unknown"]),
    reference: nonEmptyTextSchema.optional(),
  })
  .strict()
  .superRefine((source, context) => {
    if ((source.kind === "lexyEntity" || source.kind === "lexyProjection") && !source.reference) {
      context.addIssue({
        code: "custom",
        path: ["reference"],
        message: "La fuente Lexy debe indicar su referencia en snake_case.",
      });
      return;
    }

    if (source.reference && (source.kind === "lexyEntity" || source.kind === "lexyProjection")) {
      const result = backendReferenceSchema.safeParse(source.reference);
      if (!result.success) {
        context.addIssue({
          code: "custom",
          path: ["reference"],
          message: result.error.issues[0]?.message ?? "Referencia backend inválida.",
        });
      }
    }
  });

const usageSchema = z
  .object({
    visible: z.boolean(),
    editable: z.boolean(),
    calculated: z.boolean(),
    technical: z.boolean(),
    filterable: z.boolean().optional(),
    sortable: z.boolean().optional(),
  })
  .strict();

const metadataSchema = z
  .object({
    origin: dataOriginSchema,
    source: sourceReferenceSchema,
    dataClassification: dataClassificationSchema,
    technicalValidation: technicalValidationSchema,
  })
  .strict();

const validateUsabilityEvidence = (
  value: {
    origin: z.infer<typeof dataOriginSchema>;
    technicalValidation: z.infer<typeof technicalValidationSchema>;
  },
  context: z.RefinementCtx,
) => {
  if (
    value.origin === "generatedByUsability" &&
    value.technicalValidation.status === "validated" &&
    !value.technicalValidation.evidence
  ) {
    context.addIssue({
      code: "custom",
      path: ["technicalValidation", "evidence"],
      message: "Un dato generado por usabilidad solo puede validarse con evidencia explícita.",
    });
  }
};

export const fieldSpecSchema = z
  .object({
    id: camelCaseIdSchema,
    productDescription: nonEmptyTextSchema,
    dataType: z.enum(["string", "number", "boolean", "date", "datetime", "enum", "identifier"]),
    required: z.boolean(),
    usage: usageSchema,
    usedIn: experienceLabelsSchema,
    enumValues: z.array(nonEmptyTextSchema).min(1).optional(),
    derivation: nonEmptyTextSchema.optional(),
  })
  .extend(metadataSchema.shape)
  .strict()
  .superRefine((field, context) => {
    validateUsabilityEvidence(field, context);

    if (field.dataType === "enum" && !field.enumValues) {
      context.addIssue({
        code: "custom",
        path: ["enumValues"],
        message: "Un campo enum debe declarar al menos un valor.",
      });
    }
    if (field.dataType !== "enum" && field.enumValues) {
      context.addIssue({
        code: "custom",
        path: ["enumValues"],
        message: "Solo los campos enum pueden declarar enumValues.",
      });
    }
    if ((field.usage.calculated || field.source.kind === "derived") && !field.derivation) {
      context.addIssue({
        code: "custom",
        path: ["derivation"],
        message: "Un dato calculado debe explicar su regla de derivación.",
      });
    }
  });

export const entityStateSpecSchema = z
  .object({
    id: camelCaseIdSchema,
    productDescription: nonEmptyTextSchema,
    activationCondition: nonEmptyTextSchema,
    visualImpact: nonEmptyTextSchema,
    usedIn: experienceLabelsSchema,
  })
  .extend(metadataSchema.shape)
  .strict()
  .superRefine(validateUsabilityEvidence);

export const entitySpecSchema = z
  .object({
    id: camelCaseIdSchema,
    productDescription: nonEmptyTextSchema,
    roleInExperience: nonEmptyTextSchema,
    usedIn: experienceLabelsSchema,
    fields: z.record(camelCaseIdSchema, fieldSpecSchema),
    states: z.array(entityStateSpecSchema).optional(),
  })
  .extend(metadataSchema.shape)
  .strict()
  .superRefine(validateUsabilityEvidence);

export const relationSpecSchema = z
  .object({
    id: camelCaseIdSchema,
    fromEntity: camelCaseIdSchema,
    toEntity: camelCaseIdSchema,
    cardinality: z.enum(["oneToOne", "oneToMany", "manyToMany"]),
    productDescription: nonEmptyTextSchema,
    requiredBy: experienceLabelsSchema,
    resolution: z.enum(["embedded", "queried", "derived", "unknown"]),
    derivation: nonEmptyTextSchema.optional(),
  })
  .extend(metadataSchema.shape)
  .strict()
  .superRefine((relation, context) => {
    validateUsabilityEvidence(relation, context);
    if (
      (relation.resolution === "derived" || relation.source.kind === "derived") &&
      !relation.derivation
    ) {
      context.addIssue({
        code: "custom",
        path: ["derivation"],
        message: "Una relación derivada debe explicar su regla de derivación.",
      });
    }
  });

export const projectionFieldSpecSchema = z
  .object({
    id: camelCaseIdSchema,
    source: z
      .string()
      .regex(
        /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/,
        "Debe referenciar un campo como entidad.campo usando camelCase.",
      ),
    required: z.boolean(),
  })
  .strict();

export const projectionSpecSchema = z
  .object({
    id: camelCaseIdSchema,
    productDescription: nonEmptyTextSchema,
    sourceEntities: experienceLabelsSchema,
    consumedBy: experienceLabelsSchema,
    fields: z.array(projectionFieldSpecSchema),
    derivation: nonEmptyTextSchema.optional(),
  })
  .extend(metadataSchema.shape)
  .strict()
  .superRefine((projection, context) => {
    validateUsabilityEvidence(projection, context);
    if (projection.source.kind === "derived" && !projection.derivation) {
      context.addIssue({
        code: "custom",
        path: ["derivation"],
        message: "Una proyección derivada debe explicar su regla de derivación.",
      });
    }
  });

const projectSchema = z
  .object({
    name: nonEmptyTextSchema,
    description: z.string().trim(),
  })
  .strict();

export const prototypeDataContractSchema = z
  .object({
    contractVersion: z.literal("1"),
    project: projectSchema,
    entities: z.record(camelCaseIdSchema, entitySpecSchema),
    relations: z.array(relationSpecSchema),
    projections: z.record(camelCaseIdSchema, projectionSpecSchema),
  })
  .strict()
  .superRefine((contract, context) => {
    for (const [entityKey, entity] of Object.entries(contract.entities)) {
      if (entityKey !== entity.id) {
        context.addIssue({
          code: "custom",
          path: ["entities", entityKey, "id"],
          message: 'El id "' + entity.id + '" debe coincidir con la key "' + entityKey + '".',
        });
      }

      for (const [fieldKey, field] of Object.entries(entity.fields)) {
        if (fieldKey !== field.id) {
          context.addIssue({
            code: "custom",
            path: ["entities", entityKey, "fields", fieldKey, "id"],
            message: 'El id "' + field.id + '" debe coincidir con la key "' + fieldKey + '".',
          });
        }
      }

      const stateIds = new Set<string>();
      for (const [stateIndex, state] of (entity.states ?? []).entries()) {
        if (stateIds.has(state.id)) {
          context.addIssue({
            code: "custom",
            path: ["entities", entityKey, "states", stateIndex, "id"],
            message: 'El estado "' + state.id + '" está declarado más de una vez.',
          });
        }
        stateIds.add(state.id);
      }
    }

    const relationIds = new Set<string>();
    for (const [relationIndex, relation] of contract.relations.entries()) {
      if (relationIds.has(relation.id)) {
        context.addIssue({
          code: "custom",
          path: ["relations", relationIndex, "id"],
          message: 'La relación "' + relation.id + '" está declarada más de una vez.',
        });
      }
      relationIds.add(relation.id);

      if (!contract.entities[relation.fromEntity]) {
        context.addIssue({
          code: "custom",
          path: ["relations", relationIndex, "fromEntity"],
          message: 'La entidad "' + relation.fromEntity + '" no existe.',
        });
      }
      if (!contract.entities[relation.toEntity]) {
        context.addIssue({
          code: "custom",
          path: ["relations", relationIndex, "toEntity"],
          message: 'La entidad "' + relation.toEntity + '" no existe.',
        });
      }
    }

    for (const [projectionKey, projection] of Object.entries(contract.projections)) {
      if (projectionKey !== projection.id) {
        context.addIssue({
          code: "custom",
          path: ["projections", projectionKey, "id"],
          message:
            'El id "' + projection.id + '" debe coincidir con la key "' + projectionKey + '".',
        });
      }

      for (const [sourceIndex, entityId] of projection.sourceEntities.entries()) {
        if (!contract.entities[entityId]) {
          context.addIssue({
            code: "custom",
            path: ["projections", projectionKey, "sourceEntities", sourceIndex],
            message: 'La entidad "' + entityId + '" no existe.',
          });
        }
      }

      const projectionFieldIds = new Set<string>();
      for (const [fieldIndex, field] of projection.fields.entries()) {
        if (projectionFieldIds.has(field.id)) {
          context.addIssue({
            code: "custom",
            path: ["projections", projectionKey, "fields", fieldIndex, "id"],
            message: 'El campo proyectado "' + field.id + '" está declarado más de una vez.',
          });
        }
        projectionFieldIds.add(field.id);

        const [entityId, fieldId] = field.source.split(".");
        const entity = contract.entities[entityId];
        if (!entity) {
          context.addIssue({
            code: "custom",
            path: ["projections", projectionKey, "fields", fieldIndex, "source"],
            message: 'La referencia "' + field.source + '" apunta a una entidad que no existe.',
          });
          continue;
        }
        if (!entity.fields[fieldId]) {
          context.addIssue({
            code: "custom",
            path: ["projections", projectionKey, "fields", fieldIndex, "source"],
            message: 'La referencia "' + field.source + '" apunta a un campo que no existe.',
          });
        }
        if (!projection.sourceEntities.includes(entityId)) {
          context.addIssue({
            code: "custom",
            path: ["projections", projectionKey, "fields", fieldIndex, "source"],
            message: 'La entidad "' + entityId + '" debe declararse también en sourceEntities.',
          });
        }
      }
    }
  });

export type DataOrigin = z.infer<typeof dataOriginSchema>;
export type TechnicalValidationStatus = z.infer<typeof technicalValidationStatusSchema>;
export type TechnicalValidation = z.infer<typeof technicalValidationSchema>;
export type SourceReference = z.infer<typeof sourceReferenceSchema>;
export type FieldSpec = z.infer<typeof fieldSpecSchema>;
export type EntityStateSpec = z.infer<typeof entityStateSpecSchema>;
export type EntitySpec = z.infer<typeof entitySpecSchema>;
export type RelationSpec = z.infer<typeof relationSpecSchema>;
export type ProjectionSpec = z.infer<typeof projectionSpecSchema>;
export type PrototypeDataContract = z.infer<typeof prototypeDataContractSchema>;

export function definePrototypeDataContract(
  contract: PrototypeDataContract,
): PrototypeDataContract {
  return prototypeDataContractSchema.parse(contract);
}
