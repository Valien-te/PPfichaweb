import path from "node:path";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    // React Compiler: memoización automática. En Vite 8 (Rolldown) el plugin de
    // React es oxc, así que el compilador corre como preset de babel aparte.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    // Limpieza mandatoria en producción (biblia): sin console ni debugger en
    // el bundle. Vite 8 (Rolldown) ignora esbuild.drop; se hace en el
    // minificador.
    minify: "terser",
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
  },
});
