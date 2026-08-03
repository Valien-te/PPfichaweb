import { obtenerIdentificadorGestion } from "../identificador-gestion-rules";

/**
 * Matriz documental única del prototipo.
 *
 * Toda pantalla y toda gestión debe resolver sus documentos desde este módulo. Aquí
 * se decide qué se solicita, cuándo se repite por cada bien y cómo se explica qué
 * acredita y dónde obtenerlo. La interfaz no debe mantener listas paralelas.
 *
 * Decisiones transversales:
 * - nunca se solicita la cédula de identidad como archivo;
 * - las instrucciones viven dentro de la plataforma y no dependen de enlaces externos;
 * - los certificados y antecedentes deben haber sido emitidos hace no más de un mes;
 * - los mandatos comparten documentos y estados con su contrato principal.
 */

export interface DocumentoRequerido {
  nombre: string;
  instruccionesObtencion: string;
}

export const DOCUMENTO_DOMINIO_VIGENTE = "Certificado de dominio vigente";
export const DOCUMENTO_INSCRIPCION_CONSERVATORIA = "Copia de la inscripción conservatoria";
export const DOCUMENTO_HIPOTECAS_GRAVAMENES = "Certificado de hipotecas y gravámenes";
export const DOCUMENTO_POSESION_EFECTIVA = "Certificado de posesión efectiva";
export const DOCUMENTO_ANOTACIONES_VIGENTES = "Certificado de anotaciones vigentes";
export const DOCUMENTO_INSCRIPCION_PADRON = "Certificado de inscripción o padrón";
export const DOCUMENTO_CONSTITUCION_PRENDA = "Escritura de constitución de prenda";
export const DOCUMENTO_CONSTITUCION_SOCIEDAD = "Escritura de constitución de sociedad";
export const DOCUMENTO_INSCRIPCION_ANOTACIONES_MARGINALES =
  "Copia de la inscripción con anotaciones marginales";
export const DOCUMENTO_VIGENCIA_SOCIEDAD = "Certificado de vigencia de la sociedad";
export const DOCUMENTO_LIBRO_ACCIONISTAS = "Libro de accionistas";
export const DOCUMENTO_COPIA_CONTRATO = "Copia del contrato";

const DOCUMENTOS_INMUEBLE = [
  DOCUMENTO_DOMINIO_VIGENTE,
  DOCUMENTO_INSCRIPCION_CONSERVATORIA,
  DOCUMENTO_HIPOTECAS_GRAVAMENES,
];

const DOCUMENTOS_VEHICULO = [DOCUMENTO_ANOTACIONES_VIGENTES, DOCUMENTO_INSCRIPCION_PADRON];

const DOCUMENTOS_SOCIEDAD_TRADICIONAL = [
  DOCUMENTO_CONSTITUCION_SOCIEDAD,
  DOCUMENTO_INSCRIPCION_ANOTACIONES_MARGINALES,
  DOCUMENTO_VIGENCIA_SOCIEDAD,
  DOCUMENTO_LIBRO_ACCIONISTAS,
];

