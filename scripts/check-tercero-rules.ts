import assert from "node:assert/strict";

import {
  CONTRATO_CESION_DERECHOS,
  CONTRATO_CESION_DERECHOS_HEREDITARIOS,
  esAdquisicionPorHerencia,
  resolverTipoContratoInmueble,
} from "../src/features/adquisicion-rules";
import {
  agregarGestion,
  completarDatosEspecificos,
  completarOrientacionRegistroCivilVehiculo,
  completarTercero,
  getGestionState,
  marcarFichaEnviada,
  simularEstadoDocumento,
  sincronizarMandatoFirma,
} from "../src/features/gestiones-store";
import {
  crearValoresMandatoDesdeOrigen,
  obtenerTipoBienVinculado,
  sincronizarOrigenDesdeMandato,
} from "../src/features/pasos/bienes-vinculados-rules";
import {
  obtenerCoincidenciaApoderado,
  obtenerNombreMandatoFirma,
  requierenDefinirFirmaConjunta,
} from "../src/features/pasos/firma-mandato-rules";
import {
  DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL,
  esTransferenciaVehiculoRegistroCivil,
} from "../src/features/pasos/registro-civil-vehiculo-rules";
import {
  calcularEdad,
  debeEvaluarFacultadesMentales,
  DOCUMENTO_CERTIFICADO_FACULTADES_MENTALES,
  evaluarRiesgoTercero,
  requiereCertificadoFacultadesMentales,
  resolverDocumentosFacultadesMentales,
} from "../src/features/pasos/tercero-risk-rules";
import {
  debeMostrarPasoConyuge,
  debeMostrarPasoDocumentos,
  debeMostrarPasoTercero,
  debePedirAdministradorSociedad,
  debeSolicitarConyugeAdicional,
  debeSolicitarConyugeTercero,
  esContratoConSegundoSocio,
  esTransferenciaDeInmueble,
  obtenerModoCapturaTercero,
  obtenerPasoEntradaGestion,
  obtenerPrimerPasoPendienteGestion,
  obtenerSecuenciaPasosGestion,
  requiereDatosAdministradorSociedad,
} from "../src/features/pasos/tercero-rules";
import {
  CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL,
  CONTRATO_PACTO_SUSTITUCION_REGIMEN,
  REGIMEN_DESTINO_PACTO_SUSTITUCION,
  resolverContratoSegunBienesMatrimonio,
} from "../src/features/regimen-patrimonial-rules";
import {
  CONTRATOS_DISPONIBLES,
  generarGestionDesdePlantilla,
} from "../src/features/simulator/generador-gestiones";

const contratosConConyugeCondicional = [
  "Aporte inmobiliario SRL",
  "Compraventa de inmueble",
  "Compraventa de inmueble y usufructo",
  "Compraventa de nuda propiedad",
  "Cesión de derechos",
  "Cesión de derechos hereditarios",
  "Mandato",
  "Mandato con autocontrato",
];

// La tarjeta mock parte en Documentos, por lo que todos los pasos previos deben
// contener antecedentes sintéticos completos y revisables.
const cesionHereditariaMock = getGestionState("cesion-derechos-hereditarios");
assert.equal(cesionHereditariaMock?.fichaEnviada, true);
assert.equal(cesionHereditariaMock?.datosPersonalesConfirmados, true);
assert.equal(cesionHereditariaMock?.datosEspecificosCompletos, true);
assert.equal(cesionHereditariaMock?.terceroCompleto, true);
assert.deepEqual(cesionHereditariaMock?.valoresEspecificos?.inmueblesHeredados, [
  {
    direccion: "Av. Los Leones 1450, departamento 704",
    comuna: "Providencia",
    region: "Metropolitana",
  },
]);
assert.equal(cesionHereditariaMock?.valoresEspecificos?.cantidadHerederos, 3);
assert.equal(cesionHereditariaMock?.datosTercero?.rut, "17.456.321-7");
assert.equal(cesionHereditariaMock?.datosTercero?.vinculoComunidadHereditaria, "terceroAjeno");

