import assert from "node:assert/strict";

import {
  DOCUMENTO_ANOTACIONES_VIGENTES,
  DOCUMENTO_CONSTITUCION_PRENDA,
  DOCUMENTO_CONSTITUCION_SOCIEDAD,
  DOCUMENTO_COPIA_CONTRATO,
  DOCUMENTO_DOMINIO_VIGENTE,
  DOCUMENTO_HIPOTECAS_GRAVAMENES,
  DOCUMENTO_INSCRIPCION_ANOTACIONES_MARGINALES,
  DOCUMENTO_INSCRIPCION_CONSERVATORIA,
  DOCUMENTO_INSCRIPCION_PADRON,
  DOCUMENTO_LIBRO_ACCIONISTAS,
  DOCUMENTO_POSESION_EFECTIVA,
  DOCUMENTO_VIGENCIA_SOCIEDAD,
  resolverDocumentosGestion,
} from "../src/features/pasos/documentos-rules";

const documentosInmueble = [
  DOCUMENTO_DOMINIO_VIGENTE,
  DOCUMENTO_INSCRIPCION_CONSERVATORIA,
  DOCUMENTO_HIPOTECAS_GRAVAMENES,
];
const documentosVehiculo = [DOCUMENTO_ANOTACIONES_VIGENTES, DOCUMENTO_INSCRIPCION_PADRON];
const documentosSociedad = [
  DOCUMENTO_CONSTITUCION_SOCIEDAD,
  DOCUMENTO_INSCRIPCION_ANOTACIONES_MARGINALES,
  DOCUMENTO_VIGENCIA_SOCIEDAD,
  DOCUMENTO_LIBRO_ACCIONISTAS,
];

function nombres(nombreContrato: string, valores: Record<string, unknown> = {}) {
  return resolverDocumentosGestion(nombreContrato, valores).map((documento) => documento.nombre);
}

for (const contrato of [
  "Compraventa de inmueble",
  "Compraventa de inmueble y usufructo",
  "Cesión de derechos",
  "Compraventa de nuda propiedad",
  "Cancelación y Alzamiento de Hipoteca",
  "Aporte inmobiliario SRL",
]) {
  assert.deepEqual(nombres(contrato), documentosInmueble, contrato);
}

assert.deepEqual(nombres("Cesión de derechos hereditarios"), [
  ...documentosInmueble,
  DOCUMENTO_POSESION_EFECTIVA,
]);
assert.deepEqual(
  nombres("Cesión de derechos hereditarios", {
    inmueblesHeredados: [{ direccion: "Los Alerces 245" }, { direccion: "Av. Costanera 980" }],
  }),
  [
    ...documentosInmueble.map((nombre) => `${nombre} — Los Alerces 245`),
    ...documentosInmueble.map((nombre) => `${nombre} — Av. Costanera 980`),
    DOCUMENTO_POSESION_EFECTIVA,
  ],
);

assert.deepEqual(nombres("Compraventa de vehículo"), documentosVehiculo);
assert.deepEqual(nombres("Cancelación y Alzamiento de Prenda"), [
  ...documentosVehiculo,
  DOCUMENTO_CONSTITUCION_PRENDA,
]);
assert.deepEqual(nombres("Transferencia de vehículo RC"), ["Comprobante de transferencia"]);

assert.deepEqual(nombres("Liquidación de sociedad conyugal"), []);
assert.deepEqual(
  nombres("Liquidación de sociedad conyugal", {
    comproVehiculo: "si",
    liquidacionVehiculos: [{ patente: "AB CD 12" }, { patente: "EF GH 34" }],
    comproInmueble: "si",
    liquidacionInmuebles: [{ direccion: "Los Boldos 120" }, { direccion: "Av. Los Carrera 450" }],
  }),
  [
    ...documentosVehiculo.map((nombre) => `${nombre} — AB CD 12`),
    ...documentosVehiculo.map((nombre) => `${nombre} — EF GH 34`),
    ...documentosInmueble.map((nombre) => `${nombre} — Los Boldos 120`),
    ...documentosInmueble.map((nombre) => `${nombre} — Av. Los Carrera 450`),
  ],
);

for (const contrato of [
  "Compraventa de acciones (Régimen tradicional)",
  "Compraventa de establecimiento comercial",
]) {
  assert.deepEqual(nombres(contrato), documentosSociedad, contrato);
}

assert.deepEqual(
  nombres("Compraventa de patente comercial", {
    formaConstitucionSociedadPatente: "escrituraPublica",
  }),
  documentosSociedad,
);
assert.deepEqual(
  nombres("Compraventa de patente comercial", {
    formaConstitucionSociedadPatente: "empresaEnUnDia",
  }),
  [],
);
assert.deepEqual(nombres("Contrato de arriendo"), [DOCUMENTO_DOMINIO_VIGENTE]);
assert.deepEqual(nombres("Resciliación"), [DOCUMENTO_COPIA_CONTRATO]);
assert.equal(
  nombres("Renuncia a los gananciales").some((nombre) =>
    nombre.toLocaleLowerCase("es-CL").includes("cédula"),
  ),
  false,
);

for (const contrato of [
  "Compraventa de bienes muebles",
  "Comodato de bienes muebles",
  "Declaración jurada de Allegado",
  "Pacto de sustitución de régimen matrimonial",
  "Compraventa de acciones (Empresa en un Día)",
  "Constitución de sociedades",
]) {
  assert.deepEqual(nombres(contrato), [], contrato);
}

const documentosPrincipal = resolverDocumentosGestion("Compraventa de inmueble");
assert.deepEqual(
  resolverDocumentosGestion("Mandato", {}, documentosPrincipal),
  documentosPrincipal,
);
assert.deepEqual(
  resolverDocumentosGestion("Mandato con autocontrato", {}, documentosPrincipal),
  documentosPrincipal,
);

for (const documento of [
  ...resolverDocumentosGestion("Cesión de derechos hereditarios"),
  ...resolverDocumentosGestion("Cancelación y Alzamiento de Prenda"),
  ...resolverDocumentosGestion("Compraventa de acciones (Régimen tradicional)"),
  ...resolverDocumentosGestion("Resciliación"),
]) {
  assert.notEqual(
    documento.instruccionesObtencion,
    "Solicita este documento a la institución o persona que lo emitió y sube una copia legible.",
    documento.nombre,
  );
}

console.log("✓ Requisitos documentales válidos");
console.log("  Reglas estáticas, condicionales, por bien y de mandatos cubiertas");
