import type { Gestion } from "../mock-data";
import { resolverDocumentosGestion } from "../pasos/documentos-rules";

/**
 * Catálogo sintético del simulador visual.
 *
 * Sirve para crear gestiones deterministas de prueba desde el panel. No representa
 * registros reales ni reemplaza el contrato de datos; cada gestión obtiene su lista
 * documental desde la misma matriz utilizada por el flujo productivo.
 */

export const CONTRATOS_DISPONIBLES = [
  "Compraventa de Inmueble",
  "Cancelación y Alzamiento de Hipoteca",
  "Cancelación de precio",
  "Compraventa de Inmueble y usufructo",
  "Cesión de derechos",
  "Compraventa de nuda propiedad",
  "Cesión de Derechos Hereditarios",
  "Compraventa de bienes muebles",
  "Comodato de bienes muebles",
  "Declaración jurada de Allegado",
  "Mandato",
  "Mandato con autocontrato",
  "Resciliación",
  "Pacto de sustitución de régimen matrimonial",
  "Liquidación de sociedad conyugal",
  "Renuncia a los gananciales",
  "Compraventa de vehículo",
  "Cancelación y Alzamiento de Prenda",
  "Transferencia de vehículo RC",
  "Compraventa de acciones (Régimen tradicional)",
  "Compraventa de acciones (Empresa en un Día)",
  "Constitución de sociedades",
  "Compraventa de establecimiento comercial",
  "Compraventa de derecho de llaves",
  "Compraventa de patente comercial",
  "Contrato de arriendo",
  "Aporte inmobiliario SRL",
];

export function generarGestionDesdePlantilla(nombreContrato: string): Gestion {
  // El sufijo temporal evita colisiones al crear varias gestiones del mismo contrato.
  const id =
    nombreContrato.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
    "-" +
    Date.now().toString().slice(-4);

  const resumenPorContrato: Record<string, string> = {
    Resciliación:
      "Término de común acuerdo de un contrato celebrado anteriormente con otra persona.",
    "Renuncia a los gananciales":
      "Preparación de los antecedentes necesarios para formalizar la renuncia a los gananciales.",
    "Cancelación de precio":
      "Declaración mediante escritura de que el precio de la compraventa del inmueble ya fue pagado.",
    "Compraventa de Inmueble y usufructo":
      "Transferencia de un inmueble a un tercero de confianza, conservando el derecho de uso y sus beneficios para ti o para otra persona.",
    "Transferencia de vehículo RC":
      "Transferencia del vehículo directamente en el Registro Civil mediante declaración consensual, sin preparar un contrato notarial.",
    "Compraventa de establecimiento comercial":
      "Transferencia de los bienes tangibles que forman parte del establecimiento comercial.",
    "Compraventa de derecho de llaves":
      "Transferencia del valor intangible asociado al funcionamiento y clientela del negocio.",
  };
  const resumen =
    resumenPorContrato[nombreContrato] ??
    `Preparación y legalización de ${nombreContrato.toLowerCase()} para resguardar tus intereses y patrimonio.`;

  const documentos = resolverDocumentosGestion(nombreContrato);

  const requiereDatosBien = ![
    "Pacto de sustitución de régimen matrimonial",
    "Renuncia a los gananciales",
    "Resciliación",
  ].includes(nombreContrato);

  return {
    id,
    nombre: nombreContrato,
    estado: "pendiente_datos",
    fichaEnviada: false,
    avance: 0,
    requiereDatosBien,
    resumen,
    // La descripción visible se resuelve dinámicamente según el estado de la gestión.
    descripcion: "",
    documentos,
    camposEspecificos: [
      { nombre: "Objeto del contrato", tipo: "text", placeholder: "Breve descripción" },
      { nombre: "Valor referencial", tipo: "text", placeholder: "Ej: $10.000.000" },
      {
        nombre: "Observaciones",
        tipo: "textarea",
        placeholder: "Detalles o condiciones especiales",
      },
    ],
  };
}
