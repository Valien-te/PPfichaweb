import assert from "node:assert/strict";

import {
  debeGuardarEstadoTransferenciaVehiculo,
  esContratoTransferenciaVehiculo,
  evaluacionPrendaCompleta,
  permisoCirculacionBloqueaTransferencia,
  puedeContinuarTransferenciaVehiculo,
  puedeGuardarEsperaPrenda,
  resolverEstadoPrendaVehiculo,
} from "../src/features/pasos/vehiculo-prenda-rules";

assert.equal(esContratoTransferenciaVehiculo("Compraventa de vehículo"), true);
assert.equal(esContratoTransferenciaVehiculo(" transferencia DE vehículo rc "), true);
assert.equal(esContratoTransferenciaVehiculo("Cancelación y Alzamiento de Prenda"), false);
assert.equal(
  permisoCirculacionBloqueaTransferencia("Transferencia de vehículo RC", "no"),
  true,
);
assert.equal(
  permisoCirculacionBloqueaTransferencia("Transferencia de vehículo RC", "si"),
  false,
);
assert.equal(
  permisoCirculacionBloqueaTransferencia("Compraventa de vehículo", "no"),
  false,
);

assert.equal(resolverEstadoPrendaVehiculo({ prenda: "no" }), "sinPrenda");
assert.equal(puedeContinuarTransferenciaVehiculo({ prenda: "no" }), true);
assert.equal(evaluacionPrendaCompleta({ prenda: "no" }), true);
assert.equal(
  debeGuardarEstadoTransferenciaVehiculo(
    "Transferencia de vehículo RC",
    "no",
    { prenda: "no" },
  ),
  true,
);

assert.equal(
  resolverEstadoPrendaVehiculo({
    prenda: "si",
    deudaPrendaAlDia: "no",
    cuotasPendientesPrenda: "2",
  }),
  "bloqueadoPorMora",
);
assert.equal(
  debeGuardarEstadoTransferenciaVehiculo(
    "Compraventa de vehículo",
    "si",
    {
      prenda: "si",
      deudaPrendaAlDia: "no",
      cuotasPendientesPrenda: "2",
    },
  ),
  true,
);
assert.equal(
  resolverEstadoPrendaVehiculo({
    prenda: "si",
    deudaPrendaAlDia: "si",
    cuotasPendientesPrenda: "masDe3",
  }),
  "bloqueadoPorPlazo",
);
assert.equal(
  resolverEstadoPrendaVehiculo({
    prenda: "si",
    deudaPrendaAlDia: "no",
    cuotasPendientesPrenda: "masDe3",
  }),
  "bloqueadoPorPlazoYMora",
);

for (const cuotasPendientesPrenda of ["1", "2", "3"] as const) {
  const valores = {
    prenda: "si",
    deudaPrendaAlDia: "si",
    cuotasPendientesPrenda,
  };
  assert.equal(resolverEstadoPrendaVehiculo(valores), "esperaAlzamiento");
  assert.equal(puedeGuardarEsperaPrenda(valores), true);
  assert.equal(puedeContinuarTransferenciaVehiculo(valores), false);
}

assert.equal(
  resolverEstadoPrendaVehiculo({
    prenda: "si",
    deudaPrendaAlDia: "si",
    cuotasPendientesPrenda: "deudaPagada",
  }),
  "bloqueadoPorAlzamiento",
);
assert.equal(
  puedeGuardarEsperaPrenda({
    prenda: "si",
    deudaPrendaAlDia: "si",
    cuotasPendientesPrenda: "deudaPagada",
  }),
  false,
);

assert.equal(
  resolverEstadoPrendaVehiculo({ prenda: "si", deudaPrendaAlDia: "si" }),
  "incompleto",
);
assert.equal(
  evaluacionPrendaCompleta({ prenda: "si", deudaPrendaAlDia: "si" }),
  false,
);
assert.equal(
  debeGuardarEstadoTransferenciaVehiculo(
    "Transferencia de vehículo RC",
    "no",
    { prenda: "si", deudaPrendaAlDia: "si" },
  ),
  false,
);
assert.equal(
  resolverEstadoPrendaVehiculo({ prenda: "si", deudaPrendaAlDia: "no" }),
  "incompleto",
);

console.log("✓ Reglas de prenda vehicular válidas");
