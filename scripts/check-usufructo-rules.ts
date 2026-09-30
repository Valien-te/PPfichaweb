import assert from "node:assert/strict";

import {
  obtenerCoincidenciaRutUsufructuario,
  requierePasoUsufructo,
  usufructuarioCumpleMayoriaEdad,
} from "../src/features/pasos/usufructo-rules";

assert.equal(requierePasoUsufructo("Compraventa de inmueble y usufructo"), true);
assert.equal(requierePasoUsufructo("  COMPRAVENTA DE INMUEBLE Y USUFRUCTO "), true);
assert.equal(requierePasoUsufructo("Compraventa de inmueble"), false);

assert.equal(
  obtenerCoincidenciaRutUsufructuario("12.345.678-9", "12345678-9", "17.456.321-7"),
  "cliente",
);
assert.equal(
  obtenerCoincidenciaRutUsufructuario("17.456.321-7", "12.345.678-9", "17456321-7"),
  "terceroConfianza",
);
assert.equal(
  obtenerCoincidenciaRutUsufructuario("16.274.891-5", "12.345.678-9", "17.456.321-7"),
  null,
);

assert.equal(usufructuarioCumpleMayoriaEdad("1991-04-18"), true);
assert.equal(usufructuarioCumpleMayoriaEdad("2020-04-18"), false);

console.log("✓ Reglas de usufructo válidas");
