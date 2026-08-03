import { esTransferenciaVehiculoRegistroCivil } from "./registro-civil-vehiculo-rules";

/**
 * Fuente de verdad para construir el camino de la ficha y decidir quién comparece.
 *
 * Las pantallas no deben replicar estas listas. Una gestión puede pedir al cónyuge,
 * un tercero, un segundo socio o instrucciones del Registro Civil; esa decisión también
 * determina qué pasos aparecen y en qué orden.
 */

export type ModoCapturaTercero =
  | "soloConyuge"
  | "terceroConConyugeCondicional"
  | "segundoSocio"
  | "soloTercero"
  | "registroCivilVehiculo";

export type PasoGestionId =
  "datos-personales" | "conyuge" | "datos-especificos" | "tercero" | "documentos";

const CONTRATOS_CON_CONYUGE_CONDICIONAL = new Set(
  [
    "Aporte inmobiliario SRL",
    "Compraventa de inmueble",
    "Compraventa de inmueble y usufructo",
    "Compraventa de nuda propiedad",
    "Cesión de derechos",
    "Cesión de derechos hereditarios",
    "Mandato",
    "Mandato con autocontrato",
  ].map(normalizarValorRegla),
);

const CONTRATOS_SOLO_CONYUGE = new Set(
  [
    "Pacto de sustitución de régimen matrimonial",
    "Liquidación de sociedad conyugal",
    "Renuncia a los gananciales",
  ].map(normalizarValorRegla),
);

const CONTRATOS_SIN_DOCUMENTOS = new Set(
  [
    "Constitución de sociedades",
    "Compraventa de bienes muebles",
    "Comodato de bienes muebles",
    "Declaración jurada de Allegado",
    "Pacto de sustitución de régimen matrimonial",
    "Compraventa de acciones (Empresa en un Día)",
  ].map(normalizarValorRegla),
);

