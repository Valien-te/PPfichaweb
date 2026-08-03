/**
 * Sincronización de bienes entre un contrato principal y el mandato para su firma.
 *
 * El mandato reutiliza los bienes del contrato principal y puede actualizarlos en ambos
 * sentidos. Cada tipo conserva solo sus campos compatibles para evitar datos obsoletos
 * (por ejemplo, porcentaje de una SRL frente a número de acciones de una SpA/S.A.).
 */
export type TipoBienVinculado = "inmueble" | "vehiculo" | "mueble" | "acciones";

type ValoresBien = Record<string, unknown>;
type InmuebleVinculado = { direccion: unknown; comuna: unknown; region: unknown };
type VehiculoVinculado = { patente: unknown; permisoAlDia: unknown; prenda: unknown };
type MuebleVinculado = {
  cantidad: unknown;
  tipoBien: unknown;
  marca: unknown;
  color: unknown;
};

function normalizarContrato(nombreContrato: string): string {
  return nombreContrato
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .replace(/\s+/g, " ")
    .trim();
}

const CONTRATOS_INMUEBLE = new Set(
  [
    "Compraventa de inmueble",
    "Compraventa de inmueble y usufructo",
    "Compraventa de nuda propiedad",
    "Cesión de derechos",
    "Cesión de derechos hereditarios",
  ].map(normalizarContrato),
);

const CONTRATOS_VEHICULO = new Set(["Compraventa de vehículo"].map(normalizarContrato));
const CONTRATOS_MUEBLE = new Set(["Compraventa de bienes muebles"].map(normalizarContrato));
const CONTRATOS_ACCIONES = new Set(
  ["Compraventa de acciones (Régimen tradicional)"].map(normalizarContrato),
);

export function obtenerTipoBienVinculado(nombreContrato: string): TipoBienVinculado | undefined {
  const contrato = normalizarContrato(nombreContrato);

  if (CONTRATOS_INMUEBLE.has(contrato)) return "inmueble";
  if (CONTRATOS_VEHICULO.has(contrato)) return "vehiculo";
  if (CONTRATOS_MUEBLE.has(contrato)) return "mueble";
  if (CONTRATOS_ACCIONES.has(contrato)) return "acciones";
  return undefined;
}

function clonarLista<T>(valor: unknown): T[] {
  if (!Array.isArray(valor)) return [];
  return valor.map((item) => ({ ...(item as Record<string, unknown>) })) as T[];
}

function obtenerInmueblesOrigen(valores: ValoresBien): InmuebleVinculado[] {
  // Derechos hereditarios puede contener varios inmuebles; los demás usan el inmueble simple.
  const heredados = clonarLista<InmuebleVinculado>(valores.inmueblesHeredados);
  if (heredados.length > 0) return heredados;

  return [
    {
      direccion: valores.direccion ?? "",
      comuna: valores.comuna ?? "",
      region: valores.region ?? "",
    },
  ];
}

function obtenerInmueblesMandato(valores: ValoresBien): InmuebleVinculado[] {
  const inmuebles = clonarLista<InmuebleVinculado>(valores.mandatoInmueblesDetalle);
  if (inmuebles.length > 0) return inmuebles;

  return [
    {
      direccion: valores.direccion ?? "",
      comuna: valores.comuna ?? "",
      region: valores.region ?? "",
    },
  ];
}

function obtenerMuebles(valores: ValoresBien): MuebleVinculado[] {
  const muebles = clonarLista<MuebleVinculado>(valores.bienesSingularizados);
  if (muebles.length > 0) return muebles;

  return [
    {
      cantidad: valores.cantidad ?? 1,
      tipoBien: valores.tipoBien ?? "",
      marca: valores.marca ?? "",
      color: valores.color ?? "",
    },
  ];
}

function obtenerDetalleAcciones(valores: ValoresBien): ValoresBien {
  const tipoSocietarioAcciones = valores.tipoSocietarioAcciones ?? "";
  const detalle: ValoresBien = {
    razonSocial: valores.razonSocial ?? "",
    rutEmpresa: valores.rutEmpresa ?? "",
    tipoSocietarioAcciones,
  };

  if (tipoSocietarioAcciones === "srl") {
    detalle.participacion = valores.participacion ?? "";
  }
  if (tipoSocietarioAcciones === "spa" || tipoSocietarioAcciones === "sa") {
    detalle.numeroAcciones = valores.numeroAcciones ?? "";
  }

  return detalle;
}

