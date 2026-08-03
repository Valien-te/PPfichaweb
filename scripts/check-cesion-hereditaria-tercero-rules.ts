import {
  obtenerReglaComunaCesionHereditaria,
  resolverReglaTerceroCesionHereditaria,
} from "../src/features/pasos/cesion-hereditaria-tercero-rules";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const comunasSoloComunero = [
  "San Miguel",
  "San Joaquín",
  "La Granja",
  "La Pintana",
  "San Ramón",
  "El Bosque",
  "Pedro Aguirre Cerda",
  "Lo Espejo",
  "San Bernardo",
  "Villa Alemana",
];

for (const comuna of comunasSoloComunero) {
  assert(
    obtenerReglaComunaCesionHereditaria(comuna).regla === "soloComunero",
    `${comuna} debe aceptar únicamente a otra persona heredera.`,
  );
}

const comunasAmbos = [
  "Arica",
  "Camarones",
  "Putre",
  "General Lagos",
  "Antofagasta",
  "Mejillones",
  "Sierra Gorda",
  "Buin",
  "Paine",
  "Calama",
  "Ollagüe",
  "San Pedro de Atacama",
  "Curicó",
  "Teno",
  "Romeral",
  "Molina",
  "Rauco",
  "Sagrada Familia",
  "Llay-Llay",
  "Catemu",
  "Mariquina",
  "Máfil",
  "Lanco",
  "Maullín",
  "Melipilla",
  "Alhué",
  "María Pinto",
  "San Pedro",
  "Puente Alto",
  "San José de Maipo",
  "Pirque",
  "Puerto Montt",
  "Cochamó",
  "Puerto Varas",
  "Llanquihue",
  "Punta Arenas",
  "Río Verde",
  "San Gregorio",
  "Laguna Blanca",
  "San Antonio",
  "Cartagena",
  "El Tabo",
  "El Quisco",
  "Algarrobo",
  "Santo Domingo",
  "Santa Cruz",
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
  "Talca",
  "Pelarco",
  "Río Claro",
  "San Clemente",
  "Maule",
  "Pencahue",
  "San Rafael",
];

for (const comuna of comunasAmbos) {
  assert(
    obtenerReglaComunaCesionHereditaria(comuna).regla === "ambos",
    `${comuna} debe aceptar a una persona heredera o externa.`,
  );
}

assert(
  obtenerReglaComunaCesionHereditaria("Viña del Mar").regla === "ambos",
  "Una comuna sin regla específica debe aceptar ambos tipos de persona.",
);
assert(
  obtenerReglaComunaCesionHereditaria("san joaquin").regla === "soloComunero",
  "La búsqueda debe ignorar mayúsculas y tildes.",
);
assert(
  resolverReglaTerceroCesionHereditaria([{ comuna: "Providencia" }, { comuna: "San Bernardo" }])
    .regla === "soloComunero",
  "Con varios inmuebles debe prevalecer la regla que exige otra persona heredera.",
);
assert(
  resolverReglaTerceroCesionHereditaria([{ comuna: "Providencia" }, { comuna: "Viña del Mar" }])
    .regla === "ambos",
  "Si ningún inmueble restringe la elección deben aceptarse ambas alternativas.",
);

console.log("✓ Reglas del tercero en cesiones hereditarias válidas");
console.log(`  ${comunasSoloComunero.length} comunas exigen otra persona heredera`);
console.log(`  ${comunasAmbos.length} comunas identificadas aceptan ambas alternativas`);
console.log("  Las comunas restantes también aceptan persona heredera o externa");
