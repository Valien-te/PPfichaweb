import { type DocumentoRequerido, resolverDocumentosGestion } from "./pasos/documentos-rules";
import { obtenerEjecutivoLegalDesdeEntorno } from "./whatsapp-help";

const entornoVite = import.meta.env ?? {};

// Datos mock del cliente
export const clienteMock = {
  nombre: "Ana Pérez González",
  rut: "12.345.678-9",
  telefono: "+56 9 1234 5678",
  email: "ana@email.com",
  servicio: "Protección Patrimonial",
  ejecutivoLegal: obtenerEjecutivoLegalDesdeEntorno({
    VITE_EJECUTIVO_LEGAL_NOMBRE: entornoVite.VITE_EJECUTIVO_LEGAL_NOMBRE,
    VITE_EJECUTIVO_LEGAL_WHATSAPP: entornoVite.VITE_EJECUTIVO_LEGAL_WHATSAPP,
  }),
};

// Estados posibles de una gestión
export type EstadoGestion =
  | "pendiente_datos"
  | "esperando_alzamiento"
  | "transferencia_bloqueada"
  | "faltan_documentos"
  | "en_revision"
  | "completado";

export const estadosGestion: Record<EstadoGestion, { label: string; cta: string }> = {
  pendiente_datos: {
    label: "Faltan datos",
    cta: "Ir a completar",
  },
  esperando_alzamiento: {
    label: "En espera del alzamiento",
    cta: "Actualizar estado",
  },
  transferencia_bloqueada: {
    label: "No puede continuar",
    cta: "Actualizar estado",
  },
  faltan_documentos: {
    label: "Faltan documentos",
    cta: "Subir documentos",
  },
  en_revision: {
    label: "En revisión",
    cta: "Ver detalle",
  },
  completado: {
    label: "Completado",
    cta: "Ver resumen",
  },
};

// ── Mensajes dinámicos por estado ──
// Se elige uno estable por gestión (basado en su id) para evitar cambios en re-render.
const mensajesPorEstado: Record<EstadoGestion, string[]> = {
  pendiente_datos: [
    "Completa tus datos para que podamos avanzar con esta gestión.",
    "Necesitamos algunos datos tuyos para preparar todo.",
    "Falta información por completar. Es rápido, te guiamos paso a paso.",
  ],
  esperando_alzamiento: ["Podremos continuar cuando la prenda haya sido alzada."],
  transferencia_bloqueada: ["La transferencia no puede continuar con los antecedentes actuales."],
  faltan_documentos: [
    "Ya tenemos tus datos. Solo falta que subas los documentos.",
    "Estamos casi listos. Sube los documentos para continuar.",
    "Tus datos están completos. Adjunta los documentos pendientes y listo.",
  ],
  en_revision: ["Todo listo. Tu equipo legal ya está trabajando en esta gestión."],
  completado: ["Todo listo. Tu equipo legal ya está trabajando en esta gestión."],
};

/** Devuelve un mensaje contextual estable para una gestión según su estado */
export function mensajeProgreso(gestionId: string, estado: EstadoGestion): string {
  const mensajes = mensajesPorEstado[estado];
  // Hash simple del id para elegir siempre el mismo mensaje por gestión
  const hash = [...gestionId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return mensajes[hash % mensajes.length];
}

// Campos específicos por gestión
export interface CampoGestion {
  nombre: string;
  tipo: "text" | "select" | "textarea";
  placeholder?: string;
  opciones?: string[]; // Para tipo select
}

export interface Gestion {
  id: string;
  nombre: string;
  estado: EstadoGestion;
  fichaEnviada: boolean;
  avance: number;
  requiereDatosBien: boolean;
  /** Resumen breve del contrato para el cliente */
  resumen: string;
  /** Texto de lo que falta por hacer */
  descripcion: string;
  documentos: DocumentoRequerido[];
  camposEspecificos: CampoGestion[];
}

export const gestionesMock: Gestion[] = [
  {
    id: "compraventa-inmueble",
    nombre: "Compraventa de inmueble",
    estado: "pendiente_datos",
    fichaEnviada: false,
    avance: 25,
    requiereDatosBien: true,
    resumen:
      "Transferencia de un inmueble a un tercero de confianza para proteger tu patrimonio. Incluye la preparación de la escritura y la inscripción en el Conservador de Bienes Raíces.",
    descripcion: "Necesitamos datos del bien, del tercero y documentos.",
    documentos: resolverDocumentosGestion("Compraventa de inmueble"),
    camposEspecificos: [
      {
        nombre: "Tipo de bien",
        tipo: "select",
        opciones: ["Inmueble", "Departamento", "Terreno", "Otro"],
      },
      { nombre: "Dirección", tipo: "text", placeholder: "Ej: Av. Providencia 1234" },
      { nombre: "Comuna", tipo: "text", placeholder: "Ej: Providencia" },
      { nombre: "Rol o inscripción", tipo: "text", placeholder: "Ej: 1234-56" },
      { nombre: "Valor referencial", tipo: "text", placeholder: "Ej: $120.000.000" },
      { nombre: "Observaciones", tipo: "textarea", placeholder: "Información adicional relevante" },
    ],
  },
  {
    id: "cesion-derechos-hereditarios",
    nombre: "Cesión de derechos hereditarios",
    estado: "faltan_documentos",
    fichaEnviada: true,
    avance: 70,
    requiereDatosBien: true,
    resumen:
      "Traspaso de los derechos que te corresponden de una herencia a un tercero de confianza. Esto permite proteger esos derechos antes de que se resuelva la sucesión.",
    descripcion: "Ya completaste los datos. Falta subir documentos.",
    documentos: resolverDocumentosGestion("Cesión de derechos hereditarios"),
    camposEspecificos: [
      {
        nombre: "Causante o referencia de la herencia",
        tipo: "text",
        placeholder: "Nombre del causante",
      },
      {
        nombre: "Relación con la sucesión",
        tipo: "select",
        opciones: ["Hijo/a", "Cónyuge", "Hermano/a", "Nieto/a", "Otro"],
      },
      { nombre: "Porcentaje o derechos a ceder", tipo: "text", placeholder: "Ej: 50%" },
      { nombre: "Observaciones", tipo: "textarea", placeholder: "Información adicional relevante" },
    ],
  },
  {
    id: "compraventa-acciones-e1d",
    nombre: "Compraventa de acciones (Empresa en un Día)",
    estado: "pendiente_datos",
    fichaEnviada: false,
    avance: 10,
    requiereDatosBien: true,
    resumen:
      "Venta de acciones o derechos sociales de una empresa a un tercero de confianza. Protege tu participación societaria.",
    descripcion: "Completa los datos de la operación y del tercero.",
    documentos: resolverDocumentosGestion("Compraventa de acciones (Empresa en un Día)"),
    camposEspecificos: [
      { nombre: "Sociedad o empresa", tipo: "text", placeholder: "Nombre de la sociedad" },
      { nombre: "Cantidad de acciones", tipo: "text", placeholder: "Ej: 1.000" },
      { nombre: "Porcentaje estimado", tipo: "text", placeholder: "Ej: 25%" },
      { nombre: "Valor referencial", tipo: "text", placeholder: "Ej: $50.000.000" },
      { nombre: "Observaciones", tipo: "textarea", placeholder: "Información adicional relevante" },
    ],
  },
];
