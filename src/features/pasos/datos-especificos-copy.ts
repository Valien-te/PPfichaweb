interface PresentacionBienesMuebles {
  titulo: "Bienes a transferir" | "Bienes a proteger";
  descripcion: string;
}

function normalizarNombreContrato(nombreContrato: string) {
  return nombreContrato
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function obtenerPresentacionBienesMuebles(
  nombreContrato: string,
): PresentacionBienesMuebles | null {
  const nombreNormalizado = normalizarNombreContrato(nombreContrato);

  if (nombreNormalizado.includes("compraventa de bienes muebles")) {
    return {
      titulo: "Bienes a transferir",
      descripcion: "Incluye los bienes de mayor valor que se encuentren en tu hogar.",
    };
  }

  if (nombreNormalizado.includes("comodato de bienes muebles")) {
    return {
      titulo: "Bienes a proteger",
      descripcion: "Incluye los bienes de mayor valor que se encuentren en tu hogar.",
    };
  }

  return null;
}
