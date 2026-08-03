import { z } from "zod";

/**
 * Schemas runtime para params, payloads, responses y receipts del motor.
 *
 * Los contratos de Spec 2 referencian estas keys mediante schemaId. El agente
 * agrega schemas específicos cuando declara cargas o eventos concretos.
 */
export const unknownPayloadSchema = z.unknown();
export const emptyObjectSchema = z.object({}).strict();
export const unknownResponseSchema = z.unknown();
export const absentReceiptSchema = z.undefined().optional();

export const prototypePayloadSchemas = {
  unknown: unknownPayloadSchema,
  emptyObject: emptyObjectSchema,
  unknownResponse: unknownResponseSchema,
  absentReceipt: absentReceiptSchema,
} satisfies Record<string, z.ZodType>;

export type PrototypePayloadSchemaId = keyof typeof prototypePayloadSchemas;
