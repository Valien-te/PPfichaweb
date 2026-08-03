import { useCallback, useSyncExternalStore } from "react";

import {
  CONTRATO_CESION_DERECHOS_HEREDITARIOS,
  resolverTipoContratoInmueble,
  type TipoTitularidadInmueble,
} from "./adquisicion-rules";
import type { EstadoGestion, Gestion } from "./mock-data";
import { gestionesMock } from "./mock-data";
import {
  crearValoresMandatoDesdeOrigen,
  sincronizarOrigenDesdeMandato,
} from "./pasos/bienes-vinculados-rules";
import {
  crearDocumentoRequerido,
  documentoEstaCargado,
  type DocumentoRequerido,
  resolverDocumentosGestion,
} from "./pasos/documentos-rules";
import { obtenerNombreMandatoFirma, type TipoMandatoFirma } from "./pasos/firma-mandato-rules";
import {
  DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL,
  esTransferenciaVehiculoRegistroCivil,
} from "./pasos/registro-civil-vehiculo-rules";
import { resolverDocumentosFacultadesMentales } from "./pasos/tercero-risk-rules";
import {
  CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL,
  CONTRATO_PACTO_SUSTITUCION_REGIMEN,
  REGIMEN_DESTINO_PACTO_SUSTITUCION,
  resolverContratoSegunBienesMatrimonio,
} from "./regimen-patrimonial-rules";

/**
 * Store local del prototipo funcional.
 *
 * Coordina las respuestas, recalcula el avance y aplica las reglas puras al guardar.
 * También mantiene sincronizados contrato principal y mandato. No es un modelo de
 * persistencia productivo: el backend definitivo deberá aplicar las mismas invariantes
 * y autorizar cualquier reapertura de una ficha enviada.
 */

// ---------- tipos ----------

export type EstadoRevisionDocumento = "pendiente" | "aprobado" | "rechazado";
export type EstadoDocumentoSimulado = EstadoRevisionDocumento | "sinCargar";

export interface DocumentoEstado extends DocumentoRequerido {
  estadoRevision?: EstadoRevisionDocumento;
  nombreArchivo?: string;
  urlArchivo?: string;
  motivoRechazo?: string;
}

export interface TerceroDatos {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  email: string;
  fechaNacimiento: string;
  nacionalidad: string;
  profesion: string;
  estadoCivil: string;
  regimenMatrimonial: string;
  domicilio: string;
  comuna: string;
  region: string;
  relacion: string;
  vinculoComunidadHereditaria?: "comunero" | "terceroAjeno" | "";
  plenamenteCapaz: string;
  ingresosEstables: string;
  disponibilidadFirmaConjunta: string;
  tipoMandatoFirma: string;
  cantidadSenalesRiesgo: number;
  aceptaRiesgosTransferencia: boolean;
  otorganteMandato?: "" | "cliente" | "tercero";
  sentidoAutocontrato?: "" | "clientePorTercero" | "terceroPorCliente";
}

export type PersonaSociedadDatos = Pick<
  TerceroDatos,
  | "nombres"
  | "apellidoPaterno"
  | "apellidoMaterno"
  | "rut"
  | "email"
  | "fechaNacimiento"
  | "nacionalidad"
  | "profesion"
  | "estadoCivil"
  | "regimenMatrimonial"
  | "domicilio"
  | "comuna"
  | "region"
>;

export type SegundoSocioDatos = PersonaSociedadDatos & {
  cantidadAccionesSocio?: number;
  porcentajeDerechosSociales?: number;
};

export type AdministradorSociedadDatos = PersonaSociedadDatos;
export type ConyugeTerceroDatos = PersonaSociedadDatos;

export interface GestionState extends Gestion {
  datosPersonalesConfirmados: boolean;
  datosEspecificosCompletos: boolean;
  conyugeCompleto: boolean;
  terceroCompleto: boolean;
  documentosEstado: DocumentoEstado[];
  valoresEspecificos?: Record<string, unknown>;
  datosConyuge?: ConyugeDatos;
  datosTercero?: TerceroDatos;
  datosConyugeTercero?: ConyugeTerceroDatos;
  datosSegundoSocio?: SegundoSocioDatos;
  datosAdministradorSociedad?: AdministradorSociedadDatos;
  datosOtorganteMandato?: PersonaSociedadDatos;
  /** Gestión principal cuyos bienes comparte este mandato creado para la firma. */
  gestionOrigenId?: string;
  /** Nombre del contrato principal, usado para mantener la edición vinculada. */
  nombreContratoOrigen?: string;
  /** Mandato creado para resolver la firma de esta gestión principal. */
  gestionMandatoFirmaId?: string;
  /** Estado civil del cliente, copiado al confirmar datos personales */
  clienteEstadoCivil?: string;
  /** Régimen matrimonial del cliente, copiado al confirmar datos personales */
  clienteRegimenMatrimonial?: string;
}

