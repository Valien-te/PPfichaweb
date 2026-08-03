import { z } from "zod";

import { prototypeEventEngineContract } from "./prototype-event-engine-contract";
import { prototypePayloadSchemas } from "./payload-schema";
import type { PrototypeEventEngineContract } from "./event-engine-contract-schema";

export type DataLoadInput = {
  loadId: string;
  triggerId?: string;
  params?: unknown;
  signal?: AbortSignal;
};

export type PublishEventInput = {
  eventId: string;
  triggerId?: string;
  payload?: unknown;
};

export type EventPublicationEnvelope = {
  technicalId: string;
  occurredAt: string;
  publicationId: string;
  payload: unknown;
};

export type PublishedEventResult = {
  status: "published";
  label: "Evento publicado";
  eventId: string;
  technicalId: string;
  occurredAt: string;
  publicationId: string;
  receipt?: unknown;
};

export type PrototypeBackendExecutor = {
  loadData(input: {
    loadId: string;
    triggerId?: string;
    params: unknown;
    signal?: AbortSignal;
  }): Promise<unknown>;
  publishEvent(input: {
    eventId: string;
    triggerId?: string;
    envelope: EventPublicationEnvelope;
  }): Promise<{ receipt?: unknown } | void>;
};

type PrototypeEventEngineOptions = {
  contract?: PrototypeEventEngineContract;
  payloadSchemas?: Record<string, z.ZodType>;
  executor: PrototypeBackendExecutor;
  clock?: () => Date;
  publicationId?: () => string;
};

const createDefaultPublicationId = () =>
  "pub_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);

const parseWithSchema = (schema: z.ZodType | undefined, value: unknown, label: string) => {
  if (!schema) return value;
  const result = schema.safeParse(value);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => (issue.path.length > 0 ? issue.path.join(".") + ": " : "") + issue.message)
      .join("; ");
    throw new Error(label + " inválido: " + message);
  }
  return result.data;
};

export const createPrototypeEventEngine = (options: PrototypeEventEngineOptions) => {
  const contract = options.contract ?? prototypeEventEngineContract;
  const payloadSchemas: Record<string, z.ZodType> =
    options.payloadSchemas ?? prototypePayloadSchemas;
  const clock = options.clock ?? (() => new Date());
  const publicationId = options.publicationId ?? createDefaultPublicationId;

  return {
    async loadData(input: DataLoadInput): Promise<unknown> {
      const load = contract.dataLoads[input.loadId];
      if (!load) throw new Error('La carga de datos "' + input.loadId + '" no está declarada.');

      const params = parseWithSchema(
        load.paramsSchema ? payloadSchemas[load.paramsSchema.schemaId] : undefined,
        input.params,
        'Params de la carga "' + input.loadId + '"',
      );

      const response = await options.executor.loadData({
        loadId: input.loadId,
        triggerId: input.triggerId,
        params,
        signal: input.signal,
      });

      return parseWithSchema(
        load.responseSchema ? payloadSchemas[load.responseSchema.schemaId] : undefined,
        response,
        'Response de la carga "' + input.loadId + '"',
      );
    },

    async publishEvent(input: PublishEventInput): Promise<PublishedEventResult> {
      const event = contract.events[input.eventId];
      if (!event) throw new Error('El evento publicado "' + input.eventId + '" no está declarado.');

      const payload = parseWithSchema(
        event.payloadSchema ? payloadSchemas[event.payloadSchema.schemaId] : undefined,
        input.payload,
        'Payload del evento "' + input.eventId + '"',
      );

      const envelope: EventPublicationEnvelope = {
        technicalId: event.technicalId,
        occurredAt: clock().toISOString(),
        publicationId: publicationId(),
        payload,
      };

      const executorResult = await options.executor.publishEvent({
        eventId: input.eventId,
        triggerId: input.triggerId,
        envelope,
      });

      const receipt = parseWithSchema(
        event.receiptSchema ? payloadSchemas[event.receiptSchema.schemaId] : undefined,
        executorResult?.receipt,
        'Receipt del evento "' + input.eventId + '"',
      );

      return {
        status: "published",
        label: "Evento publicado",
        eventId: input.eventId,
        technicalId: event.technicalId,
        occurredAt: envelope.occurredAt,
        publicationId: envelope.publicationId,
        ...(receipt === undefined ? {} : { receipt }),
      };
    },
  };
};
