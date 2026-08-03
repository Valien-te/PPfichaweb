import { defineMockGenerationProfile } from "./simulator-contract-schema";

/**
 * Perfil para que el agente genere data mock coherente con Chile.
 *
 * La IA lo completa en autoría. El runtime solo consume objetos TypeScript
 * explícitos y deterministas.
 */
export const mockGenerationProfile = defineMockGenerationProfile({
  profileVersion: "1",
  locale: {
    language: "es",
    locale: "es-CL",
    country: "CL",
    timezone: "America/Santiago",
    currency: "CLP",
    dateStorage: "iso8601",
    dateDisplay: "dd-MM-yyyy",
    timeDisplay: "24h",
  },
  safety: {
    syntheticOnly: true,
    allowProductionImports: false,
    externalUse: false,
    emailDomain: "example.com",
  },
  entityKeys: {},
  relationBindings: {},
  fieldHints: {},
});