for (const contrato of contratosConConyugeCondicional) {
  assert.equal(obtenerModoCapturaTercero(contrato), "terceroConConyugeCondicional");
  assert.equal(debeSolicitarConyugeAdicional(contrato, "Casado/a", "Sociedad Conyugal"), true);
  assert.equal(debeMostrarPasoConyuge(contrato, "Casado/a", "Sociedad Conyugal"), true);
  assert.equal(debeMostrarPasoTercero(contrato), true);
  assert.equal(
    debeSolicitarConyugeAdicional(contrato, "Acuerdo de Unión Civil", "Comunidad de Bienes"),
    true,
  );
  assert.equal(debeSolicitarConyugeAdicional(contrato, "Casado/a", "Separación de Bienes"), false);
  assert.equal(debeSolicitarConyugeAdicional(contrato, "Soltero/a", ""), false);
}

for (const contrato of [
  "Pacto de sustitución de régimen matrimonial",
  "Liquidación de sociedad conyugal",
  "Renuncia a los gananciales",
]) {
  assert.equal(obtenerModoCapturaTercero(contrato), "soloConyuge");
  assert.equal(debeSolicitarConyugeAdicional(contrato, "Casado/a", "Sociedad Conyugal"), false);
  assert.equal(debeMostrarPasoConyuge(contrato, "Soltero/a", ""), true);
  assert.equal(debeMostrarPasoTercero(contrato), false);
}

for (const contrato of [
  "Compraventa de acciones (Régimen tradicional)",
  "Compraventa de vehículo",
  "Contrato de arriendo",
]) {
  assert.equal(obtenerModoCapturaTercero(contrato), "soloTercero");
  assert.equal(debeSolicitarConyugeAdicional(contrato, "Casado/a", "Sociedad Conyugal"), false);
  assert.equal(debeMostrarPasoConyuge(contrato, "Casado/a", "Sociedad Conyugal"), false);
  assert.equal(debeMostrarPasoTercero(contrato), true);
}

assert.equal(
  debeSolicitarConyugeAdicional(
    "  COMPRAVENTA DE INMUEBLE Y USUFRUCTO  ",
    "casado/A",
    "sociedad CONYUGAL",
  ),
  true,
);
assert.equal(esTransferenciaDeInmueble("Compraventa de inmueble"), true);
assert.equal(esTransferenciaDeInmueble("Cesión de derechos hereditarios"), true);
assert.equal(esTransferenciaDeInmueble("Compraventa de vehículo"), false);
assert.equal(
  debeSolicitarConyugeTercero(
    "Compraventa de inmueble",
    "Casado/a",
    "Sociedad conyugal (comunidad de bienes)",
  ),
  true,
);
assert.equal(
  debeSolicitarConyugeTercero(
    "Cesión de derechos hereditarios",
    "Acuerdo de Unión Civil",
    "Comunidad de bienes",
  ),
  true,
);
assert.equal(
  debeSolicitarConyugeTercero("Cesión de derechos", "Casado/a", "Separación de bienes"),
  false,
);
assert.equal(
  debeSolicitarConyugeTercero(
    "Compraventa de vehículo",
    "Casado/a",
    "Sociedad conyugal (comunidad de bienes)",
  ),
  false,
);

