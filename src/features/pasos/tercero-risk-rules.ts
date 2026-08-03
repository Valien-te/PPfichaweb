import { crearDocumentoRequerido, type DocumentoRequerido } from "./documentos-rules";

/**
 * Evaluación preventiva del tercero de confianza.
 *
 * Distingue impedimentos (no permiten continuar) de señales revisables (permiten
 * continuar con aceptación explícita). Esta evaluación orienta el prototipo; las
 * reglas definitivas y su fuente deben validarse con el equipo legal y TI.
 */
export type SenalRiesgoTerceroId = "menorDe21" | "parentescoDirecto" | "sinIngresosEstables";

export type SenalRiesgoTercero = {
  id: SenalRiesgoTerceroId;
  descripcion: string;
};

export type EvaluacionRiesgoTercero = {
  edad: number | null;
  senales: SenalRiesgoTercero[];
  impedimentos: string[];
};

type DatosEvaluacionRiesgoTercero = {
  fechaNacimiento: string;
  relacion: string;
  plenamenteCapaz: string;
  ingresosEstables: string;
};

const RELACIONES_CON_RIESGO = new Set(["hijo", "padreMadre", "hermano"]);
export const DOCUMENTO_CERTIFICADO_FACULTADES_MENTALES =
  "Certificado médico de facultades mentales emitido por psiquiatra o neurólogo";

export function calcularEdad(
  fechaNacimiento: string,
  fechaReferencia: Date = new Date(),
): number | null {
  const partes = fechaNacimiento.split("-").map(Number);
  if (partes.length !== 3) return null;

  const [anio, mes, dia] = partes;
  const fechaValida = new Date(Date.UTC(anio, mes - 1, dia));
  if (
    fechaValida.getUTCFullYear() !== anio ||
    fechaValida.getUTCMonth() !== mes - 1 ||
    fechaValida.getUTCDate() !== dia
  ) {
    return null;
  }

  let edad = fechaReferencia.getFullYear() - anio;
  const aunNoCumpleAnios =
    fechaReferencia.getMonth() + 1 < mes ||
    (fechaReferencia.getMonth() + 1 === mes && fechaReferencia.getDate() < dia);
  if (aunNoCumpleAnios) edad -= 1;

  return edad >= 0 ? edad : null;
}

export function debeEvaluarFacultadesMentales(
  fechaNacimiento: string,
  fechaReferencia?: Date,
): boolean {
  // La pregunta y el certificado aparecen solo sobre 60 años, no desde los 60 inclusive.
  const edad = calcularEdad(fechaNacimiento, fechaReferencia);
  return edad !== null && edad > 60;
}

export function requiereCertificadoFacultadesMentales(
  fechaNacimiento: string,
  fechaReferencia?: Date,
): boolean {
  return debeEvaluarFacultadesMentales(fechaNacimiento, fechaReferencia);
}

export function resolverDocumentosFacultadesMentales(
  documentos: DocumentoRequerido[],
  fechaNacimiento: string,
  fechaReferencia?: Date,
): DocumentoRequerido[] {
  // Primero se quita una copia previa para que recalcular la regla sea idempotente.
  const documentosSinCertificado = documentos.filter(
    (documento) => documento.nombre !== DOCUMENTO_CERTIFICADO_FACULTADES_MENTALES,
  );

  return requiereCertificadoFacultadesMentales(fechaNacimiento, fechaReferencia)
    ? [
        ...documentosSinCertificado,
        crearDocumentoRequerido(DOCUMENTO_CERTIFICADO_FACULTADES_MENTALES),
      ]
    : documentosSinCertificado;
}

export function evaluarRiesgoTercero(
  datos: DatosEvaluacionRiesgoTercero,
  fechaReferencia?: Date,
): EvaluacionRiesgoTercero {
  const edad = calcularEdad(datos.fechaNacimiento, fechaReferencia);
  const senales: SenalRiesgoTercero[] = [];
  const impedimentos: string[] = [];

  if (datos.relacion === "conyuge") {
    // El cónyuge es un impedimento, no una advertencia aceptable.
    impedimentos.push(
      "Tu cónyuge no puede recibir esta transferencia. Elige a otra persona para continuar.",
    );
  }
  if (
    debeEvaluarFacultadesMentales(datos.fechaNacimiento, fechaReferencia) &&
    datos.plenamenteCapaz === "no"
  ) {
    impedimentos.push(
      "Según lo que indicaste, esta persona no está legalmente habilitada para participar en la transferencia.",
    );
  }
  if (edad !== null && edad < 21) {
    // Tener entre 18 y 20 años no incapacita, pero puede exigir más antecedentes.
    senales.push({
      id: "menorDe21",
      descripcion:
        "Esta persona tiene menos de 21 años y podrían solicitarse más antecedentes sobre la compra.",
    });
  }
  if (RELACIONES_CON_RIESGO.has(datos.relacion)) {
    senales.push({
      id: "parentescoDirecto",
      descripcion: "Elegiste a un familiar directo.",
    });
  }
  if (datos.ingresosEstables === "no") {
    senales.push({
      id: "sinIngresosEstables",
      descripcion: "Esta persona no tiene ingresos estables para justificar la compra.",
    });
  }

  return { edad, senales, impedimentos };
}