// ---------- store ----------

let gestiones: GestionState[] = gestionesMock.map((g) => {
  const state: GestionState = {
    ...g,
    datosPersonalesConfirmados: g.estado !== "pendiente_datos",
    datosEspecificosCompletos: !g.requiereDatosBien || g.estado !== "pendiente_datos",
    conyugeCompleto: g.estado !== "pendiente_datos",
    terceroCompleto: g.estado !== "pendiente_datos",
    documentosEstado: g.documentos.map((documento) => ({
      ...documento,
      estadoRevision:
        g.estado === "en_revision" || g.estado === "completado" ? "aprobado" : undefined,
    })),
    valoresEspecificos: {},
  };
  // Todos los escenarios, incluso los precargados, usan la misma regla de avance.
  state.avance = calcularAvance(state);
  return state;
});

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): GestionState[] {
  return gestiones;
}

// El avance comunica progreso al cliente; no representa aprobación jurídica.
function calcularAvance(g: GestionState): number {
  if (g.estado === "en_revision" || g.estado === "completado") return 100;

  // La ficha parte en 10% porque ya contiene antecedentes traídos del ingreso previo.
  let avance = 10;

  if (g.datosPersonalesConfirmados) avance += 15; // 25%
  if (g.datosEspecificosCompletos) avance += 25; // 50%
  if (g.terceroCompleto) avance += 20; // 70%

  // Documentos
  if (g.documentosEstado && g.documentosEstado.length > 0) {
    const cargados = g.documentosEstado.filter(documentoEstaCargado).length;
    const total = g.documentosEstado.length;
    if (cargados === total && avance >= 70) {
      avance += 30; // 100%
    } else if (cargados > 0 && avance >= 70) {
      // Proporcional si ya completó datos y está subiendo docs
      avance += Math.round((cargados / total) * 20);
    }
  }

  return Math.min(avance, 100);
}

// ---------- acciones ----------

function updateGestion(id: string, updater: (g: GestionState) => GestionState) {
  gestiones = gestiones.map((g) => {
    if (g.id === id) {
      const updated = updater(g);
      updated.avance = calcularAvance(updated);
      return updated;
    }
    return g;
  });
  emitChange();
}

function reconciliarDocumentos(
  documentos: readonly DocumentoRequerido[],
  anteriores: readonly DocumentoEstado[],
): DocumentoEstado[] {
  // Una regla puede recalcular la lista sin perder archivos ni revisiones cuyo nombre persiste.
  const estadosAnteriores = new Map(anteriores.map((documento) => [documento.nombre, documento]));
  return documentos.map((documento) => estadosAnteriores.get(documento.nombre) ?? documento);
}

function obtenerIdsGestionesConDocumentosCompartidos(gestionId: string): Set<string> {
  const gestion = gestiones.find((item) => item.id === gestionId);
  if (!gestion) return new Set([gestionId]);

  const gestionVinculadaId = gestion.gestionOrigenId ?? gestion.gestionMandatoFirmaId;
  // Principal y mandato representan una sola carga documental desde dos accesos.
  return new Set([gestionId, ...(gestionVinculadaId ? [gestionVinculadaId] : [])]);
}

function actualizarGestionesConDocumentosCompartidos(
  gestionId: string,
  updater: (gestion: GestionState) => GestionState,
) {
  const ids = obtenerIdsGestionesConDocumentosCompartidos(gestionId);
  gestiones = gestiones.map((gestion) => {
    if (!ids.has(gestion.id)) return gestion;
    const actualizada = updater(gestion);
    actualizada.avance = calcularAvance(actualizada);
    return actualizada;
  });
  emitChange();
}

export interface ClienteDatos {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  fechaNacimiento: string;
  nacionalidad: string;
  estadoCivil: string;
  regimenMatrimonial: string;
  profesion: string;
  email: string;
  telefono: string;
  domicilio: string;
  comuna: string;
  region: string;
}

export interface ConyugeDatos {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  fechaNacimiento: string;
  nacionalidad: string;
  profesion: string;
  email: string;
  estadoCivil: string;
  regimenMatrimonial: string;
  domicilio: string;
  comuna: string;
  region: string;
}

