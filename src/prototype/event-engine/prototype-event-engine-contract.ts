import { definePrototypeEventEngineContract } from "./event-engine-contract-schema";

/**
 * Catálogo de comunicaciones externas del frontend.
 *
 * - dataLoads: lecturas remotas para alimentar la UI.
 * - events: escrituras publicadas como hechos Lexy.
 *
 * Las interacciones locales no se declaran acá.
 */
export const prototypeEventEngineContract = definePrototypeEventEngineContract({
  contractVersion: "1",
  dataLoads: {},
  events: {
    fichaEnviada: {
      id: "fichaEnviada",
      name: "Ficha enviada",
      technicalId: "Gestion_Ficha-FichaEnviada_V1",
      productDescription:
        "Registra el envío de los antecedentes de una gestión y bloquea su edición para el cliente.",
      trigger: {
        label: "La persona presiona Enviar ficha en el último paso de datos",
        source: "userAction",
      },
      payloadSchema: { schemaId: "unknown" },
      receiptSchema: { schemaId: "unknownResponse" },
      writes: {
        entities: ["gestion"],
        fields: ["gestion.fichaEnviada", "gestion.estadoGestion"],
      },
      visibleResult:
        "Bloquea los campos de la ficha y permite recorrerlos en modo de solo lectura.",
      pendingTi:
        "TI debe definir el payload, la autorización y el mecanismo para habilitar correcciones posteriores si el equipo legal las solicita.",
    },
    documentoSubido: {
      id: "documentoSubido",
      name: "Documento subido",
      technicalId: "Gestion_Documentos-DocumentoSubido_V1",
      productDescription:
        "Registra un archivo cargado para un documento requerido y lo deja pendiente de aprobación legal.",
      trigger: {
        label: "La persona selecciona un archivo para un documento requerido",
        source: "userAction",
      },
      payloadSchema: { schemaId: "unknown" },
      receiptSchema: { schemaId: "unknownResponse" },
      writes: {
        entities: ["documento"],
        fields: ["documento.nombreArchivo", "documento.urlArchivo", "documento.estadoRevision"],
      },
      visibleResult: "Muestra Pendiente de aprobación junto al archivo cargado.",
      pendingTi:
        "TI debe definir el payload seguro, el almacenamiento del archivo y el comprobante de carga definitivo.",
    },
  },
});
