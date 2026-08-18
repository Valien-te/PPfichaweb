/**
 * Variante de transferencia realizada directamente ante el Registro Civil.
 *
 * En este contrato el paso de tercero se reemplaza por instrucciones presenciales y
 * el único documento posterior es el comprobante emitido al ingresar la transferencia.
 */
export const CONTRATO_TRANSFERENCIA_VEHICULO_REGISTRO_CIVIL = "Transferencia de vehículo RC";

export const DOCUMENTO_COMPROBANTE_TRANSFERENCIA_REGISTRO_CIVIL = "Comprobante de transferencia";

export const URL_REQUISITOS_TRANSFERENCIA_REGISTRO_CIVIL =
  "https://www.chileatiende.gob.cl/fichas/3343-solicitar-la-transferencia-de-dominio-de-vehiculos-motorizados-ante-un-oficial-civil";

/**
 * El Registro Civil centraliza en esta ruta sus reservas presenciales, incluida la
 * opción Vehículos > Transferencia de vehículo. Se mantiene fuera de la vista para
 * que un eventual cambio institucional se actualice desde una sola fuente.
 */
export const URL_AGENDAR_TRANSFERENCIA_REGISTRO_CIVIL =
  "https://solicitudeswebrc.srcei.cl/ReservaDeHoraSRCEI/web/init.srcei";

function normalizarContrato(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .replace(/\s+/g, " ")
    .trim();
}

export function esTransferenciaVehiculoRegistroCivil(nombreContrato: string): boolean {
  return (
    normalizarContrato(nombreContrato) ===
    normalizarContrato(CONTRATO_TRANSFERENCIA_VEHICULO_REGISTRO_CIVIL)
  );
}