let _clienteDatos: ClienteDatos = {
  nombres: "Ana",
  apellidoPaterno: "Pérez",
  apellidoMaterno: "González",
  rut: "12.345.678-9",
  fechaNacimiento: "1985-06-15",
  nacionalidad: "Chilena",
  estadoCivil: "Soltero/a",
  regimenMatrimonial: "",
  profesion: "Ingeniero Comercial",
  email: "ana@email.com",
  telefono: "+56 9 1234 5678",
  domicilio: "Av. Providencia 1234, Depto 502",
  comuna: "Providencia",
  region: "Metropolitana",
};

/** Siempre devuelve el estado actual de los datos del cliente (reactive-safe). */
export function getClienteDatos(): ClienteDatos {
  return _clienteDatos;
}

export function setClienteDatos(nuevosDatos: ClienteDatos) {
  _clienteDatos = { ...nuevosDatos };
  emitChange();
}

export function confirmarDatosPersonales(datos?: ClienteDatos) {
  if (datos) {
    _clienteDatos = { ...datos };
  }
  gestiones = gestiones.map((g) => {
    const updated = {
      ...g,
      datosPersonalesConfirmados: true,
      clienteEstadoCivil: _clienteDatos.estadoCivil,
      clienteRegimenMatrimonial: _clienteDatos.regimenMatrimonial,
    };
    updated.avance = calcularAvance(updated);
    return updated;
  });
  emitChange();
}

export function completarDatosEspecificos(gestionId: string, valores?: Record<string, unknown>) {
  gestiones = gestiones.map((g) => {
    if (g.id === gestionId) {
      const valoresAnteriores = g.valoresEspecificos ?? {};
      const tipoSociedadAnterior =
        typeof valoresAnteriores.tipoSociedad === "string" ? valoresAnteriores.tipoSociedad : "";
      const tipoSociedadNuevo =
        typeof valores?.tipoSociedad === "string" ? valores.tipoSociedad : tipoSociedadAnterior;
      const administradorAnterior =
        typeof valoresAnteriores.administradorSociedad === "string"
          ? valoresAnteriores.administradorSociedad
          : "";
      const administradorNuevo =
        typeof valores?.administradorSociedad === "string"
          ? valores.administradorSociedad
          : administradorAnterior;
      const esConstitucionSociedad = g.nombre
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes("constitucion de sociedad");
      const cambioTipoSociedad =
        esConstitucionSociedad &&
        Boolean(tipoSociedadAnterior) &&
        tipoSociedadAnterior !== tipoSociedadNuevo;
      const omiteSegundoSocio = esConstitucionSociedad && tipoSociedadNuevo === "eirl";
      const requiereAdministradorExterno =
        esConstitucionSociedad && !omiteSegundoSocio && administradorNuevo === "otro";
      const valoresEspecificos = {
        ...valoresAnteriores,
        ...valores,
      };
      if (esConstitucionSociedad) {
        delete valoresEspecificos.aportaBienes;
        delete valoresEspecificos.tipoBienAportado;
        delete valoresEspecificos.especificacionOtroBien;
        delete valoresEspecificos.porcentajeDerechosSociales;
        if (omiteSegundoSocio) {
          delete valoresEspecificos.administradorSociedad;
        }
      }
      const datosSegundoSocio =
        omiteSegundoSocio || cambioTipoSociedad ? undefined : g.datosSegundoSocio;
      const datosAdministradorSociedad =
        requiereAdministradorExterno && !cambioTipoSociedad
          ? g.datosAdministradorSociedad
          : undefined;
      const terceroCompleto = omiteSegundoSocio
        ? true
        : cambioTipoSociedad
          ? false
          : requiereAdministradorExterno
            ? Boolean(datosSegundoSocio && datosAdministradorSociedad)
            : Boolean(datosSegundoSocio) || g.terceroCompleto;
      const documentos = g.gestionOrigenId
        ? g.documentos
        : resolverDocumentosGestion(g.nombre, valoresEspecificos);
      const documentosEstado = reconciliarDocumentos(documentos, g.documentosEstado);
      const updated = {
        ...g,
        valoresEspecificos,
        documentos,
        documentosEstado,
        datosEspecificosCompletos: true,
        terceroCompleto,
        datosSegundoSocio,
        datosAdministradorSociedad,
        estado:
          g.estado === "esperando_alzamiento" || g.estado === "transferencia_bloqueada"
            ? ("pendiente_datos" as EstadoGestion)
            : g.estado,
      };
      if (updated.datosPersonalesConfirmados && updated.terceroCompleto) {
        updated.estado = "faltan_documentos" as EstadoGestion;
      }
      updated.avance = calcularAvance(updated);
      return updated;
    }
    return g;
  });

  const gestionActualizada = gestiones.find((gestion) => gestion.id === gestionId);
  if (gestionActualizada?.gestionOrigenId) {
    const origen = gestiones.find((gestion) => gestion.id === gestionActualizada.gestionOrigenId);
    if (origen) {
      const valoresOrigen = sincronizarOrigenDesdeMandato(
        origen.nombre,
        origen.valoresEspecificos ?? {},
        gestionActualizada.valoresEspecificos ?? {},
      );
      const valoresMandato = {
        ...(gestionActualizada.valoresEspecificos ?? {}),
        ...crearValoresMandatoDesdeOrigen(origen.nombre, valoresOrigen),
      };

      gestiones = gestiones.map((gestion) => {
        if (gestion.id === origen.id) {
          return { ...gestion, valoresEspecificos: valoresOrigen };
        }
        if (gestion.id === gestionActualizada.id) {
          return { ...gestion, valoresEspecificos: valoresMandato };
        }
        return gestion;
      });
    }
  } else if (gestionActualizada?.gestionMandatoFirmaId) {
    const mandato = gestiones.find(
      (gestion) => gestion.id === gestionActualizada.gestionMandatoFirmaId,
    );
    if (mandato) {
      const valoresMandato = {
        ...(mandato.valoresEspecificos ?? {}),
        ...crearValoresMandatoDesdeOrigen(
          gestionActualizada.nombre,
          gestionActualizada.valoresEspecificos ?? {},
        ),
      };
      gestiones = gestiones.map((gestion) =>
        gestion.id === mandato.id
          ? {
              ...gestion,
              valoresEspecificos: valoresMandato,
              documentos: gestionActualizada.documentos.map((documento) => ({ ...documento })),
              documentosEstado: gestionActualizada.documentosEstado.map((documento) => ({
                ...documento,
              })),
            }
          : gestion,
      );
    }
  }

  emitChange();
}

