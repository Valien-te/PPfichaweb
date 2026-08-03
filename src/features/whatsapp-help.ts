export const WHATSAPP_HELP_MESSAGE = "Hola, tengo una duda mientras completo mi ficha.";

export type EjecutivoLegal = {
  nombre: string;
  telefonoWhatsapp: string;
};

type EjecutivoLegalEnvironment = {
  VITE_EJECUTIVO_LEGAL_NOMBRE?: unknown;
  VITE_EJECUTIVO_LEGAL_WHATSAPP?: unknown;
};

export function normalizarTelefonoWhatsapp(telefono: string): string {
  return telefono.replace(/\D/g, "");
}

export function obtenerEjecutivoLegalDesdeEntorno(
  environment: EjecutivoLegalEnvironment,
): EjecutivoLegal | null {
  const nombre =
    typeof environment.VITE_EJECUTIVO_LEGAL_NOMBRE === "string"
      ? environment.VITE_EJECUTIVO_LEGAL_NOMBRE.trim()
      : "";
  const telefonoWhatsapp =
    typeof environment.VITE_EJECUTIVO_LEGAL_WHATSAPP === "string"
      ? normalizarTelefonoWhatsapp(environment.VITE_EJECUTIVO_LEGAL_WHATSAPP)
      : "";

  if (!nombre || !telefonoWhatsapp) return null;

  return { nombre, telefonoWhatsapp };
}

export function construirWhatsappHref(telefonoWhatsapp: string): string | null {
  const telefonoNormalizado = normalizarTelefonoWhatsapp(telefonoWhatsapp);
  if (!telefonoNormalizado) return null;

  return `https://wa.me/${telefonoNormalizado}?text=${encodeURIComponent(WHATSAPP_HELP_MESSAGE)}`;
}