const INSTRUCCIONES_POR_DOCUMENTO: Record<string, string> = {
  // El texto explica primero la finalidad del documento y luego su lugar de obtención.
  [DOCUMENTO_DOMINIO_VIGENTE]:
    "Acredita quién figura actualmente como dueño del inmueble. Debes obtenerlo en el Conservador de Bienes Raíces de la comuna donde está ubicado.",
  [DOCUMENTO_INSCRIPCION_CONSERVATORIA]:
    "Es una copia de la inscripción con la que el inmueble quedó registrado a nombre de su propietario. Debes obtenerla en el Conservador de Bienes Raíces de la comuna donde está ubicado.",
  [DOCUMENTO_HIPOTECAS_GRAVAMENES]:
    "Informa las hipotecas, gravámenes y otras cargas inscritas que afectan al inmueble. Debes obtenerlo en el Conservador de Bienes Raíces de la comuna donde está ubicado.",
  [DOCUMENTO_POSESION_EFECTIVA]:
    "Contiene los antecedentes de la posesión efectiva e identifica a las personas reconocidas como herederas. Debes obtenerlo en el sitio web o en una oficina del Registro Civil e Identificación.",
  [DOCUMENTO_ANOTACIONES_VIGENTES]:
    "Muestra los propietarios actuales y anteriores, las limitaciones al dominio y otras anotaciones del vehículo. Debes obtenerlo en el sitio web o en una oficina del Registro Civil e Identificación.",
  [DOCUMENTO_INSCRIPCION_PADRON]:
    "Identifica el vehículo y a su propietario registrado, e incluye datos como la patente, marca, modelo, motor y chasis. Debes obtenerlo en el sitio web o en una oficina del Registro Civil e Identificación.",
  [DOCUMENTO_CONSTITUCION_PRENDA]:
    "Es el documento mediante el cual se constituyó la prenda que afecta al bien. Puedes solicitar una copia en la notaría donde se firmó o en el Archivo Judicial correspondiente.",
  [DOCUMENTO_CONSTITUCION_SOCIEDAD]:
    "Contiene los estatutos y acuerdos con los que se creó la sociedad. Puedes solicitar una copia en la notaría donde se firmó o en el Archivo Judicial correspondiente.",
  [DOCUMENTO_INSCRIPCION_ANOTACIONES_MARGINALES]:
    "Muestra la inscripción original de la sociedad y las modificaciones anotadas posteriormente. Debes obtenerla en el Registro de Comercio del Conservador de Bienes Raíces del domicilio de la sociedad.",
  [DOCUMENTO_VIGENCIA_SOCIEDAD]:
    "Acredita que la sociedad continúa vigente y que no existe una anotación que indique su término. Debes obtenerlo en el Registro de Comercio del Conservador de Bienes Raíces del domicilio de la sociedad.",
  [DOCUMENTO_LIBRO_ACCIONISTAS]:
    "Es el registro que identifica a los accionistas, las acciones que poseen y las transferencias realizadas. Debes obtenerlo en el Servicio de Impuestos Internos, en línea o de forma presencial.",
  [DOCUMENTO_COPIA_CONTRATO]:
    "Es una copia del contrato que las partes quieren dejar sin efecto mediante la resciliación. Puedes solicitarla en la notaría donde se firmó o en el Archivo Judicial correspondiente.",
  "Antecedentes de respaldo de la gestión":
    "Reúne el contrato, certificado u otro antecedente que respalda esta gestión. Si no lo tienes, solicítalo a la institución o persona que lo emitió.",
  "Documento adicional (si aplica)":
    "Si cuentas con un antecedente adicional que respalda esta gestión, súbelo en una copia legible. Puedes solicitarlo a la institución o persona que lo emitió.",
  "Comprobante de transferencia":
    "Acredita que la solicitud de transferencia fue ingresada ante el Registro Civil. Sube el comprobante que te entregaron al realizar el trámite.",
  "Certificado médico de facultades mentales emitido por psiquiatra o neurólogo":
    "Acredita que la persona puede comprender y tomar decisiones por sí misma. Debes solicitarlo a un psiquiatra o neurólogo.",
};

const INSTRUCCION_POR_DEFECTO =
  "Solicita este documento a la institución o persona que lo emitió y sube una copia legible.";

function normalizarContrato(nombreContrato: string): string {
  return nombreContrato
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .replace(/\s+/g, " ")
    .trim();
}

function tieneRespuestaAfirmativa(valor: unknown): boolean {
  return normalizarContrato(typeof valor === "string" ? valor : "") === "si";
}

function obtenerBienes(valor: unknown): Array<Record<string, unknown>> {
  // Un elemento vacío conserva un requisito base mientras el bien aún no tiene detalle.
  if (!Array.isArray(valor) || valor.length === 0) return [{}];
  return valor.map((bien) =>
    bien && typeof bien === "object" ? (bien as Record<string, unknown>) : {},
  );
}

function crearDocumentosPorBien(
  nombres: readonly string[],
  tipoBien: "Inmueble" | "Vehículo",
  bienes: Array<Record<string, unknown>>,
): DocumentoRequerido[] {
  const contratoIdentificador =
    tipoBien === "Inmueble" ? "Compraventa de inmueble" : "Compraventa de vehículo";

  return bienes
    .map((bien, indice) =>
      nombres.map((nombre) => {
        const documento = crearDocumentoRequerido(nombre);
        const identificador =
          obtenerIdentificadorGestion(contratoIdentificador, bien) ?? `${tipoBien} ${indice + 1}`;
        // El identificador solo se agrega si hay más de un bien; con uno sería redundante.
        return bienes.length > 1
          ? { ...documento, nombre: `${documento.nombre} — ${identificador}` }
          : documento;
      }),
    )
    .flat();
}

export function crearDocumentoRequerido(nombre: string): DocumentoRequerido {
  return {
    nombre,
    instruccionesObtencion: INSTRUCCIONES_POR_DOCUMENTO[nombre] ?? INSTRUCCION_POR_DEFECTO,
  };
}

