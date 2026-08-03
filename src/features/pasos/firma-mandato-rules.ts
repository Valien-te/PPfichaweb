import { obtenerTipoBienVinculado } from "./bienes-vinculados-rules";
import { correspondenALaMismaPersona } from "./persona-rut-rules";

/**
 * Reglas para crear un mandato cuando las partes no pueden firmar juntas.
 *
 * La pregunta solo corresponde a contratos cuyo bien puede sincronizarse con un
 * mandato y cuando las regiones son distintas. En un mandato general, el apoderado
 * debe ser distinto de la persona contratante y de la otra parte.
 */

export type TipoMandatoFirma = "autocontrato" | "mandatoGeneral";
export type CoincidenciaApoderado = "personaContratante" | "otraParte";

function normalizarRegion(region: string): string {
  return region
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function obtenerCoincidenciaApoderado(
  rutApoderado: string,
  rutPersonaContratante: string,
  rutOtraParte: string,
): CoincidenciaApoderado | undefined {
  // El RUT se compara sin puntos, guion ni diferencias de mayúsculas en el dígito K.
  if (correspondenALaMismaPersona(rutApoderado, rutPersonaContratante)) {
    return "personaContratante";
  }
  if (correspondenALaMismaPersona(rutApoderado, rutOtraParte)) {
    return "otraParte";
  }
  return undefined;
}

export function requierenDefinirFirmaConjunta(
  regionCliente: string,
  regionTercero: string,
  nombreContrato: string,
): boolean {
  const cliente = normalizarRegion(regionCliente);
  const tercero = normalizarRegion(regionTercero);

  return (
    // Si no existe un tipo de bien sincronizable, no se crea un mandato automático.
    Boolean(obtenerTipoBienVinculado(nombreContrato)) &&
    Boolean(cliente) &&
    Boolean(tercero) &&
    cliente !== tercero
  );
}

export function obtenerNombreMandatoFirma(tipoMandato: TipoMandatoFirma): string {
  return tipoMandato === "autocontrato" ? "Mandato con autocontrato" : "Mandato";
}
