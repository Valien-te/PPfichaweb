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

export interface CompletitudPasosGestion {
  datosPersonalesConfirmados: boolean;
  conyugeCompleto: boolean;
  datosEspecificosCompletos: boolean;
  terceroCompleto: boolean;
}

export interface PresentacionPasoTercero {
  titulo: string;
  bajada: string;
}

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

/**
 * Resuelve el título y la bajada de la persona solicitada en el paso Tercero.
 *
 * El paso se reutiliza para roles distintos (cónyuge, socio, apoderado, contraparte
 * y tercero de confianza). En las transferencias comerciales, la bajada nombra el
 * objeto concreto para no describir acciones, patentes o un establecimiento como
 * "bienes" genéricos. Registro Civil conserva su presentación en su pantalla propia.
 */
export function obtenerPresentacionPasoTercero(nombreContrato: string): PresentacionPasoTercero {
  const contrato = normalizarValorRegla(nombreContrato);

  if (esContratoConSegundoSocio(nombreContrato)) {
    return {
      titulo: "Datos del segundo socio",
      bajada: "Ingresa los mismos datos personales que usamos para los demás comparecientes.",
    };
  }

  if (CONTRATOS_SOLO_CONYUGE.has(contrato)) {
    return {
      titulo: "Datos de tu cónyuge",
      bajada: "Completa la información personal de tu cónyuge para la redacción de los documentos.",
    };
  }

  if (contrato === normalizarValorRegla("Mandato")) {
    return {
      titulo: "Persona apoderada",
      bajada:
        "Primero indica quién otorgará el poder y luego completa los datos de quien firmará en su nombre.",
    };
  }

  if (contrato === normalizarValorRegla("Mandato con autocontrato")) {
    return {
      titulo: "Firma con autocontrato",
      bajada: "Indica cuál de las dos partes firmará también en representación de la otra.",
    };
  }

  if (contrato.includes("resciliacion")) {
    return {
      titulo: "Datos de la otra parte del contrato",
      bajada:
        "Ingresa los datos de la persona con quien celebraste el contrato que quieres resciliar.",
    };
  }

  if (contrato.includes("compraventa de acciones")) {
    return {
      titulo: "Datos de tu tercero de confianza",
      bajada: "Completa los datos de la persona que recibirá tus acciones o derechos sociales.",
    };
  }

  if (contrato.includes("compraventa de establecimiento comercial")) {
    return {
      titulo: "Datos de tu tercero de confianza",
      bajada: "Completa los datos de la persona que recibirá el establecimiento comercial.",
    };
  }

  if (contrato.includes("compraventa de patente comercial")) {
    return {
      titulo: "Datos de tu tercero de confianza",
      bajada: "Completa los datos de la persona que recibirá la patente comercial.",
    };
  }

  if (contrato.includes("aporte inmobiliario srl")) {
    return {
      titulo: "Datos de tu tercero de confianza",
      bajada:
        "Completa los datos de la persona que participará contigo en la sociedad a la que aportarás el inmueble.",
    };
  }

  return {
    titulo: "Datos de tu tercero de confianza",
    bajada: "Ingresa los datos de la persona que elegiste para transferirle tus bienes.",
  };
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

/**
 * Devuelve el primer paso que todavía requiere una acción de la persona.
 *
 * La completitud tiene precedencia sobre el estado general. Así, un estado
 * desactualizado como `faltan_documentos` nunca puede saltarse Datos del bien o Tercero.
 */
export function obtenerPrimerPasoPendienteGestion(
  pasos: readonly PasoGestionId[],
  completitud: CompletitudPasosGestion,
): PasoGestionId | undefined {
  for (const paso of pasos) {
    if (paso === "datos-personales" && !completitud.datosPersonalesConfirmados) return paso;
    if (paso === "conyuge" && !completitud.conyugeCompleto) return paso;
    if (paso === "datos-especificos" && !completitud.datosEspecificosCompletos) return paso;
    if (paso === "tercero" && !completitud.terceroCompleto) return paso;
    if (paso === "documentos") return paso;
  }

  return undefined;
}

/**
 * Decide dónde debe entrar una gestión desde el portal o una ruta directa.
 * Antes del envío, Documentos nunca es una entrada válida: si los datos ya están
 * completos, se vuelve al último paso de la ficha para ejecutar `Enviar ficha`.
 */
export function obtenerPasoEntradaGestion(
  pasos: readonly PasoGestionId[],
  completitud: CompletitudPasosGestion,
  fichaEnviada: boolean,
): PasoGestionId | undefined {
  const pasoPendiente = obtenerPrimerPasoPendienteGestion(pasos, completitud);
  if (fichaEnviada) return pasoPendiente;

  if (pasoPendiente === "documentos") {
    const indiceDocumentos = pasos.indexOf("documentos");
    return pasos[indiceDocumentos - 1] ?? pasos[0];
  }

  return pasoPendiente ?? pasos.at(-1);
}