export function resolverDocumentosGestion(
  nombreContrato: string,
  valores: Record<string, unknown> = {},
  documentosContratoPrincipal: readonly DocumentoRequerido[] = [],
): DocumentoRequerido[] {
  const contrato = normalizarContrato(nombreContrato);
  let nombres: string[];

  if (
    contrato === normalizarContrato("Mandato") ||
    contrato === normalizarContrato("Mandato con autocontrato")
  ) {
    // Un mandato no genera otra carga: clona exactamente los requisitos del principal.
    return documentosContratoPrincipal.map((documento) => ({ ...documento }));
  }

  if (
    [
      "Compraventa de inmueble",
      "Compraventa de inmueble y usufructo",
      "Cesión de derechos",
      "Compraventa de nuda propiedad",
      "Cancelación y Alzamiento de Hipoteca",
      "Aporte inmobiliario SRL",
    ]
      .map(normalizarContrato)
      .includes(contrato)
  ) {
    nombres = DOCUMENTOS_INMUEBLE;
  } else if (contrato === normalizarContrato("Cesión de derechos hereditarios")) {
    // Los tres certificados se piden por inmueble; la posesión efectiva se pide una vez.
    return [
      ...crearDocumentosPorBien(
        DOCUMENTOS_INMUEBLE,
        "Inmueble",
        obtenerBienes(valores.inmueblesHeredados),
      ),
      crearDocumentoRequerido(DOCUMENTO_POSESION_EFECTIVA),
    ];
  } else if (contrato === normalizarContrato("Liquidación de sociedad conyugal")) {
    // Solo se crean requisitos para las categorías de bienes que la persona declaró.
    return [
      ...(tieneRespuestaAfirmativa(valores.comproVehiculo)
        ? crearDocumentosPorBien(
            DOCUMENTOS_VEHICULO,
            "Vehículo",
            obtenerBienes(valores.liquidacionVehiculos),
          )
        : []),
      ...(tieneRespuestaAfirmativa(valores.comproInmueble)
        ? crearDocumentosPorBien(
            DOCUMENTOS_INMUEBLE,
            "Inmueble",
            obtenerBienes(valores.liquidacionInmuebles),
          )
        : []),
    ];
  } else if (contrato === normalizarContrato("Compraventa de vehículo")) {
    nombres = DOCUMENTOS_VEHICULO;
  } else if (contrato === normalizarContrato("Cancelación y Alzamiento de Prenda")) {
    nombres = [...DOCUMENTOS_VEHICULO, DOCUMENTO_CONSTITUCION_PRENDA];
  } else if (contrato === normalizarContrato("Transferencia de vehículo RC")) {
    nombres = ["Comprobante de transferencia"];
  } else if (
    contrato === normalizarContrato("Compraventa de acciones (Régimen tradicional)") ||
    contrato === normalizarContrato("Compraventa de establecimiento comercial")
  ) {
    nombres = DOCUMENTOS_SOCIEDAD_TRADICIONAL;
  } else if (contrato === normalizarContrato("Compraventa de patente comercial")) {
    // Empresa en un Día no requiere documentos; la constitución notarial usa la matriz societaria.
    nombres =
      valores.formaConstitucionSociedadPatente === "escrituraPublica"
        ? DOCUMENTOS_SOCIEDAD_TRADICIONAL
        : [];
  } else if (contrato === normalizarContrato("Contrato de arriendo")) {
    nombres = [DOCUMENTO_DOMINIO_VIGENTE];
  } else if (contrato === normalizarContrato("Resciliación")) {
    nombres = [DOCUMENTO_COPIA_CONTRATO];
  } else if (
    [
      "Compraventa de bienes muebles",
      "Comodato de bienes muebles",
      "Declaración jurada de Allegado",
      "Pacto de sustitución de régimen matrimonial",
      "Compraventa de acciones (Empresa en un Día)",
      "Constitución de sociedades",
    ]
      .map(normalizarContrato)
      .includes(contrato)
  ) {
    nombres = [];
  } else {
    // Respaldo defensivo para contratos nuevos: evita una etapa vacía no intencional.
    // Todo contrato nuevo debe reemplazar esta salida por una decisión legal explícita.
    nombres = ["Antecedentes de respaldo de la gestión", "Documento adicional (si aplica)"];
  }

  return nombres.map(crearDocumentoRequerido);
}

export function documentoEstaCargado(documento: { nombreArchivo?: string }): boolean {
  return Boolean(documento.nombreArchivo);
}