export function guardarGestionEnEsperaAlzamiento(
  gestionId: string,
  valores: Record<string, unknown>,
) {
  updateGestion(gestionId, (gestion) => ({
    ...gestion,
    valoresEspecificos: {
      ...(gestion.valoresEspecificos ?? {}),
      ...valores,
    },
    datosEspecificosCompletos: true,
    estado: "esperando_alzamiento",
  }));
}

export function guardarEstadoTransferenciaBloqueada(
  gestionId: string,
  valores: Record<string, unknown>,
) {
  updateGestion(gestionId, (gestion) => ({
    ...gestion,
    valoresEspecificos: {
      ...(gestion.valoresEspecificos ?? {}),
      ...valores,
    },
    datosEspecificosCompletos: true,
    estado: "transferencia_bloqueada",
  }));
}

export function actualizarRutaContratoInmueble(
  gestionId: string,
  valores: Record<string, unknown>,
) {
  updateGestion(gestionId, (gestion) => {
    const tipoContratoOriginal =
      typeof valores.tipoContratoOriginal === "string"
        ? valores.tipoContratoOriginal
        : gestion.nombre;
    const tipoAdquisicion =
      typeof valores.tipoAdquisicion === "string" ? valores.tipoAdquisicion : "";
    const tipoTitularidad =
      valores.tipoTitularidadInmueble === "propiedadExclusiva" ||
      valores.tipoTitularidadInmueble === "copropiedad"
        ? (valores.tipoTitularidadInmueble as TipoTitularidadInmueble)
        : undefined;
    const nombreResuelto = resolverTipoContratoInmueble(
      tipoContratoOriginal,
      tipoAdquisicion,
      tipoTitularidad,
    );
    const nombrePlantilla =
      nombreResuelto === CONTRATO_CESION_DERECHOS_HEREDITARIOS
        ? CONTRATO_CESION_DERECHOS_HEREDITARIOS
        : tipoContratoOriginal;
    const plantilla = gestionesMock.find(
      (item) =>
        item.nombre.toLocaleLowerCase("es-CL") === nombrePlantilla.toLocaleLowerCase("es-CL"),
    );
    const documentos = resolverDocumentosGestion(nombreResuelto, valores);
    const documentosEstado = reconciliarDocumentos(documentos, gestion.documentosEstado);

    return {
      ...gestion,
      ...(plantilla
        ? {
            resumen: plantilla.resumen,
            descripcion: plantilla.descripcion,
            requiereDatosBien: plantilla.requiereDatosBien,
            documentos,
            camposEspecificos: [...plantilla.camposEspecificos],
          }
        : {}),
      nombre: nombreResuelto,
      documentosEstado,
      valoresEspecificos: {
        ...valores,
        tipoContratoOriginal,
      },
      datosEspecificosCompletos: false,
      estado: "pendiente_datos" as EstadoGestion,
    };
  });
}

