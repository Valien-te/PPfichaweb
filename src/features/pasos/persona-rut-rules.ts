/** Reglas comunes para comparar identidades por RUT dentro de las fichas. */

/** Compara el RUT sin puntos, guion, espacios ni diferencias de mayúsculas. */
export function normalizarRutParaComparacion(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function correspondenALaMismaPersona(primerRut: string, segundoRut: string): boolean {
  const primero = normalizarRutParaComparacion(primerRut);
  const segundo = normalizarRutParaComparacion(segundoRut);

  // Evita marcar coincidencias mientras la persona apenas comienza a escribir.
  return primero.length >= 2 && segundo.length >= 2 && primero === segundo;
}
