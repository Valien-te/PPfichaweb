import { definePrototypeMockScenarios } from "./simulator-contract-schema";

/**
 * Escenarios mock persistibles.
 *
 * Un proyecto fresco nace vacío y válido. El agente agrega fixtures explícitos
 * después del kickoff y sube datasetVersion cuando cambia el dataset.
 */
export const prototypeMockScenarios = definePrototypeMockScenarios({
  scenariosVersion: "1",
  datasetVersion: 4,
  defaultScenarioId: "base",
  scenarios: {
    base: {
      id: "base",
      name: "Recorrido principal",
      description:
        "Recorrido principal con una cesión de derechos hereditarios lista para probar la carga de documentos.",
      entities: {
        usufructuario: [{ titularUsufructo: "cliente" }],
      },
    },
    empty: {
      id: "empty",
      name: "Estado vacío",
      description: "Escenario sin resultados.",
      entities: {},
    },
    edgeCases: {
      id: "edgeCases",
      name: "Casos límite",
      description:
        "Casos especiales, incluido el límite de dos escrituras inmobiliarias por tercero de confianza y una persona usufructuaria distinta del cliente.",
      entities: {
        usufructuario: [
          {
            titularUsufructo: "otraPersona",
            nombres: "Camila Andrea",
            apellidoPaterno: "Fuentes",
            apellidoMaterno: "Morales",
            rut: "16274891-5",
            email: "camila.fuentes@example.com",
            fechaNacimiento: "1991-04-18",
            nacionalidad: "Chilena",
            profesion: "Arquitecta",
            estadoCivil: "Casado/a",
            regimenMatrimonial: "Separación de bienes",
            domicilio: "Los Olmos 815, departamento 302",
            comuna: "Ñuñoa",
            region: "Metropolitana",
            esMayorEdad: true,
            coincideConTerceroConfianza: false,
          },
        ],
      },
    },
  },
});