export function actualizarRutaContratoLiquidacion(
  gestionId: string,
  valores: Record<string, unknown>,
) {
  updateGestion(gestionId, (gestion) => {
    const tipoContratoOriginal =
      typeof valores.tipoContratoOriginal === "string"
        ? valores.tipoContratoOriginal
        : CONTRATO_LIQUIDACION_SOCIEDAD_CONYUGAL;
    const nombreResuelto = resolverContratoSegunBienesMatrimonio(
      tipoContratoOriginal,
      valores.comproInmueble,
      valores.comproVehiculo,
    );
    const cambiaAPacto = nombreResuelto === CONTRATO_PACTO_SUSTITUCION_REGIMEN;
    const valoresResueltos: Record<string, unknown> = {
      ...valores,
      tipoContratoOriginal,
      ...(cambiaAPacto ? { regimenMatrimonialDestino: REGIMEN_DESTINO_PACTO_SUSTITUCION } : {}),
    };
    delete valoresResueltos.nuevoRegimen;
    delete valoresResueltos.fechaMatrimonio;
    delete valoresResueltos.ciudadInscripcion;
    if (!cambiaAPacto) {
      delete valoresResueltos.regimenMatrimonialDestino;
    }

    const documentos = resolverDocumentosGestion(nombreResuelto, valoresResueltos);
    const documentosEstado = reconciliarDocumentos(documentos, gestion.documentosEstado);

    return {
      ...gestion,
      nombre: nombreResuelto,
      resumen: cambiaAPacto
        ? "Cambio del régimen patrimonial del matrimonio cuando no existen inmuebles ni vehículos que liquidar."
        : "Distribución de los bienes adquiridos durante el matrimonio al terminar la sociedad conyugal.",
      valoresEspecificos: {
        ...valoresResueltos,
      },
      documentos,
      documentosEstado,
      datosEspecificosCompletos: false,
      estado: "pendiente_datos" as EstadoGestion,
    };
  });
}

export function guardarDatosConyuge(
  gestionId: string,
  datosConyuge: ConyugeDatos,
  reemplazaTercero: boolean,
) {
  updateGestion(gestionId, (g) => {
    const updated = {
      ...g,
      conyugeCompleto: true,
      datosConyuge: { ...datosConyuge },
      terceroCompleto: reemplazaTercero ? true : g.terceroCompleto,
    };
    if (
      updated.datosPersonalesConfirmados &&
      updated.datosEspecificosCompletos &&
      updated.terceroCompleto
    ) {
      updated.estado = "faltan_documentos" as EstadoGestion;
    }
    return updated;
  });
}

export function completarTercero(
  gestionId: string,
  datosTercero?: TerceroDatos,
  datosConyugeTercero?: ConyugeTerceroDatos,
  datosOtorganteMandato?: PersonaSociedadDatos | null,
) {
  updateGestion(gestionId, (g) => {
    const documentos = datosTercero
      ? resolverDocumentosFacultadesMentales(g.documentos, datosTercero.fechaNacimiento)
      : g.documentos;
    const documentosAnteriores = new Map(
      g.documentosEstado.map((documento) => [documento.nombre, documento]),
    );
    const documentosEstado = documentos.map(
      (documento) => documentosAnteriores.get(documento.nombre) ?? documento,
    );
    const updated = {
      ...g,
      documentos,
      documentosEstado,
      terceroCompleto: true,
      datosTercero: datosTercero ? { ...datosTercero } : g.datosTercero,
      datosConyugeTercero: datosConyugeTercero ? { ...datosConyugeTercero } : undefined,
      datosOtorganteMandato:
        datosOtorganteMandato === null
          ? undefined
          : datosOtorganteMandato
            ? { ...datosOtorganteMandato }
            : g.datosOtorganteMandato,
    };
    if (updated.datosPersonalesConfirmados && updated.datosEspecificosCompletos) {
      updated.estado = "faltan_documentos" as EstadoGestion;
    }
    return updated;
  });

  const gestionActualizada = gestiones.find((gestion) => gestion.id === gestionId);
  const mandatoVinculado = gestiones.find(
    (gestion) => gestion.id === gestionActualizada?.gestionMandatoFirmaId,
  );
  if (mandatoVinculado) {
    updateGestion(mandatoVinculado.id, (gestion) => ({
      ...gestion,
      datosTercero:
        datosTercero && mandatoVinculado.nombre === obtenerNombreMandatoFirma("autocontrato")
          ? { ...datosTercero }
          : gestion.datosTercero,
      documentos: gestionActualizada?.documentos.map((documento) => ({ ...documento })) ?? [],
      documentosEstado:
        gestionActualizada?.documentosEstado.map((documento) => ({ ...documento })) ?? [],
    }));
  }
}