assert.deepEqual(
  obtenerSecuenciaPasosGestion("Compraventa de inmueble", true, "Casado/a", "Sociedad Conyugal"),
  ["datos-personales", "conyuge", "datos-especificos", "tercero", "documentos"],
);
assert.deepEqual(obtenerSecuenciaPasosGestion("Resciliación", false, "Soltero/a", ""), [
  "datos-personales",
  "tercero",
  "documentos",
]);
const pasosMandato = obtenerSecuenciaPasosGestion("Mandato", true, "Soltero/a", "");
assert.equal(
  obtenerPrimerPasoPendienteGestion(pasosMandato, {
    datosPersonalesConfirmados: true,
    conyugeCompleto: false,
    datosEspecificosCompletos: false,
    terceroCompleto: false,
  }),
  "datos-especificos",
);
assert.equal(
  obtenerPrimerPasoPendienteGestion(pasosMandato, {
    datosPersonalesConfirmados: true,
    conyugeCompleto: false,
    datosEspecificosCompletos: true,
    terceroCompleto: false,
  }),
  "tercero",
);
assert.equal(
  obtenerPrimerPasoPendienteGestion(pasosMandato, {
    datosPersonalesConfirmados: true,
    conyugeCompleto: false,
    datosEspecificosCompletos: true,
    terceroCompleto: true,
  }),
  "documentos",
);
assert.equal(
  obtenerPasoEntradaGestion(
    pasosMandato,
    {
      datosPersonalesConfirmados: true,
      conyugeCompleto: false,
      datosEspecificosCompletos: true,
      terceroCompleto: true,
    },
    false,
  ),
  "tercero",
);
assert.equal(
  obtenerPasoEntradaGestion(
    pasosMandato,
    {
      datosPersonalesConfirmados: true,
      conyugeCompleto: false,
      datosEspecificosCompletos: true,
      terceroCompleto: true,
    },
    true,
  ),
  "documentos",
);
assert.deepEqual(
  obtenerSecuenciaPasosGestion("Renuncia a los gananciales", false, "Divorciado/a", ""),
  ["datos-personales", "conyuge", "documentos"],
);
assert.equal(obtenerModoCapturaTercero("Resciliación"), "soloTercero");
assert.equal(obtenerModoCapturaTercero("Transferencia de vehículo RC"), "registroCivilVehiculo");
assert.equal(esTransferenciaVehiculoRegistroCivil(" transferencia DE VEHICULO rc "), true);
assert.equal(esTransferenciaVehiculoRegistroCivil("Compraventa de vehículo"), false);
assert.equal(esContratoConSegundoSocio("Constitución de sociedades"), true);
assert.equal(debeMostrarPasoDocumentos("Constitución de sociedades"), false);
assert.equal(debeMostrarPasoDocumentos("Compraventa de bienes muebles"), false);
assert.equal(debeMostrarPasoDocumentos("Comodato de bienes muebles"), false);
assert.equal(debeMostrarPasoDocumentos("Compraventa de inmueble"), true);
assert.equal(obtenerModoCapturaTercero("Constitución de sociedades"), "segundoSocio");
assert.equal(debeMostrarPasoTercero("Constitución de sociedades", "eirl"), false);
assert.equal(debeMostrarPasoTercero("Constitución de sociedades", "spa"), true);
assert.equal(debePedirAdministradorSociedad("eirl"), false);
assert.equal(debePedirAdministradorSociedad(undefined), false);
assert.equal(debePedirAdministradorSociedad("spa"), true);
assert.equal(debePedirAdministradorSociedad("sa"), true);
assert.equal(debePedirAdministradorSociedad("limitada"), true);
assert.equal(requiereDatosAdministradorSociedad("spa", "otro"), true);
assert.equal(requiereDatosAdministradorSociedad("sa", "yo"), false);
assert.equal(requiereDatosAdministradorSociedad("limitada", "socio"), false);
assert.deepEqual(
  obtenerSecuenciaPasosGestion("Constitución de sociedades", true, "Soltero/a", "", "spa"),
  ["datos-personales", "datos-especificos", "tercero"],
);
assert.deepEqual(
  obtenerSecuenciaPasosGestion("Constitución de sociedades", true, "Soltero/a", "", "eirl"),
  ["datos-personales", "datos-especificos"],
);
assert.equal(CONTRATOS_DISPONIBLES.includes("Otro"), false);
assert.equal(CONTRATOS_DISPONIBLES.includes("Resciliación"), true);
assert.equal(CONTRATOS_DISPONIBLES.includes("Renuncia a los gananciales"), true);
assert.equal(
  CONTRATOS_DISPONIBLES.includes("Declaración jurada de dominio de bienes muebles"),
  false,
);
const resciliacion = generarGestionDesdePlantilla("Resciliación");
assert.equal(resciliacion.requiereDatosBien, false);
assert.equal("identificadorBien" in resciliacion, false);
assert.deepEqual(generarGestionDesdePlantilla("Constitución de sociedades").documentos, []);
assert.deepEqual(generarGestionDesdePlantilla("Compraventa de bienes muebles").documentos, []);
assert.deepEqual(generarGestionDesdePlantilla("Comodato de bienes muebles").documentos, []);
assert.deepEqual(
  generarGestionDesdePlantilla("Transferencia de vehículo RC").documentos.map(
    (documento) => documento.nombre,
  ),
  [DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL],
);
const transferenciaRegistroCivil = generarGestionDesdePlantilla("Transferencia de vehículo RC");
agregarGestion(transferenciaRegistroCivil);
completarOrientacionRegistroCivilVehiculo(transferenciaRegistroCivil.id);
const transferenciaRegistroCivilGuardada = getGestionState(transferenciaRegistroCivil.id);
assert.equal(transferenciaRegistroCivilGuardada?.terceroCompleto, true);
assert.equal(transferenciaRegistroCivilGuardada?.datosTercero, undefined);
assert.deepEqual(
  transferenciaRegistroCivilGuardada?.documentos.map((documento) => documento.nombre),
  [DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL],
);
assert.equal(
  transferenciaRegistroCivilGuardada?.documentosEstado[0]?.nombre,
  DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL,
);
assert.equal(transferenciaRegistroCivilGuardada?.documentosEstado[0]?.estadoRevision, undefined);
simularEstadoDocumento(
  transferenciaRegistroCivil.id,
  DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL,
  "pendiente",
);
assert.equal(
  getGestionState(transferenciaRegistroCivil.id)?.documentosEstado[0]?.estadoRevision,
  "pendiente",
);
assert.equal(
  getGestionState(transferenciaRegistroCivil.id)?.documentosEstado[0]?.nombreArchivo,
  "comprobante_de_transferencia.pdf",
);
simularEstadoDocumento(
  transferenciaRegistroCivil.id,
  DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL,
  "aprobado",
);
assert.equal(
  getGestionState(transferenciaRegistroCivil.id)?.documentosEstado[0]?.estadoRevision,
  "aprobado",
);
simularEstadoDocumento(
  transferenciaRegistroCivil.id,
  DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL,
  "rechazado",
);
assert.equal(
  getGestionState(transferenciaRegistroCivil.id)?.documentosEstado[0]?.estadoRevision,
  "rechazado",
);
assert.equal(
  getGestionState(transferenciaRegistroCivil.id)?.documentosEstado[0]?.motivoRechazo,
  "El documento está vencido. Sube una versión emitida durante el último mes.",
);
simularEstadoDocumento(
  transferenciaRegistroCivil.id,
  DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL,
  "sinCargar",
);
assert.equal(
  getGestionState(transferenciaRegistroCivil.id)?.documentosEstado[0]?.estadoRevision,
  undefined,
);
assert.equal(
  getGestionState(transferenciaRegistroCivil.id)?.documentosEstado[0]?.nombreArchivo,
  undefined,
);
assert.deepEqual(
  obtenerSecuenciaPasosGestion("Compraventa de bienes muebles", true, "Soltero/a", ""),
  ["datos-personales", "datos-especificos", "tercero"],
);
assert.deepEqual(
  obtenerSecuenciaPasosGestion("Comodato de bienes muebles", true, "Soltero/a", ""),
  ["datos-personales", "datos-especificos", "tercero"],
);
assert.deepEqual(
  obtenerSecuenciaPasosGestion("Transferencia de vehículo RC", true, "Soltero/a", ""),
  ["datos-personales", "datos-especificos", "tercero", "documentos"],
);
assert.equal(generarGestionDesdePlantilla("Renuncia a los gananciales").requiereDatosBien, false);
assert.deepEqual(obtenerSecuenciaPasosGestion("Compraventa de inmueble", true, "Soltero/a", ""), [
  "datos-personales",
  "datos-especificos",
  "tercero",
  "documentos",
]);
assert.deepEqual(
  obtenerSecuenciaPasosGestion(
    "Liquidación de sociedad conyugal",
    true,
    "Casado/a",
    "Sociedad Conyugal",
  ),
  ["datos-personales", "conyuge", "datos-especificos", "documentos"],
);
assert.deepEqual(
  obtenerSecuenciaPasosGestion(
    "Pacto de sustitución de régimen matrimonial",
    false,
    "Casado/a",
    "Sociedad Conyugal",
  ),
  ["datos-personales", "conyuge"],
);
assert.deepEqual(
  obtenerSecuenciaPasosGestion("Contrato de arriendo", true, "Casado/a", "Sociedad Conyugal"),
  ["datos-personales", "datos-especificos", "tercero", "documentos"],
);
assert.equal(
  debeSolicitarConyugeAdicional(
    "CESION DE DERECHOS HEREDITARIOS",
    "Acuerdo de Union Civil",
    "Comunidad de bienes",
  ),
  true,
);
assert.equal(esAdquisicionPorHerencia("herencia-inscrita"), true);
assert.equal(esAdquisicionPorHerencia("herencia-no-inscrita"), true);
assert.equal(esAdquisicionPorHerencia("con-credito"), false);
assert.equal(
  resolverTipoContratoInmueble("Compraventa de inmueble", "con-credito", "copropiedad"),
  CONTRATO_CESION_DERECHOS,
);
assert.equal(
  resolverTipoContratoInmueble("Compraventa de inmueble", "herencia-inscrita", "copropiedad"),
  CONTRATO_CESION_DERECHOS_HEREDITARIOS,
);
assert.equal(
  resolverTipoContratoInmueble("Compraventa de inmueble", "sin-credito", "propiedadExclusiva"),
  "Compraventa de inmueble",
);
assert.equal(
  resolverTipoContratoInmueble("Compraventa de inmueble", "con-credito"),
  "Compraventa de inmueble",
);
assert.equal(CONTRATO_CESION_DERECHOS_HEREDITARIOS, "Cesión de derechos hereditarios");
for (const contrato of [
  "Compraventa de inmueble",
  "Compraventa de inmueble y usufructo",
  "Compraventa de nuda propiedad",
  "Cesión de derechos",
  "Cesión de derechos hereditarios",
  "Compraventa de vehículo",
  "Compraventa de bienes muebles",
  "Compraventa de acciones (Régimen tradicional)",
]) {
  assert.equal(requierenDefinirFirmaConjunta("Metropolitana", "Valparaíso", contrato), true);
}
assert.equal(
  requierenDefinirFirmaConjunta("metropolitana", "Metropolitana", "Compraventa de inmueble"),
  false,
);
for (const contrato of [
  "Transferencia de vehículo RC",
  "Comodato de bienes muebles",
  "Aporte inmobiliario SRL",
  "Compraventa de acciones (Empresa en un Día)",
]) {
  assert.equal(requierenDefinirFirmaConjunta("Metropolitana", "Valparaíso", contrato), false);
}
assert.equal(obtenerNombreMandatoFirma("autocontrato"), "Mandato con autocontrato");
assert.equal(obtenerNombreMandatoFirma("mandatoGeneral"), "Mandato");
assert.equal(
  obtenerCoincidenciaApoderado("15.234.567-8", "15234567-8", "11.111.111-1"),
  "personaContratante",
);
assert.equal(
  obtenerCoincidenciaApoderado("11.111.111-1", "15.234.567-8", "11111111-1"),
  "otraParte",
);
assert.equal(
  obtenerCoincidenciaApoderado("13.456.789-0", "15.234.567-8", "11.111.111-1"),
  undefined,
);
assert.equal(obtenerCoincidenciaApoderado("", "15.234.567-8", "11.111.111-1"), undefined);

