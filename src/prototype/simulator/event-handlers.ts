import type { MockEventHandlerMap } from "./prototype-simulator";

export const eventHandlers: MockEventHandlerMap = {
  fichaEnviada: () => ({
    receipt: { fichaEnviada: true },
  }),
  documentoSubido: () => ({
    receipt: { estadoRevision: "pendiente" },
  }),
};
