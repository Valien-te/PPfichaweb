/**
 * Límite transversal del tercero de confianza en escrituras inmobiliarias.
 *
 * Una misma persona puede recibir bienes en un máximo de dos escrituras incluidas.
 * La liquidación de sociedad conyugal y los mandatos quedan fuera: la primera fue
 * excluida expresamente por negocio y los segundos representan la firma de una
 * escritura principal, por lo que contarlos duplicaría artificialmente el uso.
 */

export interface GestionParaLimiteTercero {
  id: string;
  nombre: string;
  datosTercero?: { rut?: string };
}

export type EstadoLimiteTerceroInmobiliario =
  | "disponible"
  | "segundoUso"
  | "limiteAlcanzado";

export interface ResultadoLimiteTerceroInmobiliario {
  estado: EstadoLimiteTerceroInmobiliario;
  usosPrevios: number;
  gestionesCoincidentes: Array<Pick<GestionParaLimiteTercero, "id" | "nombre">>;
}

const CONTRATOS_CON_LIMITE_TERCERO = new Set(
  [
    "Aporte inmobiliario SRL",
    "Compraventa de inmueble",
    "Compraventa de inmueble y usufructo",
    "Cesión de derechos",
    "Compraventa de nuda propiedad",
    "Cesión de derechos hereditarios",
  ].map(normalizarTextoRegla),
);

function normalizarTextoRegla(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .replace(/\s+/g, " ")
    .trim();
}

/** Compara el RUT sin puntos, guion, espacios ni diferencias de mayúsculas. */
export function normalizarRutParaComparacion(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function esEscrituraInmobiliariaConLimiteTercero(nombreContrato: string): boolean {
  return CONTRATOS_CON_LIMITE_TERCERO.has(normalizarTextoRegla(nombreContrato));
}

/**
 * Cuenta escrituras principales, no bienes individuales. Por eso una cesión de
 * derechos hereditarios con varios inmuebles sigue representando un único uso.
 */
export function evaluarLimiteTerceroInmobiliario(
  gestiones: readonly GestionParaLimiteTercero[],
  gestionActualId: string,
  nombreContratoActual: string,
  rutTercero: string,
): ResultadoLimiteTerceroInmobiliario {
  const rutNormalizado = normalizarRutParaComparacion(rutTercero);
  if (!esEscrituraInmobiliariaConLimiteTercero(nombreContratoActual) || !rutNormalizado) {
    return { estado: "disponible", usosPrevios: 0, gestionesCoincidentes: [] };
  }

  const gestionesCoincidentes = gestiones
    .filter(
      (gestion) =>
        gestion.id !== gestionActualId &&
        esEscrituraInmobiliariaConLimiteTercero(gestion.nombre) &&
        normalizarRutParaComparacion(gestion.datosTercero?.rut ?? "") === rutNormalizado,
    )
    .map(({ id, nombre }) => ({ id, nombre }));

  const usosPrevios = gestionesCoincidentes.length;
  return {
    estado:
      usosPrevios >= 2 ? "limiteAlcanzado" : usosPrevios === 1 ? "segundoUso" : "disponible",
    usosPrevios,
    gestionesCoincidentes,
  };
}
