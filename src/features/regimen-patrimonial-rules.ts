/**
 * Enrutamiento de la liquidación de sociedad conyugal.
 *
 * Si durante el matrimonio no se adquirieron inmuebles ni vehículos, no existe un
 * conjunto de bienes que liquidar en este prototipo y la gestión pasa a un pacto de
 * sustitución. El régimen de destino está fijado en separación de bienes y no se
 * presenta como una elección del cliente.
 */
export const CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL = "Liquidación de sociedad conyugal";
export const CONTRATO_PACTO_SUSTITUCION_REGIMEN = "Pacto de sustitución de régimen matrimonial";
export const REGIMEN_DESTINO_PACTO_SUSTITUCION = "separacionDeBienes";

function normalizarNombreContrato(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function esLiquidacionSociedadConyugal(nombreContrato: string): boolean {
  return normalizarNombreContrato(nombreContrato).includes("liquidacion de sociedad conyugal");
}

export function resolverContratoSegunBienesMatrimonio(
  tipoContratoOriginal: string,
  comproInmueble: unknown,
  comproVehiculo: unknown,
): string {
  if (
    esLiquidacionSociedadConyugal(tipoContratoOriginal) &&
    comproInmueble === "no" &&
    comproVehiculo === "no"
  ) {
    // Las dos respuestas deben ser negativas; una respuesta incompleta no cambia la gestión.
    return CONTRATO_PACTO_SUSTITUCION_REGIMEN;
  }

  return tipoContratoOriginal;
}