assert.equal(obtenerTipoBienVinculado("Compraventa de vehículo"), "vehiculo");
assert.equal(obtenerTipoBienVinculado("Compraventa de acciones (Régimen tradicional)"), "acciones");
assert.equal(obtenerTipoBienVinculado("Compraventa de acciones (Empresa en un Día)"), undefined);
assert.deepEqual(
  crearValoresMandatoDesdeOrigen("Compraventa de inmueble", {
    direccion: "Av. Providencia 1234",
    comuna: "Providencia",
    region: "Metropolitana",
  }),
  {
    mandatoInmuebles: true,
    mandatoVehiculos: false,
    mandatoMuebles: false,
    mandatoAcciones: false,
    mandatoInmueblesDetalle: [
      {
        direccion: "Av. Providencia 1234",
        comuna: "Providencia",
        region: "Metropolitana",
      },
    ],
    direccion: "Av. Providencia 1234",
    comuna: "Providencia",
    region: "Metropolitana",
  },
);
assert.deepEqual(
  sincronizarOrigenDesdeMandato(
    "Compraventa de vehículo",
    { patente: "ABCD12", permisoAlDia: "si", prenda: "no" },
    { patente: "WXYZ34", permisoAlDia: "no", prenda: "si" },
  ),
  { patente: "WXYZ34", permisoAlDia: "no", prenda: "si" },
);
assert.deepEqual(
  sincronizarOrigenDesdeMandato(
    "Cesión de derechos hereditarios",
    { cantidadHerederos: 2 },
    {
      mandatoInmueblesDetalle: [
        { direccion: "Los Alerces 10", comuna: "Temuco", region: "La Araucanía" },
        { direccion: "Los Robles 20", comuna: "Valdivia", region: "Los Ríos" },
      ],
    },
  ),
  {
    cantidadHerederos: 2,
    direccion: "Los Alerces 10",
    comuna: "Temuco",
    region: "La Araucanía",
    inmueblesHeredados: [
      { direccion: "Los Alerces 10", comuna: "Temuco", region: "La Araucanía" },
      { direccion: "Los Robles 20", comuna: "Valdivia", region: "Los Ríos" },
    ],
  },
);
assert.deepEqual(
  crearValoresMandatoDesdeOrigen("Compraventa de bienes muebles", {
    bienesSingularizados: [
      { cantidad: 2, tipoBien: "Televisor", marca: "Samsung", color: "Negro" },
      { cantidad: 1, tipoBien: "Computador", marca: "Lenovo", color: "Gris" },
    ],
  }).bienesSingularizados,
  [
    { cantidad: 2, tipoBien: "Televisor", marca: "Samsung", color: "Negro" },
    { cantidad: 1, tipoBien: "Computador", marca: "Lenovo", color: "Gris" },
  ],
);
assert.deepEqual(
  sincronizarOrigenDesdeMandato(
    "Compraventa de bienes muebles",
    { bienesSingularizados: [] },
    {
      bienesSingularizados: [{ cantidad: 1, tipoBien: "Mesa", marca: "Rosen", color: "Café" }],
    },
  ),
  {
    bienesSingularizados: [{ cantidad: 1, tipoBien: "Mesa", marca: "Rosen", color: "Café" }],
  },
);
assert.deepEqual(
  crearValoresMandatoDesdeOrigen("Compraventa de acciones (Régimen tradicional)", {
    razonSocial: "Inversiones Ejemplo SpA",
    rutEmpresa: "76.123.456-7",
    tipoSocietarioAcciones: "spa",
    numeroAcciones: 400,
  }),
  {
    mandatoInmuebles: false,
    mandatoVehiculos: false,
    mandatoMuebles: false,
    mandatoAcciones: true,
    razonSocial: "Inversiones Ejemplo SpA",
    rutEmpresa: "76.123.456-7",
    tipoSocietarioAcciones: "spa",
    numeroAcciones: 400,
  },
);
assert.deepEqual(
  sincronizarOrigenDesdeMandato(
    "Compraventa de acciones (Régimen tradicional)",
    {
      razonSocial: "Inversiones Ejemplo SpA",
      rutEmpresa: "76.123.456-7",
      tipoSocietarioAcciones: "spa",
      numeroAcciones: 400,
    },
    {
      razonSocial: "Inversiones Ejemplo Limitada",
      rutEmpresa: "76.123.456-7",
      tipoSocietarioAcciones: "srl",
      participacion: 40,
    },
  ),
  {
    razonSocial: "Inversiones Ejemplo Limitada",
    rutEmpresa: "76.123.456-7",
    tipoSocietarioAcciones: "srl",
    participacion: 40,
  },
);

