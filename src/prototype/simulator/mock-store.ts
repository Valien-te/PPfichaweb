import type {
  JsonPrimitive,
  MockEntityRecord,
  PrototypeMockScenarios,
} from "./simulator-contract-schema";

export type PublishedEventHistoryItem = {
  publicationId: string;
  eventId: string;
  technicalId: string;
  occurredAt: string;
  status: "published";
};

export type PrototypeSimulatorState = {
  simulatorVersion: "1";
  datasetVersion: number;
  activeScenarioId: string;
  revision: number;
  entities: Record<string, MockEntityRecord[]>;
  entitySequences: Record<string, number>;
  publicationHistory: PublishedEventHistoryItem[];
};

export type SimulatorStorage = {
  read(): string | null;
  write(value: string): void;
  remove(): void;
};

export type PrototypeMockStore = {
  getSnapshot(): PrototypeSimulatorState;
  subscribe(listener: () => void): () => void;
  transact(operation: (draft: PrototypeSimulatorState) => void): PrototypeSimulatorState;
  switchScenario(scenarioId: string): void;
  resetScenario(): void;
  clearPersistence(): void;
};

type CreatePrototypeMockStoreOptions = {
  projectName: string;
  scenarios: PrototypeMockScenarios;
  storage?: SimulatorStorage;
  onHydrationWarning?: (message: string) => void;
};

const clone = <T>(value: T): T => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

const buildSequences = (entities: Record<string, MockEntityRecord[]>) => {
  const sequences: Record<string, number> = {};
  for (const [entityId, records] of Object.entries(entities)) {
    sequences[entityId] = records.length + 1;
  }
  return sequences;
};

const createStateFromScenario = (
  scenarios: PrototypeMockScenarios,
  scenarioId: string,
): PrototypeSimulatorState => {
  const scenario = scenarios.scenarios[scenarioId];
  if (!scenario) throw new Error('El escenario "' + scenarioId + '" no existe.');
  const entities = clone(scenario.entities);
  return {
    simulatorVersion: "1",
    datasetVersion: scenarios.datasetVersion,
    activeScenarioId: scenarioId,
    revision: 0,
    entities,
    entitySequences: buildSequences(entities),
    publicationHistory: [],
  };
};

const isPersistedStateCompatible = (
  value: unknown,
  scenarios: PrototypeMockScenarios,
): value is PrototypeSimulatorState => {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<PrototypeSimulatorState>;
  return (
    state.simulatorVersion === "1" &&
    state.datasetVersion === scenarios.datasetVersion &&
    typeof state.activeScenarioId === "string" &&
    Boolean(scenarios.scenarios[state.activeScenarioId]) &&
    typeof state.revision === "number" &&
    Boolean(state.entities && typeof state.entities === "object") &&
    Boolean(state.entitySequences && typeof state.entitySequences === "object") &&
    Array.isArray(state.publicationHistory)
  );
};

export const createMemorySimulatorStorage = (): SimulatorStorage => {
  let current: string | null = null;
  return {
    read: () => current,
    write: (value) => {
      current = value;
    },
    remove: () => {
      current = null;
    },
  };
};

export const createLocalStorageSimulatorStorage = (key: string): SimulatorStorage => {
  const memory = createMemorySimulatorStorage();
  const getLocalStorage = () => {
    try {
      return globalThis.localStorage;
    } catch {
      return undefined;
    }
  };

  return {
    read: () => {
      try {
        return getLocalStorage()?.getItem(key) ?? memory.read();
      } catch {
        return memory.read();
      }
    },
    write: (value) => {
      memory.write(value);
      try {
        getLocalStorage()?.setItem(key, value);
      } catch {
        // fallback en memoria
      }
    },
    remove: () => {
      memory.remove();
      try {
        getLocalStorage()?.removeItem(key);
      } catch {
        // fallback en memoria
      }
    },
  };
};

export const simulatorStorageKey = (projectName: string) =>
  "lexy:prototype:" + projectName + ":simulator:v1";

export const createPrototypeMockStore = (
  options: CreatePrototypeMockStoreOptions,
): PrototypeMockStore => {
  const storage =
    options.storage ?? createLocalStorageSimulatorStorage(simulatorStorageKey(options.projectName));
  const listeners = new Set<() => void>();

  const hydrate = () => {
    const persisted = storage.read();
    if (!persisted)
      return createStateFromScenario(options.scenarios, options.scenarios.defaultScenarioId);

    try {
      const parsed = JSON.parse(persisted) as unknown;
      if (isPersistedStateCompatible(parsed, options.scenarios)) return parsed;
      options.onHydrationWarning?.(
        "Estado persistido incompatible; se reinicia el simulador al escenario default.",
      );
    } catch {
      options.onHydrationWarning?.(
        "Estado persistido corrupto; se reinicia el simulador al escenario default.",
      );
    }
    return createStateFromScenario(options.scenarios, options.scenarios.defaultScenarioId);
  };

  let snapshot = hydrate();

  const persist = () => {
    storage.write(JSON.stringify(snapshot));
  };

  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    transact: (operation) => {
      const draft = clone(snapshot);
      operation(draft);
      draft.revision = snapshot.revision + 1;
      snapshot = draft;
      persist();
      notify();
      return snapshot;
    },
    switchScenario: (scenarioId) => {
      snapshot = createStateFromScenario(options.scenarios, scenarioId);
      persist();
      notify();
    },
    resetScenario: () => {
      snapshot = createStateFromScenario(options.scenarios, snapshot.activeScenarioId);
      persist();
      notify();
    },
    clearPersistence: () => {
      storage.remove();
    },
  };
};

export const findRecordById = (
  records: readonly MockEntityRecord[],
  fieldId: string,
  id: JsonPrimitive,
) => records.find((record) => record[fieldId] === id);