export function completarOrientacionRegistroCivilVehiculo(gestionId: string) {
  updateGestion(gestionId, (gestion) => {
    if (!esTransferenciaVehiculoRegistroCivil(gestion.nombre)) return gestion;

    const documentoAnterior = gestion.documentosEstado.find(
      (documento) => documento.nombre === DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL,
    );
    const documentos = [
      crearDocumentoRequerido(DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL),
    ];
    const updated = {
      ...gestion,
      documentos,
      documentosEstado: [documentoAnterior ?? documentos[0]],
      terceroCompleto: true,
      datosTercero: undefined,
      datosConyugeTercero: undefined,
      datosOtorganteMandato: undefined,
    };

    if (updated.datosPersonalesConfirmados && updated.datosEspecificosCompletos) {
      updated.estado = "faltan_documentos" as EstadoGestion;
    }

    return updated;
  });
}

export function completarSegundoSocio(
  gestionId: string,
  datosSegundoSocio: SegundoSocioDatos,
  datosAdministradorSociedad?: AdministradorSociedadDatos,
) {
  updateGestion(gestionId, (g) => {
    const updated = {
      ...g,
      terceroCompleto: true,
      datosSegundoSocio: { ...datosSegundoSocio },
      datosAdministradorSociedad: datosAdministradorSociedad
        ? { ...datosAdministradorSociedad }
        : undefined,
    };
    if (updated.datosPersonalesConfirmados && updated.datosEspecificosCompletos) {
      updated.estado = "faltan_documentos";
    }
    return updated;
  });
}

export function sincronizarMandatoFirma(gestionOrigenId: string, tipoMandato?: TipoMandatoFirma) {
  const mandatoId = `${gestionOrigenId}-mandato-firma`;
  const origen = gestiones.find((gestion) => gestion.id === gestionOrigenId);
  const mandatoAnterior = gestiones.find((gestion) => gestion.id === mandatoId);
  const sinMandatoAnterior = gestiones.filter((gestion) => gestion.id !== mandatoId);

  if (!tipoMandato || !origen) {
    const gestionesSinVinculo = sinMandatoAnterior.map((gestion) =>
      gestion.id === gestionOrigenId ? { ...gestion, gestionMandatoFirmaId: undefined } : gestion,
    );
    if (gestionesSinVinculo.length !== gestiones.length || origen?.gestionMandatoFirmaId) {
      gestiones = gestionesSinVinculo;
      emitChange();
    }
    return;
  }

  const nombre = obtenerNombreMandatoFirma(tipoMandato);
  const resumen =
    tipoMandato === "autocontrato"
      ? "Permite que una de las partes firme el contrato principal por sí misma y también en representación de la otra."
      : "Permite que tú o la otra persona otorguen poder a alguien para que firme en su nombre.";
  const documentos = origen.documentos.map((documento) => ({ ...documento }));
  const valoresEspecificos = {
    ...(mandatoAnterior?.valoresEspecificos ?? {}),
    ...crearValoresMandatoDesdeOrigen(origen.nombre, origen.valoresEspecificos ?? {}),
  };
  const nuevaGestion: GestionState = {
    ...mandatoAnterior,
    id: mandatoId,
    nombre,
    estado: mandatoAnterior?.estado ?? "pendiente_datos",
    fichaEnviada: mandatoAnterior?.fichaEnviada ?? false,
    avance: mandatoAnterior?.avance ?? 0,
    requiereDatosBien: true,
    resumen,
    descripcion: "Completa los datos necesarios para preparar la representación en la firma.",
    documentos,
    camposEspecificos: [],
    datosPersonalesConfirmados: true,
    datosEspecificosCompletos: mandatoAnterior?.datosEspecificosCompletos ?? false,
    conyugeCompleto: mandatoAnterior?.conyugeCompleto ?? false,
    terceroCompleto: mandatoAnterior?.terceroCompleto ?? false,
    documentosEstado: origen.documentosEstado.map((documento) => ({ ...documento })),
    valoresEspecificos,
    gestionOrigenId,
    nombreContratoOrigen: origen.nombre,
    datosTercero:
      tipoMandato === "autocontrato"
        ? origen.datosTercero
          ? { ...origen.datosTercero }
          : mandatoAnterior?.nombre === nombre
            ? mandatoAnterior.datosTercero
            : undefined
        : mandatoAnterior?.nombre === nombre
          ? mandatoAnterior.datosTercero
          : undefined,
    datosOtorganteMandato:
      tipoMandato === "mandatoGeneral" && mandatoAnterior?.nombre === nombre
        ? mandatoAnterior.datosOtorganteMandato
        : undefined,
  };
  nuevaGestion.avance = calcularAvance(nuevaGestion);

  gestiones = sinMandatoAnterior.flatMap((gestion) =>
    gestion.id === gestionOrigenId
      ? [{ ...gestion, gestionMandatoFirmaId: mandatoId }, nuevaGestion]
      : [gestion],
  );
  emitChange();
}

