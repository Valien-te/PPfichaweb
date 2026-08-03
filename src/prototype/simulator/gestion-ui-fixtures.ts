/**
 * Fixtures sintéticos que completan gestiones visibles del portal de demostración.
 *
 * Regla del escenario: si una tarjeta parte en `faltan_documentos`, sus pasos previos
 * deben contener datos coherentes con ese estado. Los fixtures viven en el simulador,
 * no en las pantallas, y nunca contienen antecedentes de personas reales.
 */

const CESION_HEREDITARIA_LISTA_PARA_DOCUMENTOS = {
  valoresEspecificos: {
    tipoAdquisicion: "herencia-inscrita",
    tipoContratoOriginal: "Compraventa de inmueble",
    cantidadHerederos: 3,
    inmueblesHeredados: [
      {
        direccion: "Av. Los Leones 1450, departamento 704",
        comuna: "Providencia",
        region: "Metropolitana",
      },
    ],
  },
  datosTercero: {
    nombres: "Marcela",
    apellidoPaterno: "Soto",
    apellidoMaterno: "Rivas",
    rut: "17.456.321-7",
    email: "marcela.soto@example.com",
    fechaNacimiento: "1988-03-12",
    nacionalidad: "Chilena",
    profesion: "Contadora auditora",
    estadoCivil: "Soltero/a",
    regimenMatrimonial: "",
    domicilio: "Los Militares 5620, departamento 804",
    comuna: "Las Condes",
    region: "Metropolitana",
    relacion: "amigo",
    vinculoComunidadHereditaria: "terceroAjeno" as const,
    plenamenteCapaz: "",
    ingresosEstables: "si",
    disponibilidadFirmaConjunta: "",
    tipoMandatoFirma: "",
    cantidadSenalesRiesgo: 0,
    aceptaRiesgosTransferencia: false,
  },
} as const;

const FIXTURES_GESTIONES_INICIALES = {
  "cesion-derechos-hereditarios": CESION_HEREDITARIA_LISTA_PARA_DOCUMENTOS,
} as const;

export function obtenerFixtureGestionInicial(gestionId: string) {
  const fixture =
    FIXTURES_GESTIONES_INICIALES[gestionId as keyof typeof FIXTURES_GESTIONES_INICIALES];
  if (!fixture) return undefined;

  return {
    valoresEspecificos: {
      ...fixture.valoresEspecificos,
      inmueblesHeredados: fixture.valoresEspecificos.inmueblesHeredados.map((inmueble) => ({
        ...inmueble,
      })),
    },
    datosTercero: { ...fixture.datosTercero },
  };
}
