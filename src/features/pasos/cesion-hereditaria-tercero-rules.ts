/**
 * Reglas del Conservador para elegir a la persona cesionaria en una cesión de
 * derechos hereditarios.
 *
 * Vocabulario interno:
 * - `soloComunero`: debe elegirse a otra persona heredera de la misma herencia.
 * - `ambos`: puede elegirse a una persona heredera o a alguien externo.
 *
 * No existe una categoría activa de "solo tercero ajeno". La regla general para una
 * comuna no incluida en la matriz es `ambos`. Cuando hay varios inmuebles se aplica
 * la regla más restrictiva: basta una comuna `soloComunero` para exigir comunero.
 */
export type ReglaTerceroCesionHereditaria = "soloComunero" | "ambos";

export interface ReglaComunaCesionHereditaria {
  comuna: string;
  conservador?: string;
  regla: ReglaTerceroCesionHereditaria;
  reglaEspecifica: boolean;
}

export interface ResultadoReglaTerceroCesionHereditaria {
  regla: ReglaTerceroCesionHereditaria;
  comunasSoloComunero: string[];
  detalles: ReglaComunaCesionHereditaria[];
}

interface JurisdiccionConservador {
  conservador: string;
  comunas: readonly string[];
  regla: ReglaTerceroCesionHereditaria;
}

const JURISDICCIONES: readonly JurisdiccionConservador[] = [
  // Excepciones restrictivas confirmadas: exigen que la persona también sea heredera.
  {
    conservador: "San Miguel",
    regla: "soloComunero",
    comunas: [
      "San Miguel",
      "San Joaquín",
      "La Granja",
      "La Pintana",
      "San Ramón",
      "El Bosque",
      "Pedro Aguirre Cerda",
      "Lo Espejo",
      "San Bernardo",
    ],
  },
  { conservador: "Villa Alemana", regla: "soloComunero", comunas: ["Villa Alemana"] },
  // Jurisdicciones confirmadas que aceptan tanto comunero como persona externa.
  {
    conservador: "Arica",
    regla: "ambos",
    comunas: ["Arica", "Camarones", "Putre", "General Lagos"],
  },
  {
    conservador: "Antofagasta",
    regla: "ambos",
    comunas: ["Antofagasta", "Mejillones", "Sierra Gorda"],
  },
  { conservador: "Buin", regla: "ambos", comunas: ["Buin", "Paine"] },
  {
    conservador: "Calama",
    regla: "ambos",
    comunas: ["Calama", "Ollagüe", "San Pedro de Atacama"],
  },
  {
    conservador: "Curicó",
    regla: "ambos",
    comunas: ["Curicó", "Teno", "Romeral", "Molina", "Rauco", "Sagrada Familia"],
  },
  {
    conservador: "Llay-Llay y Catemu",
    regla: "ambos",
    comunas: ["Llay-Llay", "Catemu"],
  },
  {
    conservador: "Mariquina",
    regla: "ambos",
    comunas: ["Mariquina", "Máfil", "Lanco"],
  },
  { conservador: "Maullín", regla: "ambos", comunas: ["Maullín"] },
  {
    conservador: "Melipilla",
    regla: "ambos",
    comunas: ["Melipilla", "Alhué", "María Pinto", "San Pedro"],
  },
  {
    conservador: "Puente Alto",
    regla: "ambos",
    comunas: ["Puente Alto", "San José de Maipo", "Pirque"],
  },
  {
    conservador: "Puerto Montt",
    regla: "ambos",
    comunas: ["Puerto Montt", "Cochamó", "Maullín"],
  },
  {
    conservador: "Puerto Varas",
    regla: "ambos",
    comunas: ["Puerto Varas", "Llanquihue"],
  },
  {
    conservador: "Punta Arenas",
    regla: "ambos",
    comunas: ["Punta Arenas", "Río Verde", "San Gregorio", "Laguna Blanca"],
  },
  {
    conservador: "San Antonio",
    regla: "ambos",
    comunas: ["San Antonio", "Cartagena", "El Tabo", "El Quisco", "Algarrobo", "Santo Domingo"],
  },
  { conservador: "Santa Cruz", regla: "ambos", comunas: ["Santa Cruz"] },
  {
    conservador: "Santiago",
    regla: "ambos",
    comunas: [
      "Cerrillos",
      "Cerro Navia",
      "Colina",
      "Conchalí",
      "Estación Central",
      "Huechuraba",
      "Independencia",
      "La Florida",
      "La Reina",
      "Lampa",
      "Las Condes",
      "Lo Barnechea",
      "Lo Prado",
      "Macul",
      "Maipú",
      "Ñuñoa",
      "Peñalolén",
      "Providencia",
      "Pudahuel",
      "Quilicura",
      "Quinta Normal",
      "Recoleta",
      "Renca",
      "Santiago",
      "Til Til",
      "Vitacura",
    ],
  },
  {
    conservador: "Talca",
    regla: "ambos",
    comunas: ["Talca", "Pelarco", "Río Claro", "San Clemente", "Maule", "Pencahue", "San Rafael"],
  },
] as const;

function normalizarComuna(comuna: string): string {
  return comuna
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

const REGLAS_POR_COMUNA = new Map<string, Omit<ReglaComunaCesionHereditaria, "comuna">>();

for (const jurisdiccion of JURISDICCIONES) {
  for (const comuna of jurisdiccion.comunas) {
    const clave = normalizarComuna(comuna);
    if (!REGLAS_POR_COMUNA.has(clave)) {
      // La primera declaración prevalece si una comuna aparece en más de una jurisdicción.
      REGLAS_POR_COMUNA.set(clave, {
        conservador: jurisdiccion.conservador,
        regla: jurisdiccion.regla,
        reglaEspecifica: true,
      });
    }
  }
}

export function obtenerReglaComunaCesionHereditaria(comuna: string): ReglaComunaCesionHereditaria {
  const comunaLimpia = comuna.trim();
  const reglaEspecifica = REGLAS_POR_COMUNA.get(normalizarComuna(comunaLimpia));

  return reglaEspecifica
    ? { comuna: comunaLimpia, ...reglaEspecifica }
    : {
        comuna: comunaLimpia,
        // Decisión de producto: toda comuna no listada acepta ambas alternativas.
        regla: "ambos",
        reglaEspecifica: false,
      };
}

export function resolverReglaTerceroCesionHereditaria(
  inmuebles: unknown,
): ResultadoReglaTerceroCesionHereditaria {
  const comunas = Array.isArray(inmuebles)
    ? inmuebles
        .map((inmueble) =>
          inmueble && typeof inmueble === "object" && "comuna" in inmueble
            ? String((inmueble as { comuna?: unknown }).comuna ?? "").trim()
            : "",
        )
        .filter(Boolean)
    : [];

  const comunasUnicas = [
    ...new Map(comunas.map((comuna) => [normalizarComuna(comuna), comuna])).values(),
  ];
  const detalles = comunasUnicas.map(obtenerReglaComunaCesionHereditaria);
  const comunasSoloComunero = detalles
    .filter((detalle) => detalle.regla === "soloComunero")
    .map((detalle) => detalle.comuna);

  return {
    // Con varios inmuebles prevalece la restricción de cualquiera de sus comunas.
    regla: comunasSoloComunero.length > 0 ? "soloComunero" : "ambos",
    comunasSoloComunero,
    detalles,
  };
}
