import type { EventPublicationEnvelope } from "../event-engine/event-engine";
import { createPrototypeEventEngine } from "../event-engine/event-engine";
import { prototypeDataContract } from "../data-contract/prototype-data-contract";
import { dataLoadHandlers } from "./data-load-handlers";
import { eventHandlers } from "./event-handlers";
import { mockGenerationProfile } from "./mock-generation-profile";
import { createMockBackendExecutor } from "./mock-backend-executor";
import { createPrototypeMockStore, type PrototypeMockStore } from "./mock-store";
import { prototypeMockScenarios } from "./mock-scenarios";
import { projectionResolvers } from "./projection-resolvers";
import type {
  JsonPrimitive,
  MockEntityRecord,
  MockGenerationProfile,
  PrototypeMockScenarios,
} from "./simulator-contract-schema";

export type ProjectionResolverContext = {
  entities: Readonly<Record<string, readonly MockEntityRecord[]>>;
  getEntity(entityId: string): readonly MockEntityRecord[];
  getById(entityId: string, id: JsonPrimitive): MockEntityRecord | undefined;
  getRelated(relationId: string, sourceId: JsonPrimitive): readonly MockEntityRecord[];
};

export type ProjectionResolver = (context: ProjectionResolverContext, params?: unknown) => unknown;

export type ProjectionResolverMap = Record<string, ProjectionResolver>;

export type MockDataLoadHandlerContext = {
  params: unknown;
  signal?: AbortSignal;
  store: PrototypeMockStore;
  projections: {
    resolve(projectionId: string, params?: unknown): unknown;
  };
};

export type MockDataLoadHandler = (
  context: MockDataLoadHandlerContext,
) => unknown | Promise<unknown>;

export type MockDataLoadHandlerMap = Record<string, MockDataLoadHandler>;

export type MockEventHandlerContext = {
  draft: import("./mock-store").PrototypeSimulatorState;
  envelope: EventPublicationEnvelope;
  getById(entityId: string, id: JsonPrimitive): MockEntityRecord | undefined;
  nextEntityId(entityId: string): JsonPrimitive;
};

export type MockEventHandlerResult = {
  receipt?: unknown;
};

export type MockEventHandler = (context: MockEventHandlerContext) => MockEventHandlerResult | void;

export type MockEventHandlerMap = Record<string, MockEventHandler>;

export type PrototypeSimulator = {
  executor: ReturnType<typeof createMockBackendExecutor>;
  store: PrototypeMockStore;
  getActiveScenario(): PrototypeMockScenarios["scenarios"][string];
  listScenarios(): Array<{ id: string; name: string; description: string }>;
  switchScenario(scenarioId: string): void;
  reset(): void;
  clearPersistence(): void;
};

type CreatePrototypeSimulatorOptions = {
  profile: MockGenerationProfile;
  scenarios: PrototypeMockScenarios;
  projectionResolvers: ProjectionResolverMap;
  dataLoadHandlers: MockDataLoadHandlerMap;
  eventHandlers: MockEventHandlerMap;
};

export const createPrototypeSimulator = (
  options: CreatePrototypeSimulatorOptions,
): PrototypeSimulator => {
  const store = createPrototypeMockStore({
    projectName: prototypeDataContract.project.name,
    scenarios: options.scenarios,
    onHydrationWarning: (message) => {
      console.warn("[Lexy simulator] " + message);
    },
  });

  const executor = createMockBackendExecutor({
    profile: options.profile,
    scenarios: options.scenarios,
    store,
    projectionResolvers: options.projectionResolvers,
    dataLoadHandlers: options.dataLoadHandlers,
    eventHandlers: options.eventHandlers,
  });

  return {
    executor,
    store,
    getActiveScenario: () => options.scenarios.scenarios[store.getSnapshot().activeScenarioId],
    listScenarios: () =>
      Object.values(options.scenarios.scenarios).map((scenario) => ({
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
      })),
    switchScenario: (scenarioId) => store.switchScenario(scenarioId),
    reset: () => store.resetScenario(),
    clearPersistence: () => store.clearPersistence(),
  };
};

export const prototypeSimulator = createPrototypeSimulator({
  profile: mockGenerationProfile,
  scenarios: prototypeMockScenarios,
  projectionResolvers,
  dataLoadHandlers,
  eventHandlers,
});

export const prototypeEventEngine = createPrototypeEventEngine({
  executor: prototypeSimulator.executor,
});
