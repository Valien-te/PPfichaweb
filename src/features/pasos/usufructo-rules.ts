import { correspondenALaMismaPersona } from "./persona-rut-rules";
import { esMayorDeEdad } from "./tercero-risk-rules";

export const CONTRATO_COMPRAVENTA_INMUEBLE_USUFRUCTO = "Compraventa de inmueble y usufructo";

export type TitularUsufructo = "cliente" | "otraPersona";

function normalizarContrato(nombreContrato: string): string {
  return nombreContrato
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .replace(/\s+/g, " ")
    .trim();
}

export function requierePasoUsufructo(nombreContrato: string): boolean {
  return (
    normalizarContrato(nombreContrato) ===
    normalizarContrato(CONTRATO_COMPRAVENTA_INMUEBLE_USUFRUCTO)
  );
}

export type CoincidenciaRutUsufructuario = "cliente" | "terceroConfianza" | null;

export function obtenerCoincidenciaRutUsufructuario(
  rutUsufructuario: string,
  rutCliente: string,
  rutTerceroConfianza: string,
): CoincidenciaRutUsufructuario {
  if (correspondenALaMismaPersona(rutUsufructuario, rutCliente)) return "cliente";
  if (correspondenALaMismaPersona(rutUsufructuario, rutTerceroConfianza)) {
    return "terceroConfianza";
  }
  return null;
}

export function usufructuarioCumpleMayoriaEdad(fechaNacimiento: string): boolean {
  return esMayorDeEdad(fechaNacimiento);
}
