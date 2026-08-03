/**
 * Chequeo del contrato de geometría Lexy — versión para proyectos.
 * Instalado por `npx @lexydesign/ai install`; el contrato se fiscaliza en cada repo.
 *
 * Uso:
 *   pnpm lint:geometry           → valida el contrato (exit 1 si hay violaciones)
 *   pnpm lint:geometry -- --box  → además imprime la tabla de caja por slot de
 *                                  cada componente compuesto
 *
 * Contrato (resumen — ver ai/pautas/sistema-visual.md):
 * - Grilla híbrida: múltiplos de 4px para espaciado entre elementos y superficies;
 *   medio-pasos de 2px permitidos SOLO dentro de un control. Márgenes, posiciones
 *   y space-* siempre en grilla 4px.
 * - Valores arbitrarios [..] solo funcionales (vars, %, vh/vw, calc, inherit).
 * - Radios: `rounded` controles, `rounded-md`/`lg` superficies, `rounded-xs` 2px,
 *   `rounded-full` círculos. `rounded-sm` y `rounded-xl` fuera de contrato.
 * - Sombras: `shadow-sm` superficies, `shadow-md` flotantes, `shadow-lg` solo
 *   overlays modales. `shadow-xl` no existe.
 * - El theme define --radius y sus derivados (toda la escala cuelga de una perilla).
 */
import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const printBox = process.argv.includes("--box");

const lexy = JSON.parse(await fs.readFile(path.join(cwd, ".lexy"), "utf-8").catch(() => "{}"));
const componentsDir = path.join(cwd, lexy.paths?.components ?? "src/components/base");
const themeFile = path.join(cwd, "src/lexy-theme.css");

const GEOMETRIC_ARBITRARY = /^-?(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|w|h|size|min-w|min-h|max-w|max-h|top|bottom|left|right|inset|rounded(?:-[tblr]{1,2})?|border(?:-[tblrxy])?|text|leading)-\[/;
const ARBITRARY_FUNCTIONAL = /\[(?:var\(|--|inherit|calc\(|[\d.]+(?:%|vh|vw|svh|dvh))/;
const SHADOW_LG_ALLOWLIST = new Set(["Dialog", "Sheet", "AppDialog"]);
const ROUNDED_XL_ALLOWLIST = new Set([]);
const HALF_STEP_ALLOWED = /^(?:p|px|py|pt|pb|pl|pr)-(?:0\.5|1\.5|2\.5)$|^gap-(?:0\.5|1\.5)$|^(?:h|w|size|min-w|min-h)-(?:0\.5|1\.5|2\.5|3\.5)$|^translate-[xy]-0\.5$|^(?:top|right|bottom|left)-(?:0\.5|1\.5|2\.5|3\.5)$|^m[trblxy]?-0\.5$/;
const HALF_STEP = /^-?[a-z-]+-\d+\.5$/;
const RADIUS_TOKENS = ["--radius:", "--radius-sm:", "--radius-md:", "--radius-lg:"];

const CLASS_STRING = /["'`]([^"'`]*)["'`]/g;
const tokensOf = (source) => {
  const tokens = [];
  for (const match of source.matchAll(CLASS_STRING)) {
    for (const raw of match[1].split(/\s+/)) if (raw) tokens.push(raw);
  }
  return tokens;
};
const baseUtility = (raw) => raw.split(":").pop();

const violations = [];

const theme = await fs.readFile(themeFile, "utf-8").catch(() => null);
if (theme === null) {
  violations.push({ file: "src/lexy-theme.css", token: "(archivo)", rule: "theme ausente" });
} else {
  for (const token of RADIUS_TOKENS) {
    if (!theme.includes(token)) {
      violations.push({ file: "lexy-theme.css", token: token.replace(":", ""), rule: "token de radius ausente en el theme" });
    }
  }
}

const entries = (await fs.readdir(componentsDir).catch(() => []))
  .filter((f) => f.endsWith(".tsx"))
  .sort();

for (const fileName of entries) {
  const name = path.basename(fileName, ".tsx");
  const source = await fs.readFile(path.join(componentsDir, fileName), "utf-8");
  const seen = new Set();

  for (const raw of tokensOf(source)) {
    const base = baseUtility(raw);
    const key = `${name}:${base}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (base.includes("[")) {
      if (!GEOMETRIC_ARBITRARY.test(base)) continue;
      if (!ARBITRARY_FUNCTIONAL.test(base)) {
        violations.push({ file: name, token: base, rule: "arbitrario no funcional → usar escala" });
      }
      continue;
    }
    if (HALF_STEP.test(base.replace(/^-/, "")) && !HALF_STEP_ALLOWED.test(base.replace(/^-/, ""))) {
      violations.push({ file: name, token: base, rule: "medio-paso fuera de control → grilla 4px" });
      continue;
    }
    if (base === "shadow-xl") {
      violations.push({ file: name, token: base, rule: "shadow-xl no existe en el contrato → shadow-md" });
    } else if (base === "shadow-lg" && !SHADOW_LG_ALLOWLIST.has(name)) {
      violations.push({ file: name, token: base, rule: "shadow-lg solo overlays modales → shadow-md" });
    }
    if (/^rounded(-[tblr]{1,2})?-sm$/.test(base)) {
      violations.push({ file: name, token: base, rule: "rounded-sm = rounded en v4 → unificar deletreo a rounded" });
    } else if (base === "rounded-xl" && !ROUNDED_XL_ALLOWLIST.has(name)) {
      violations.push({ file: name, token: base, rule: "rounded-xl fuera de contrato → rounded-lg" });
    }
  }
}

if (printBox) {
  console.log("── Tabla de caja por componente compuesto ──\n");
  const BOX_TOKEN = /^-?(?:p|px|py|pt|pb|pl|pr|gap|gap-x|gap-y|space-y|space-x|m|mx|my|mt|mb|ml|mr)(?:-|$)/;
  for (const fileName of entries) {
    const name = path.basename(fileName, ".tsx");
    const source = await fs.readFile(path.join(componentsDir, fileName), "utf-8");
    const sections = source.split(/(?=^(?:export\s+)?(?:function|const)\s+[A-Z][A-Za-z0-9]*)/m);
    const rows = [];
    for (const section of sections) {
      const header = section.match(/^(?:export\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]*)/);
      if (!header) continue;
      const boxTokens = Array.from(new Set(tokensOf(section).map(baseUtility).filter((t) => BOX_TOKEN.test(t))));
      if (boxTokens.length > 0) rows.push(`    ${header[1]}: ${boxTokens.join(" ")}`);
    }
    if (rows.length > 0) console.log(`  ${name}\n${rows.join("\n")}\n`);
  }
}

if (violations.length > 0) {
  console.error(`✗ ${violations.length} violaciones del contrato de geometría:\n`);
  for (const v of violations) console.error(`  ${v.file}: ${v.token} — ${v.rule}`);
  process.exitCode = 1;
} else {
  console.log(`✓ Contrato de geometría: sin violaciones (${entries.length} componente(s) revisados).`);
}
