/**
 * Enrutamiento legal de contratos de inmueble.
 *
 * La respuesta sobre la forma de adquisición tiene precedencia sobre la titularidad:
 * una adquisición hereditaria siempre se tramita como cesión de derechos hereditarios,
 * aunque también exista copropiedad. Si no hay herencia, la copropiedad deriva a una
 * cesión de derechos. Cualquier corrección posterior restaura el contrato original.
 */
export const CONTRATO_CESION_DERECHOS = "Cesión de derechos";
export const CONTRATO_CESION_DERECHOS_HEREDITARIOS = "Cesión de derechos hereditarios";

export type TipoTitularidadInmueble = "propiedadExclusiva" | "copropiedad";

const TIPOS_ADQUISICION_POR_HERENCIA = new Set(["herencia-inscrita", "herencia-no-inscrita"]);

export function esAdquisicionPorHerencia(tipoAdquisicion: string): boolean {
  return TIPOS_ADQUISICION_POR_HERENCIA.has(tipoAdquisicion);
}

export function resolverTipoContratoInmueble(
  tipoContratoOriginal: string,
  tipoAdquisicion: string,
  tipoTitularidad?: TipoTitularidadInmueble,
): string {
  // Regla de mayor precedencia: el origen hereditario cambia la naturaleza del contrato.
  if (esAdquisicionPorHerencia(tipoAdquisicion)) {
    return CONTRATO_CESION_DERECHOS_HEREDITARIOS;
  }

  // La copropiedad solo se evalúa cuando el inmueble no proviene de una herencia.
  if (tipoTitularidad === "copropiedad") {
    return CONTRATO_CESION_DERECHOS;
  }

  return tipoContratoOriginal;
}
