/**
 * Identificadores humanos para distinguir gestiones del mismo tipo en el portal.
 *
 * Solo se usan datos reales ya ingresados. No se generan folios ni nombres ficticios:
 * dirección para inmuebles, patente para vehículos y razón social/nombre para sociedades.
 * Los contratos sin un identificador natural se muestran sin sufijo.
 */
type ValoresGestion = Record<string, unknown>;

const CONTRATOS_CON_DIRECCION = new Set(
  [
    "Compraventa de inmueble",
    "Compraventa de inmueble y usufructo",
    "Compraventa de nuda propiedad",
    "Cesión de derechos",
    "Cancelación y Alzamiento de Hipoteca",
    "Contrato de arriendo",
    "Aporte inmobiliario SRL",
  ].map(normalizarContrato),
);

const CONTRATOS_CON_PATENTE = new Set(
  [
    "Compraventa de vehículo",
    "Cancelación y Alzamiento de Prenda",
    "Transferencia de vehículo RC",
  ].map(normalizarContrato),
);

function normalizarContrato(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .trim();
}

function obtenerTexto(valor: unknown) {
  return typeof valor === "string" && valor.trim().length > 0 ? valor.trim() : undefined;
}

function obtenerDireccionesHereditarias(valores: ValoresGestion) {
  if (!Array.isArray(valores.inmueblesHeredados)) return [];

  return valores.inmueblesHeredados.flatMap((inmueble) => {
    if (!inmueble || typeof inmueble !== "object") return [];
    const direccion = obtenerTexto((inmueble as Record<string, unknown>).direccion);
    return direccion ? [direccion] : [];
  });
}

export function obtenerIdentificadorGestion(
  nombreContrato: string,
  valores: ValoresGestion,
): string | undefined {
  const contrato = normalizarContrato(nombreContrato);

  if (contrato.includes("cesion de derechos hereditarios")) {
    // Una dirección identifica el inmueble; con varios, el conteo evita una cabecera extensa.
    const direcciones = obtenerDireccionesHereditarias(valores);
    if (direcciones.length === 1) return direcciones[0];
    if (direcciones.length > 1) return `(${direcciones.length} inmuebles)`;
    return undefined;
  }

  if (CONTRATOS_CON_DIRECCION.has(contrato)) {
    return obtenerTexto(valores.direccion);
  }

  if (CONTRATOS_CON_PATENTE.has(contrato)) {
    return obtenerTexto(valores.patente);
  }

  if (contrato.includes("compraventa de acciones")) {
    return obtenerTexto(valores.razonSocial);
  }

  if (contrato.includes("constitucion de sociedades")) {
    return obtenerTexto(valores.nombreSociedad);
  }

  return undefined;
}
