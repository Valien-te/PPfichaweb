import assert from "node:assert/strict";

import { obtenerIdentificadorGestion } from "../src/features/identificador-gestion-rules";
import { gestionesMock } from "../src/features/mock-data";
import {
  CONTRATOS_DISPONIBLES,
  generarGestionDesdePlantilla,
} from "../src/features/simulator/generador-gestiones";

const contratosConDireccion = [
  "Compraventa de Inmueble",
  "Cancelación y Alzamiento de Hipoteca",
  "Compraventa de Inmueble y usufructo",
  "Cesión de derechos",
  "Compraventa de nuda propiedad",
  "Contrato de arriendo",
  "Aporte inmobiliario SRL",
];

for (const contrato of contratosConDireccion) {
  assert.equal(
    obtenerIdentificadorGestion(contrato, { direccion: "Av. Apoquindo 3000" }),
    "Av. Apoquindo 3000",
  );
}

const contratosConPatente = [
  "Compraventa de vehículo",
  "Cancelación y Alzamiento de Prenda",
  "Transferencia de vehículo RC",
];

for (const contrato of contratosConPatente) {
  assert.equal(obtenerIdentificadorGestion(contrato, { patente: "AB CD 12" }), "AB CD 12");
}

assert.equal(
  obtenerIdentificadorGestion("Compraventa de acciones (Régimen tradicional)", {
    razonSocial: "Inversiones Los Andes SpA",
  }),
  "Inversiones Los Andes SpA",
);
assert.equal(
  obtenerIdentificadorGestion("Compraventa de acciones (Empresa en un Día)", {
    razonSocial: "Servicios del Sur Limitada",
  }),
  "Servicios del Sur Limitada",
);
assert.equal(
  obtenerIdentificadorGestion("Compraventa de acciones E1D", {
    razonSocial: "Servicios del Sur Limitada",
  }),
  "Servicios del Sur Limitada",
);
assert.equal(
  obtenerIdentificadorGestion("Constitución de sociedades", {
    nombreSociedad: "Tecnología Austral SpA",
  }),
  "Tecnología Austral SpA",
);

assert.equal(
  obtenerIdentificadorGestion("Cesión de derechos hereditarios", {
    inmueblesHeredados: [{ direccion: "Los Alerces 120" }],
  }),
  "Los Alerces 120",
);
assert.equal(
  obtenerIdentificadorGestion("Cesión de derechos hereditarios", {
    inmueblesHeredados: [{ direccion: "Los Alerces 120" }, { direccion: "Los Robles 450" }],
  }),
  "(2 inmuebles)",
);
assert.equal(
  obtenerIdentificadorGestion("Cesión de derechos hereditarios", {
    inmueblesHeredados: [
      { direccion: "Los Alerces 120" },
      { direccion: "Los Robles 450" },
      { direccion: "Los Maitenes 880" },
    ],
  }),
  "(3 inmuebles)",
);

const contratosSinIdentificador = [
  "Compraventa de bienes muebles",
  "Comodato de bienes muebles",
  "Declaración jurada de Allegado",
  "Mandato",
  "Mandato con autocontrato",
  "Liquidación de sociedad conyugal",
  "Compraventa de establecimiento comercial",
  "Compraventa de patente comercial",
  "Pacto de sustitución de régimen matrimonial",
  "Renuncia a los gananciales",
  "Resciliación",
];

for (const contrato of contratosSinIdentificador) {
  assert.equal(
    obtenerIdentificadorGestion(contrato, {
      direccion: "Dirección que no corresponde mostrar",
      patente: "XX YY 99",
      razonSocial: "Sociedad que no corresponde mostrar",
    }),
    undefined,
  );
}

assert.equal(obtenerIdentificadorGestion("Compraventa de inmueble", {}), undefined);
assert.equal(obtenerIdentificadorGestion("Compraventa de vehículo", {}), undefined);
assert.equal(
  obtenerIdentificadorGestion("Cesión de derechos hereditarios", {
    inmueblesHeredados: [{ direccion: "" }],
  }),
  undefined,
);

for (const gestion of gestionesMock) {
  assert.equal("identificadorBien" in gestion, false);
}

for (const contrato of CONTRATOS_DISPONIBLES) {
  assert.equal("identificadorBien" in generarGestionDesdePlantilla(contrato), false);
}

console.log("✓ Identificadores de gestiones válidos");
console.log(`  ${contratosConDireccion.length} contratos muestran dirección`);
console.log(`  ${contratosConPatente.length} contratos muestran placa patente`);
console.log(`  ${contratosSinIdentificador.length} contratos no muestran especificación`);
