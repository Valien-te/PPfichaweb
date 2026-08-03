import { esTransferenciaVehiculoRegistroCivil } from "./registro-civil-vehiculo-rules";

/**
 * Máquina de estados para transferencias de vehículos con prenda.
 *
 * Solo un vehículo sin prenda vigente puede continuar. Entre una y tres cuotas al día
 * deja la gestión en espera; la mora, más de tres cuotas o un alzamiento pendiente la
 * bloquean. En Transferencia de vehículo RC, además bloquea el permiso de circulación
 * vencido; en la compraventa notarial ese permiso no impide preparar el contrato.
 */

export const CONTRATO_COMPRAVENTA_VEHICULO = "Compraventa de vehículo";

export type CuotasPendientesPrenda = "1" | "2" | "3" | "masDe3" | "deudaPagada";

export type EstadoPrendaVehiculo =
  | "sinPrenda"
  | "incompleto"
  | "esperaAlzamiento"
  | "bloqueadoPorMora"
  | "bloqueadoPorPlazo"
  | "bloqueadoPorPlazoYMora"
  | "bloqueadoPorAlzamiento";

type ValoresPrendaVehiculo = {
  prenda?: unknown;
  deudaPrendaAlDia?: unknown;
  cuotasPendientesPrenda?: unknown;
};

function normalizarContrato(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .replace(/\s+/g, " ")
    .trim();
}

export function esContratoTransferenciaVehiculo(nombreContrato: string): boolean {
  const contrato = normalizarContrato(nombreContrato);
  return (
    contrato === normalizarContrato(CONTRATO_COMPRAVENTA_VEHICULO) ||
    esTransferenciaVehiculoRegistroCivil(nombreContrato)
  );
}

export function permisoCirculacionBloqueaTransferencia(
  nombreContrato: string,
  permisoAlDia: unknown,
): boolean {
  return esTransferenciaVehiculoRegistroCivil(nombreContrato) && permisoAlDia === "no";
}

export function resolverEstadoPrendaVehiculo(valores: ValoresPrendaVehiculo): EstadoPrendaVehiculo {
  // Se devuelve "incompleto" mientras falte una respuesta necesaria para clasificar.
  if (valores.prenda === "no") return "sinPrenda";
  if (valores.prenda !== "si") return "incompleto";
  if (
    valores.cuotasPendientesPrenda !== "1" &&
    valores.cuotasPendientesPrenda !== "2" &&
    valores.cuotasPendientesPrenda !== "3" &&
    valores.cuotasPendientesPrenda !== "masDe3" &&
    valores.cuotasPendientesPrenda !== "deudaPagada"
  ) {
    return "incompleto";
  }
  if (valores.cuotasPendientesPrenda === "deudaPagada") {
    return "bloqueadoPorAlzamiento";
  }
  if (valores.deudaPrendaAlDia !== "si" && valores.deudaPrendaAlDia !== "no") {
    return "incompleto";
  }
  if (valores.cuotasPendientesPrenda === "masDe3" && valores.deudaPrendaAlDia === "no") {
    // Se conserva un estado combinado para que el mensaje explique las dos causas.
    return "bloqueadoPorPlazoYMora";
  }
  if (valores.deudaPrendaAlDia === "no") return "bloqueadoPorMora";

  if (
    valores.cuotasPendientesPrenda === "1" ||
    valores.cuotasPendientesPrenda === "2" ||
    valores.cuotasPendientesPrenda === "3"
  ) {
    return "esperaAlzamiento";
  }

  if (valores.cuotasPendientesPrenda === "masDe3") return "bloqueadoPorPlazo";
  return "incompleto";
}

export function puedeContinuarTransferenciaVehiculo(valores: ValoresPrendaVehiculo): boolean {
  return resolverEstadoPrendaVehiculo(valores) === "sinPrenda";
}

export function puedeGuardarEsperaPrenda(valores: ValoresPrendaVehiculo): boolean {
  return resolverEstadoPrendaVehiculo(valores) === "esperaAlzamiento";
}

export function evaluacionPrendaCompleta(valores: ValoresPrendaVehiculo): boolean {
  return resolverEstadoPrendaVehiculo(valores) !== "incompleto";
}

export function debeGuardarEstadoTransferenciaVehiculo(
  nombreContrato: string,
  permisoAlDia: unknown,
  valores: ValoresPrendaVehiculo,
): boolean {
  if (!esContratoTransferenciaVehiculo(nombreContrato) || !evaluacionPrendaCompleta(valores)) {
    return false;
  }

  if (permisoCirculacionBloqueaTransferencia(nombreContrato, permisoAlDia)) {
    return true;
  }

  const estadoPrenda = resolverEstadoPrendaVehiculo(valores);
  return (
    estadoPrenda === "bloqueadoPorMora" ||
    estadoPrenda === "bloqueadoPorPlazo" ||
    estadoPrenda === "bloqueadoPorPlazoYMora" ||
    estadoPrenda === "bloqueadoPorAlzamiento"
  );
}