completarDatosEspecificos("compraventa-inmueble", {
  direccion: "Av. Providencia 1234",
  comuna: "Providencia",
  region: "Metropolitana",
});
completarTercero("compraventa-inmueble", {
  nombres: "Camila",
  apellidoPaterno: "Soto",
  apellidoMaterno: "Rojas",
  rut: "15.234.567-8",
  email: "camila.soto@example.com",
  fechaNacimiento: "1985-04-10",
  nacionalidad: "Chilena",
  profesion: "Ingeniera",
  estadoCivil: "Soltero/a",
  regimenMatrimonial: "",
  domicilio: "Los Alerces 100",
  comuna: "Viña del Mar",
  region: "Valparaíso",
  relacion: "amigo",
  plenamenteCapaz: "",
  ingresosEstables: "si",
  disponibilidadFirmaConjunta: "no",
  tipoMandatoFirma: "autocontrato",
  cantidadSenalesRiesgo: 0,
  aceptaRiesgosTransferencia: false,
});
sincronizarMandatoFirma("compraventa-inmueble", "autocontrato");
const mandatoVinculado = getGestionState("compraventa-inmueble-mandato-firma");
assert.equal(mandatoVinculado?.gestionOrigenId, "compraventa-inmueble");
assert.equal(mandatoVinculado?.nombre, "Mandato con autocontrato");
assert.equal(mandatoVinculado?.estado, "pendiente_datos");
assert.equal(mandatoVinculado?.fichaEnviada, false);
assert.equal(mandatoVinculado?.datosEspecificosCompletos, false);
assert.equal(mandatoVinculado?.terceroCompleto, false);
assert.equal(mandatoVinculado?.datosTercero?.rut, "15.234.567-8");
assert.deepEqual(mandatoVinculado?.valoresEspecificos?.mandatoInmueblesDetalle, [
  {
    direccion: "Av. Providencia 1234",
    comuna: "Providencia",
    region: "Metropolitana",
  },
]);
assert.deepEqual(
  mandatoVinculado?.documentosEstado.map((documento) => documento.nombre),
  getGestionState("compraventa-inmueble")?.documentosEstado.map((documento) => documento.nombre),
);
const documentoCompartido = mandatoVinculado?.documentosEstado[0]?.nombre;
assert.ok(documentoCompartido);
simularEstadoDocumento("compraventa-inmueble", documentoCompartido, "pendiente");
assert.equal(
  getGestionState("compraventa-inmueble-mandato-firma")?.documentosEstado[0]?.estadoRevision,
  "pendiente",
);
simularEstadoDocumento("compraventa-inmueble-mandato-firma", documentoCompartido, "aprobado");
assert.equal(
  getGestionState("compraventa-inmueble")?.documentosEstado[0]?.estadoRevision,
  "aprobado",
);

