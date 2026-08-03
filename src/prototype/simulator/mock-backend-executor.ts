import type {
  EventPublicationEnvelope,
  PrototypeBackendExecutor,
} from "../event-engine/event-engine";
import type {
  JsonPrimitive,
  MockEntityRecord,
  MockGenerationProfile,
  MockOperationError,
  PrototypeMockScenarios,
} from "./simulator-contract-schema";
import {
  findRecordById,
  type PrototypeMockStore,
  type PrototypeSimulatorState,
} from "./mock-store";
import type {
  MockDataLoadHandlerMap,
  MockEventHandlerMap,
  ProjectionResolverContext,
  ProjectionResolverMap,
} from "./prototype-simulator";

export class MockBackendError extends Error {
  code: string;
  recoverable: boolean;

  constructor(error: MockOperationError) {
    super(error.message);
    this.name = "MockBackendError";
    this.code = error.code;
    this.recoverable = error.recoverable;
  }
}

type CreateMockBackendExecutorOptions = {
  profile: MockGenerationProfile;
  scenarios: PrototypeMockScenarios;
  store: PrototypeMockStore;
  projectionResolvers: ProjectionResolverMap;
  dataLoadHandlers: MockDataLoadHandlerMap;
  eventHandlers: MockEventHandlerMap;
};

const delay = (latencyMs: number | undefined, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (!latencyMs) {
      resolve();
      return;
    }
    if (signal?.aborted) {
      reject(new DOMException("Operación abortada.", "AbortError"));
      return;
    }
    const timeout = globalThis.setTimeout(resolve, latencyMs);
    signal?.addEventListener(
      "abort",
      () => {
        globalThis.clearTimeout(timeout);
        reject(new DOMException("Operación abortada.", "AbortError"));
      },
      { once: true },
    );
  });

const splitReference = (reference: string) => {
  const [entityId, fieldId] = reference.split(".");
  return { entityId, fieldId };
};

const getEntityKeyField = (profile: MockGenerationProfile, entityId: string) => {
  const field = profile.entityKeys[entityId]?.field;
  return field ? splitReference(field).fieldId : "id";
};

const createProjectionContext = (
  profile: MockGenerationProfile,
  state: PrototypeSimulatorState,
): ProjectionResolverContext => ({
  entities: state.entities,
  getEntity: (entityId) => state.entities[entityId] ?? [],
  getById: (entityId, id) =>
    findRecordById(state.entities[entityId] ?? [], getEntityKeyField(profile, entityId), id),
  getRelated: (relationId, sourceId) => {
    const binding = Object.values(profile.relationBindings).find(
      (candidate) => candidate.relation === relationId,
    );
    if (!binding) return [];
    const target = splitReference(binding.toField);
    return (state.entities[target.entityId] ?? []).filter(
      (record) => record[target.fieldId] === sourceId,
    );
  },
});

const nextEntityId = (
  profile: MockGenerationProfile,
  draft: PrototypeSimulatorState,
  entityId: string,
): JsonPrimitive => {
  const keyField = getEntityKeyField(profile, entityId);
  const records = draft.entities[entityId] ?? [];
  const numericIds = records
    .map((record) => record[keyField])
    .filter((value): value is number => typeof value === "number");
  if (numericIds.length > 0) return Math.max(...numericIds) + 1;

  const sequence = draft.entitySequences[entityId] ?? records.length + 1;
  draft.entitySequences[entityId] = sequence + 1;
  return entityId + "-" + sequence;
};

export const createMockBackendExecutor = (
  options: CreateMockBackendExecutorOptions,
): PrototypeBackendExecutor => ({
  async loadData(input) {
    const state = options.store.getSnapshot();
    const scenario = options.scenarios.scenarios[state.activeScenarioId];
    const behavior = scenario.behaviors?.dataLoads?.[input.loadId];
    await delay(behavior?.latencyMs, input.signal);

    if (behavior?.outcome === "error" && behavior.error) throw new MockBackendError(behavior.error);
    if (behavior?.outcome === "empty") return [];

    const handler = options.dataLoadHandlers[input.loadId];
    if (!handler) throw new Error('Falta handler para la carga "' + input.loadId + '".');

    return handler({
      params: input.params,
      signal: input.signal,
      store: options.store,
      projections: {
        resolve: (projectionId, params) => {
          const resolver = options.projectionResolvers[projectionId];
          if (!resolver)
            throw new Error('Falta resolver para la proyección "' + projectionId + '".');
          return resolver(
            createProjectionContext(options.profile, options.store.getSnapshot()),
            params,
          );
        },
      },
    });
  },

  async publishEvent(input) {
    const state = options.store.getSnapshot();
    const scenario = options.scenarios.scenarios[state.activeScenarioId];
    const behavior = scenario.behaviors?.events?.[input.eventId];
    await delay(behavior?.latencyMs);

    if (behavior?.outcome === "error" && behavior.error) throw new MockBackendError(behavior.error);

    const handler = options.eventHandlers[input.eventId];
    if (!handler) throw new Error('Falta handler para el evento "' + input.eventId + '".');

    let receipt: unknown;
    options.store.transact((draft) => {
      const getById = (entityId: string, id: JsonPrimitive): MockEntityRecord | undefined =>
        findRecordById(
          draft.entities[entityId] ?? [],
          getEntityKeyField(options.profile, entityId),
          id,
        );

      const result = handler({
        draft,
        envelope: input.envelope as EventPublicationEnvelope,
        getById,
        nextEntityId: (entityId) => nextEntityId(options.profile, draft, entityId),
      });
      receipt = result?.receipt;
      draft.publicationHistory.push({
        publicationId: input.envelope.publicationId,
        eventId: input.eventId,
        technicalId: input.envelope.technicalId,
        occurredAt: input.envelope.occurredAt,
        status: "published",
      });
    });

    return receipt === undefined ? {} : { receipt };
  },
});