export function marcarDocumentoCargado(
  gestionId: string,
  nombreDoc: string,
  archivo: string,
  urlArchivo: string,
) {
  const urlsAnteriores = new Set<string>();
  actualizarGestionesConDocumentosCompartidos(gestionId, (g) => {
    const documentosEstado = g.documentosEstado.map((d) => {
      if (d.nombre !== nombreDoc) return d;
      if (d.urlArchivo?.startsWith("blob:") && d.urlArchivo !== urlArchivo) {
        urlsAnteriores.add(d.urlArchivo);
      }
      return {
        ...d,
        estadoRevision: "pendiente" as EstadoRevisionDocumento,
        nombreArchivo: archivo,
        urlArchivo,
        motivoRechazo: undefined,
      };
    });

    return {
      ...g,
      documentosEstado,
    };
  });
  urlsAnteriores.forEach((url) => URL.revokeObjectURL(url));
}

export function aprobarDocumento(gestionId: string, nombreDoc: string) {
  actualizarGestionesConDocumentosCompartidos(gestionId, (g) => ({
    ...g,
    documentosEstado: g.documentosEstado.map((documento) =>
      documento.nombre === nombreDoc
        ? { ...documento, estadoRevision: "aprobado", motivoRechazo: undefined }
        : documento,
    ),
  }));
}

export function rechazarDocumento(gestionId: string, nombreDoc: string, motivoRechazo: string) {
  actualizarGestionesConDocumentosCompartidos(gestionId, (g) => ({
    ...g,
    documentosEstado: g.documentosEstado.map((documento) =>
      documento.nombre === nombreDoc
        ? { ...documento, estadoRevision: "rechazado", motivoRechazo }
        : documento,
    ),
  }));
}

export function enviarGestion(gestionId: string) {
  updateGestion(gestionId, (g) => ({
    ...g,
    fichaEnviada: true,
    estado: "en_revision" as EstadoGestion,
  }));
}

export function marcarFichaEnviada(gestionId: string) {
  // Enviar bloquea la ficha. Si hay documentos, la gestión espera sus cargas antes de revisión.
  updateGestion(gestionId, (gestion) => ({
    ...gestion,
    fichaEnviada: true,
    estado:
      gestion.documentosEstado.length > 0 ? ("faltan_documentos" as EstadoGestion) : gestion.estado,
  }));
}

// ---------- simulador (panel demo) ----------

const MOTIVO_RECHAZO_DOCUMENTO_SIMULADO =
  "El documento está vencido. Sube una versión emitida durante el último mes.";

function crearNombreArchivoSimulado(nombreDocumento: string): string {
  return (
    nombreDocumento
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es-CL")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") + ".pdf"
  );
}

function crearUrlArchivoSimulado(nombreDocumento: string): string {
  return (
    "data:text/plain;charset=utf-8," +
    encodeURIComponent('Documento simulado para revisar el estado de "' + nombreDocumento + '".')
  );
}