completarDatosEspecificos("compraventa-inmueble-mandato-firma", {
  mandatoInmuebles: true,
  mandatoVehiculos: false,
  mandatoMuebles: false,
  mandatoInmueblesDetalle: [
    {
      direccion: "Av. Apoquindo 4501",
      comuna: "Las Condes",
      region: "Metropolitana",
    },
  ],
});
const datosAutocontrato = getGestionState("compraventa-inmueble-mandato-firma")?.datosTercero;
assert.ok(datosAutocontrato);
completarTercero("compraventa-inmueble-mandato-firma", datosAutocontrato);
assert.equal(getGestionState("compraventa-inmueble-mandato-firma")?.estado, "faltan_documentos");
assert.equal(
  getGestionState("compraventa-inmueble")?.valoresEspecificos?.direccion,
  "Av. Apoquindo 4501",
);

completarDatosEspecificos("compraventa-inmueble", {
  direccion: "Av. Vitacura 2909",
  comuna: "Vitacura",
  region: "Metropolitana",
});
assert.equal(
  (
    getGestionState("compraventa-inmueble-mandato-firma")?.valoresEspecificos
      ?.mandatoInmueblesDetalle as Array<{ direccion: string }>
  )[0]?.direccion,
  "Av. Vitacura 2909",
);
sincronizarMandatoFirma("compraventa-inmueble", "mandatoGeneral");
const mandatoGeneralVinculado = getGestionState("compraventa-inmueble-mandato-firma");
assert.equal(mandatoGeneralVinculado?.nombre, "Mandato");
assert.equal(mandatoGeneralVinculado?.estado, "pendiente_datos");
assert.equal(mandatoGeneralVinculado?.fichaEnviada, false);
assert.equal(mandatoGeneralVinculado?.datosEspecificosCompletos, false);
assert.equal(mandatoGeneralVinculado?.terceroCompleto, false);
assert.equal(mandatoGeneralVinculado?.datosTercero, undefined);
assert.equal(
  mandatoGeneralVinculado?.documentosEstado.find(
    (documento) => documento.nombre === documentoCompartido,
  )?.estadoRevision,
  "aprobado",
);
sincronizarMandatoFirma("compraventa-inmueble", "autocontrato");
assert.equal(
  getGestionState("compraventa-inmueble-mandato-firma")?.nombre,
  "Mandato con autocontrato",
);
sincronizarMandatoFirma("compraventa-inmueble", "mandatoGeneral");
const datosOtorgante = getGestionState("compraventa-inmueble")?.datosTercero;
assert.ok(datosOtorgante);
completarTercero(
  "compraventa-inmueble-mandato-firma",
  {
    ...datosOtorgante,
    nombres: "Pablo",
    apellidoPaterno: "Contreras",
    apellidoMaterno: "Díaz",
    rut: "13.456.789-0",
    email: "pablo.contreras@example.com",
    otorganteMandato: "tercero",
  },
  undefined,
  datosOtorgante,
);
assert.equal(
  getGestionState("compraventa-inmueble-mandato-firma")?.datosTercero?.otorganteMandato,
  "tercero",
);
assert.equal(
  getGestionState("compraventa-inmueble-mandato-firma")?.datosOtorganteMandato?.rut,
  "15.234.567-8",
);
sincronizarMandatoFirma("compraventa-inmueble", undefined);
assert.equal(
  resolverContratoSegunBienesMatrimonio(CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL, "no", "no"),
  CONTRATO_PACTO_SUSTITUCION_REGIMEN,
);
assert.equal(REGIMEN_DESTINO_PACTO_SUSTITUCION, "separacionDeBienes");
assert.equal(
  resolverContratoSegunBienesMatrimonio(CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL, "si", "no"),
  CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL,
);
assert.equal(
  resolverContratoSegunBienesMatrimonio(CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL, "no", "si"),
  CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL,
);
assert.equal(
  resolverContratoSegunBienesMatrimonio(CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL, "no", undefined),
  CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL,
);

