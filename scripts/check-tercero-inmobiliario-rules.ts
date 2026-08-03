import assert from "node:assert/strict";

import { correspondenALaMismaPersona } from "../src/features/pasos/persona-rut-rules";
import {
  esEscrituraInmobiliariaConLimiteTercero,
  evaluarLimiteTerceroInmobiliario,
  normalizarRutParaComparacion,
} from "../src/features/pasos/tercero-inmobiliario-rules";

const rutTerceroRepetido = "17.456.321-7";
const gestiones = [
  {
    id: "compraventa-1",
    nombre: "Compraventa de inmueble",
    datosTercero: { rut: rutTerceroRepetido },
  },
  {
    id: "aporte-2",
    nombre: "Aporte inmobiliario SRL",
    datosTercero: { rut: "17456321-7" },
  },
  {
    id: "liquidacion-excluida",
    nombre: "Liquidación de sociedad conyugal",
    datosTercero: { rut: rutTerceroRepetido },
  },
  {
    id: "mandato-excluido",
    nombre: "Mandato",
    datosTercero: { rut: rutTerceroRepetido },
  },
];

assert.equal(normalizarRutParaComparacion("17.456.321-7"), "174563217");
assert.equal(correspondenALaMismaPersona("12.345.678-9", "12345678-9"), true);
assert.equal(correspondenALaMismaPersona("12.345.678-9", "17.456.321-7"), false);
assert.equal(correspondenALaMismaPersona("1", "1"), false);
assert.equal(esEscrituraInmobiliariaConLimiteTercero("Cesión de derechos hereditarios"), true);
assert.equal(esEscrituraInmobiliariaConLimiteTercero("Liquidación de sociedad conyugal"), false);
assert.equal(
  evaluarLimiteTerceroInmobiliario(
    gestiones.slice(0, 1),
    "cesion-actual",
    "Cesión de derechos",
    rutTerceroRepetido,
  ).estado,
  "segundoUso",
);

const limiteAlcanzado = evaluarLimiteTerceroInmobiliario(
  gestiones,
  "nuda-propiedad-actual",
  "Compraventa de nuda propiedad",
  rutTerceroRepetido,
);
assert.equal(limiteAlcanzado.estado, "limiteAlcanzado");
assert.equal(limiteAlcanzado.usosPrevios, 2);
assert.deepEqual(
  limiteAlcanzado.gestionesCoincidentes.map((gestion) => gestion.id),
  ["compraventa-1", "aporte-2"],
);
assert.equal(
  evaluarLimiteTerceroInmobiliario(
    gestiones,
    "liquidacion-actual",
    "Liquidación de sociedad conyugal",
    rutTerceroRepetido,
  ).estado,
  "disponible",
);

console.log("✓ Límite del tercero en escrituras inmobiliarias válido");
console.log("  6 tipos de escritura incluidos");
console.log("  Máximo 2 escrituras por RUT; liquidación y mandatos excluidos");