export function crearValoresMandatoDesdeOrigen(
  nombreContratoOrigen: string,
  valoresOrigen: ValoresBien,
): ValoresBien {
  // Las banderas permiten que el mandato muestre exclusivamente el bloque de bien vinculado.
  const tipoBien = obtenerTipoBienVinculado(nombreContratoOrigen);

  if (tipoBien === "inmueble") {
    const inmuebles = obtenerInmueblesOrigen(valoresOrigen);
    const primero = inmuebles[0];
    return {
      mandatoInmuebles: true,
      mandatoVehiculos: false,
      mandatoMuebles: false,
      mandatoAcciones: false,
      mandatoInmueblesDetalle: inmuebles,
      direccion: primero?.direccion ?? "",
      comuna: primero?.comuna ?? "",
      region: primero?.region ?? "",
    };
  }

  if (tipoBien === "vehiculo") {
    return {
      mandatoInmuebles: false,
      mandatoVehiculos: true,
      mandatoMuebles: false,
      mandatoAcciones: false,
      patente: valoresOrigen.patente ?? "",
      permisoAlDia: valoresOrigen.permisoAlDia ?? "",
      prenda: valoresOrigen.prenda ?? "",
    };
  }

  if (tipoBien === "mueble") {
    const muebles = obtenerMuebles(valoresOrigen);
    const primero = muebles[0];
    return {
      mandatoInmuebles: false,
      mandatoVehiculos: false,
      mandatoMuebles: true,
      mandatoAcciones: false,
      bienesSingularizados: muebles,
      cantidad: primero?.cantidad ?? 1,
      tipoBien: primero?.tipoBien ?? "",
      marca: primero?.marca ?? "",
      color: primero?.color ?? "",
    };
  }

  if (tipoBien === "acciones") {
    return {
      mandatoInmuebles: false,
      mandatoVehiculos: false,
      mandatoMuebles: false,
      mandatoAcciones: true,
      ...obtenerDetalleAcciones(valoresOrigen),
    };
  }

  return {};
}

export function sincronizarOrigenDesdeMandato(
  nombreContratoOrigen: string,
  valoresOrigen: ValoresBien,
  valoresMandato: ValoresBien,
): ValoresBien {
  const tipoBien = obtenerTipoBienVinculado(nombreContratoOrigen);

  if (tipoBien === "inmueble") {
    const inmuebles = obtenerInmueblesMandato(valoresMandato);
    const primero = inmuebles[0];
    const valoresSincronizados: ValoresBien = {
      ...valoresOrigen,
      direccion: primero?.direccion ?? "",
      comuna: primero?.comuna ?? "",
      region: primero?.region ?? "",
    };

    if (
      normalizarContrato(nombreContratoOrigen) ===
      normalizarContrato("Cesión de derechos hereditarios")
    ) {
      // En derechos hereditarios se sincroniza la colección completa, no solo el primero.
      valoresSincronizados.inmueblesHeredados = inmuebles;
    }

    return valoresSincronizados;
  }

  if (tipoBien === "vehiculo") {
    const vehiculo: VehiculoVinculado = {
      patente: valoresMandato.patente ?? "",
      permisoAlDia: valoresMandato.permisoAlDia ?? "",
      prenda: valoresMandato.prenda ?? "",
    };
    return { ...valoresOrigen, ...vehiculo };
  }

  if (tipoBien === "mueble") {
    return {
      ...valoresOrigen,
      bienesSingularizados: obtenerMuebles(valoresMandato),
    };
  }

  if (tipoBien === "acciones") {
    const valoresSincronizados = {
      ...valoresOrigen,
      ...obtenerDetalleAcciones(valoresMandato),
    };
    if (valoresSincronizados.tipoSocietarioAcciones === "srl") {
      // Limpiar el campo incompatible evita enviar dos formas de participación a la vez.
      delete valoresSincronizados.numeroAcciones;
    } else {
      delete valoresSincronizados.participacion;
    }
    return valoresSincronizados;
  }

  return valoresOrigen;
}