const fechaReferencia = new Date(2026, 6, 22);
assert.equal(calcularEdad("2005-07-22", fechaReferencia), 21);
assert.equal(calcularEdad("2005-07-23", fechaReferencia), 20);
assert.equal(calcularEdad("fecha-invalida", fechaReferencia), null);
assert.equal(debeEvaluarFacultadesMentales("1966-07-22", fechaReferencia), false);
assert.equal(debeEvaluarFacultadesMentales("1965-07-22", fechaReferencia), true);
assert.equal(requiereCertificadoFacultadesMentales("1965-07-22", fechaReferencia), true);
assert.equal(requiereCertificadoFacultadesMentales("1966-07-22", fechaReferencia), false);
assert.deepEqual(
  resolverDocumentosFacultadesMentales(
    [{ nombre: "Antecedentes de respaldo de la gestión", instruccionesObtencion: "" }],
    "1965-07-22",
    fechaReferencia,
  ).map((documento) => documento.nombre),
  ["Antecedentes de respaldo de la gestión", DOCUMENTO_CERTIFICADO_FACULTADES_MENTALES],
);
assert.deepEqual(
  resolverDocumentosFacultadesMentales(
    [
      { nombre: "Antecedentes de respaldo de la gestión", instruccionesObtencion: "" },
      { nombre: DOCUMENTO_CERTIFICADO_FACULTADES_MENTALES, instruccionesObtencion: "" },
    ],
    "1965-07-22",
    fechaReferencia,
  ).map((documento) => documento.nombre),
  ["Antecedentes de respaldo de la gestión", DOCUMENTO_CERTIFICADO_FACULTADES_MENTALES],
);