function normalizarValorRegla(valor: unknown): string {
  if (typeof valor !== "string") return "";

  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function esContratoConSegundoSocio(nombreContrato: string): boolean {
  return normalizarValorRegla(nombreContrato).includes("constitucion de sociedad");
}

export function debeMostrarPasoDocumentos(
  nombreContrato: string,
  tieneDocumentos?: boolean,
): boolean {
  // La lista documental ya resuelta tiene prioridad sobre la clasificación estática.
  // Esto permite reglas condicionales, como patente comercial tradicional vs. E1D.
  if (typeof tieneDocumentos === "boolean") return tieneDocumentos;
  return !CONTRATOS_SIN_DOCUMENTOS.has(normalizarValorRegla(nombreContrato));
}

export function obtenerModoCapturaTercero(nombreContrato: string): ModoCapturaTercero {
  const contratoNormalizado = normalizarValorRegla(nombreContrato);

  if (esTransferenciaVehiculoRegistroCivil(nombreContrato)) {
    return "registroCivilVehiculo";
  }

  if (esContratoConSegundoSocio(nombreContrato)) {
    return "segundoSocio";
  }

  if (CONTRATOS_SOLO_CONYUGE.has(contratoNormalizado)) {
    return "soloConyuge";
  }

  if (CONTRATOS_CON_CONYUGE_CONDICIONAL.has(contratoNormalizado)) {
    return "terceroConConyugeCondicional";
  }

  return "soloTercero";
}

export function debeSolicitarConyugeAdicional(
  nombreContrato: string,
  estadoCivil: string,
  regimenPatrimonial: string,
): boolean {
  if (obtenerModoCapturaTercero(nombreContrato) !== "terceroConConyugeCondicional") {
    return false;
  }

  const estadoCivilNormalizado = normalizarValorRegla(estadoCivil);
  const regimenNormalizado = normalizarValorRegla(regimenPatrimonial);

  // Solo estos regímenes requieren que el cónyuge o conviviente comparezca.
  const casadoEnSociedadConyugal =
    estadoCivilNormalizado === normalizarValorRegla("Casado/a") &&
    regimenNormalizado === normalizarValorRegla("Sociedad conyugal");
  const aucEnComunidadDeBienes =
    estadoCivilNormalizado === normalizarValorRegla("Acuerdo de Unión Civil") &&
    regimenNormalizado === normalizarValorRegla("Comunidad de bienes");

  return casadoEnSociedadConyugal || aucEnComunidadDeBienes;
}

export function esTransferenciaDeInmueble(nombreContrato: string): boolean {
  const contratoNormalizado = normalizarValorRegla(nombreContrato);
  return (
    contratoNormalizado.includes("inmueble") ||
    contratoNormalizado.includes("nuda propiedad") ||
    contratoNormalizado.includes("cesion de derechos") ||
    contratoNormalizado.includes("hereditarios") ||
    contratoNormalizado.includes("aporte inmobiliario")
  );
}

export function debeSolicitarConyugeTercero(
  nombreContrato: string,
  estadoCivilTercero: string,
  regimenPatrimonialTercero: string,
): boolean {
  if (!esTransferenciaDeInmueble(nombreContrato)) {
    return false;
  }

  const estadoCivilNormalizado = normalizarValorRegla(estadoCivilTercero);
  const regimenNormalizado = normalizarValorRegla(regimenPatrimonialTercero);
  const casadoEnSociedadConyugal =
    estadoCivilNormalizado === normalizarValorRegla("Casado/a") &&
    regimenNormalizado.includes(normalizarValorRegla("Sociedad conyugal"));
  const aucEnComunidadDeBienes =
    estadoCivilNormalizado === normalizarValorRegla("Acuerdo de Unión Civil") &&
    regimenNormalizado === normalizarValorRegla("Comunidad de bienes");

  return casadoEnSociedadConyugal || aucEnComunidadDeBienes;
}

export function debeMostrarPasoConyuge(
  nombreContrato: string,
  estadoCivil: string,
  regimenPatrimonial: string,
): boolean {
  return (
    obtenerModoCapturaTercero(nombreContrato) === "soloConyuge" ||
    debeSolicitarConyugeAdicional(nombreContrato, estadoCivil, regimenPatrimonial)
  );
}

export function debeMostrarPasoTercero(nombreContrato: string, tipoSociedad = ""): boolean {
  // La E.I.R.L. tiene una sola persona titular, por lo que no solicita un segundo socio.
  if (esContratoConSegundoSocio(nombreContrato) && normalizarValorRegla(tipoSociedad) === "eirl") {
    return false;
  }
  return obtenerModoCapturaTercero(nombreContrato) !== "soloConyuge";
}

export function debePedirAdministradorSociedad(tipoSociedad: unknown): boolean {
  const tipoNormalizado = normalizarValorRegla(tipoSociedad);
  return ["spa", "sa", "limitada"].includes(tipoNormalizado);
}

export function requiereDatosAdministradorSociedad(
  tipoSociedad: unknown,
  administradorSociedad: unknown,
): boolean {
  return (
    debePedirAdministradorSociedad(tipoSociedad) &&
    normalizarValorRegla(administradorSociedad) === "otro"
  );
}

export function obtenerSecuenciaPasosGestion(
  nombreContrato: string,
  requiereDatosBien: boolean,
  estadoCivil: string,
  regimenPatrimonial: string,
  tipoSociedad = "",
  tieneDocumentos?: boolean,
): PasoGestionId[] {
  // Datos personales siempre abre la ficha; los demás pasos se agregan por reglas.
  const pasos: PasoGestionId[] = ["datos-personales"];

  if (debeMostrarPasoConyuge(nombreContrato, estadoCivil, regimenPatrimonial)) {
    pasos.push("conyuge");
  }
  if (requiereDatosBien) {
    pasos.push("datos-especificos");
  }
  if (debeMostrarPasoTercero(nombreContrato, tipoSociedad)) {
    pasos.push("tercero");
  }
  if (debeMostrarPasoDocumentos(nombreContrato, tieneDocumentos)) {
    pasos.push("documentos");
  }

  return pasos;
}