export function simularEstadoDocumento(
  gestionId: string,
  nombreDocumento: string,
  estado: EstadoDocumentoSimulado,
) {
  // El simulador usa datos deterministas y replica el estado en la gestión vinculada.
  actualizarGestionesConDocumentosCompartidos(gestionId, (gestion) => {
    const documentosEstado = gestion.documentosEstado.map((documento) => {
      if (documento.nombre !== nombreDocumento) return documento;

      if (estado === "sinCargar") {
        if (documento.urlArchivo?.startsWith("blob:")) {
          URL.revokeObjectURL(documento.urlArchivo);
        }
        return {
          nombre: documento.nombre,
          instruccionesObtencion: documento.instruccionesObtencion,
        };
      }

      return {
        ...documento,
        estadoRevision: estado,
        nombreArchivo: documento.nombreArchivo ?? crearNombreArchivoSimulado(documento.nombre),
        urlArchivo: documento.urlArchivo ?? crearUrlArchivoSimulado(documento.nombre),
        motivoRechazo: estado === "rechazado" ? MOTIVO_RECHAZO_DOCUMENTO_SIMULADO : undefined,
      };
    });

    const gestionActualizada: GestionState = {
      ...gestion,
      estado: "faltan_documentos",
      datosPersonalesConfirmados: true,
      datosEspecificosCompletos: true,
      conyugeCompleto: true,
      terceroCompleto: true,
      documentosEstado,
    };
    gestionActualizada.avance = calcularAvance(gestionActualizada);
    return gestionActualizada;
  });
}

export function agregarGestion(nuevaGestion: Gestion) {
  const newState: GestionState = {
    ...nuevaGestion,
    datosPersonalesConfirmados: nuevaGestion.estado !== "pendiente_datos",
    datosEspecificosCompletos:
      !nuevaGestion.requiereDatosBien || nuevaGestion.estado !== "pendiente_datos",
    conyugeCompleto: nuevaGestion.estado !== "pendiente_datos",
    terceroCompleto: nuevaGestion.estado !== "pendiente_datos",
    documentosEstado: nuevaGestion.documentos.map((documento) => ({
      ...documento,
      estadoRevision:
        nuevaGestion.estado === "en_revision" || nuevaGestion.estado === "completado"
          ? "aprobado"
          : undefined,
    })),
    valoresEspecificos: {},
  };
  gestiones = [...gestiones, newState];
  emitChange();
}

export function actualizarEstadoGestion(gestionId: string, nuevoEstado: EstadoGestion) {
  updateGestion(gestionId, (g) => {
    let nuevoAvance: number;
    if (nuevoEstado === "pendiente_datos") nuevoAvance = 0;
    else if (nuevoEstado === "esperando_alzamiento") nuevoAvance = 50;
    else if (nuevoEstado === "transferencia_bloqueada") nuevoAvance = 50;
    else if (nuevoEstado === "faltan_documentos") nuevoAvance = 70;
    else nuevoAvance = 100;

    return {
      ...g,
      estado: nuevoEstado,
      fichaEnviada: ["faltan_documentos", "en_revision", "completado"].includes(nuevoEstado),
      avance: nuevoAvance,
      datosPersonalesConfirmados: nuevoEstado !== "pendiente_datos",
      datosEspecificosCompletos: !g.requiereDatosBien || nuevoEstado !== "pendiente_datos",
      conyugeCompleto: nuevoEstado !== "pendiente_datos",
      terceroCompleto: nuevoEstado !== "pendiente_datos",
      documentosEstado: g.documentosEstado.map((documento) => ({
        ...documento,
        estadoRevision:
          nuevoEstado === "en_revision" || nuevoEstado === "completado"
            ? "aprobado"
            : documento.estadoRevision,
      })),
    };
  });
}

export function eliminarGestion(gestionId: string) {
  gestiones = gestiones.filter((g) => g.id !== gestionId);
  emitChange();
}

// ---------- hooks ----------

export function useGestiones(): GestionState[] {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useGestion(id: string): GestionState | undefined {
  const all = useGestiones();
  return all.find((g) => g.id === id);
}

export function getGestionState(id: string): GestionState | undefined {
  return gestiones.find((gestion) => gestion.id === id);
}

export function useProgresoGeneral(): number {
  const all = useGestiones();
  if (all.length === 0) return 0;
  return Math.round(all.reduce((sum, g) => sum + g.avance, 0) / all.length);
}

export function useUpdateGestion() {
  return useCallback((id: string, updater: (g: GestionState) => GestionState) => {
    updateGestion(id, updater);
  }, []);
}