const gestionParaEnviar = {
  ...generarGestionDesdePlantilla("Contrato de arriendo"),
  id: "gestion-prueba-ficha-enviada",
};
agregarGestion(gestionParaEnviar);
assert.equal(getGestionState(gestionParaEnviar.id)?.fichaEnviada, false);
marcarFichaEnviada(gestionParaEnviar.id);
assert.equal(getGestionState(gestionParaEnviar.id)?.fichaEnviada, true);

const terceroRiesgoAlto = evaluarRiesgoTercero(
  {
    fechaNacimiento: "2008-04-10",
    relacion: "hijo",
    plenamenteCapaz: "si",
    ingresosEstables: "no",
  },
  fechaReferencia,
);
assert.deepEqual(
  terceroRiesgoAlto.senales.map((senal) => senal.id),
  ["menorDe21", "parentescoDirecto", "sinIngresosEstables"],
);
assert.deepEqual(
  terceroRiesgoAlto.senales.map((senal) => senal.descripcion),
  [
    "Esta persona tiene menos de 21 años y podrían solicitarse más antecedentes sobre la compra.",
    "Elegiste a un familiar directo.",
    "Esta persona no tiene ingresos estables para justificar la compra.",
  ],
);
assert.equal(terceroRiesgoAlto.impedimentos.length, 0);

assert.deepEqual(
  evaluarRiesgoTercero(
    {
      fechaNacimiento: "1965-06-15",
      relacion: "amigo",
      plenamenteCapaz: "no",
      ingresosEstables: "si",
    },
    fechaReferencia,
  ).impedimentos,
  [
    "Según lo que indicaste, esta persona no está legalmente habilitada para participar en la transferencia.",
  ],
);
assert.deepEqual(
  evaluarRiesgoTercero(
    {
      fechaNacimiento: "1965-06-15",
      relacion: "amigo",
      plenamenteCapaz: "si",
      ingresosEstables: "si",
    },
    fechaReferencia,
  ).impedimentos,
  [],
);
assert.deepEqual(
  evaluarRiesgoTercero(
    {
      fechaNacimiento: "1985-06-15",
      relacion: "conyuge",
      plenamenteCapaz: "si",
      ingresosEstables: "si",
    },
    fechaReferencia,
  ).impedimentos,
  ["Tu cónyuge no puede recibir esta transferencia. Elige a otra persona para continuar."],
);

console.log("✓ Reglas de tercero y cónyuge válidas");
console.log(`  ${contratosConConyugeCondicional.length} contratos con cónyuge condicional`);
console.log("  3 contratos exclusivos de cónyuge");
