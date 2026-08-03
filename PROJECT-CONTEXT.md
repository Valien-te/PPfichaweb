# PROJECT-CONTEXT — Portal Protección Patrimonial

## Objetivo

Prototipo funcional de un portal web para clientes del servicio de Protección Patrimonial de Lexy Deudor. El cliente puede ver sus gestiones pendientes, completar datos y subir documentos requeridos.

## Estado actual

### Hito 1 — Arranque del proyecto e instalación del esqueleto ✅

**Completado:**
- Proyecto creado con `create-lexy create` (arquitectura `feature`, mundo `cliente`).
- Infra de IA instalada (`@lexydesign/ai install` v0.5.0).
- `create-lexy doctor` pasa sin errores.
- Componentes base instalados del registro:
  - `app-header-bar` (incluye `header-bar` y `logo` como dependencias)
  - `button`, `card`, `badge`, `status-dot`, `progress`, `toaster`
- App funciona con `pnpm dev` en `http://localhost:5173/`.
- Cabecera con marca Lexy Deudor y nombre mock del cliente.

### Hito 2 — Portal principal dinámico ✅

**Completado:**
- Datos mock de gestiones creados en `src/features/mock-data.ts` (lista editable).
- Store de estado en `src/features/gestiones-store.ts` con `useSyncExternalStore`.
- Portal principal renderiza tarjetas desde la lista mock con estado, avance y CTA dinámico.
- Progreso general calculado como promedio de avances.
- Agregar una 4ª gestión al mock la muestra automáticamente.

### Hito 3 — Flujo guiado de datos ✅

**Completado:**
- Vista de detalle de gestión (`src/features/FlujoGestion.tsx`) con navegación por pasos.
- 4 pasos implementados: Datos personales, Datos del bien, Tercero, Documentos.
- Datos personales precargados desde mock, editables.
- Campos específicos dinámicos según la gestión (camposEspecificos en mock).
- Pantalla de datos especiales omitible si `requiereDatosBien = false`.
- Componentes de formularios instalados: `form`, `input`, `label`, `select`, `checkbox`, `textarea`.

### Hito 4 — Documentos y cambio de estado ✅

**Completado:**
- Documentos requeridos mostrados por gestión.
- Simulación de carga de archivos por documento.
- Cliente puede volver al portal sin completar la carga.
- Cambio de estado visual: "Pendiente datos" → "Faltan documentos" → "En revisión".
- CTA dinámico en tarjetas se actualiza correctamente.

### Hito 5 — Confirmación y pulido de experiencia ✅

**Completado:**
- Block `confirmacion` instalado y adaptado para cierre del flujo.
- Pantalla muestra nombre de la gestión, mensaje de éxito y siguiente pasos.
- Toaster con mensajes breves en cada acción (guardar, subir, enviar).
- Textos claros para clientes (sin términos técnicos).
- Toaster configurado para mundo cliente (top-center, 6s).

**Decisiones tomadas:**
- Se usa `Logo brand="deudor"` para la marca en el header.
- Store sin dependencias externas (useSyncExternalStore).
- Campos específicos por gestión definidos en el mock para formularios dinámicos.
- Navegación por URL params para bookmarkability (`/gestion/:gestionId/:pasoId`).
- Pasos del flujo son dinámicos según configuración de la gestión.

## Archivos principales

- `src/features/mock-data.ts` — Datos mock y tipos (fuente de verdad para gestiones)
- `src/features/gestiones-store.ts` — Store de estado con hooks
- `src/features/PortalPrincipal.tsx` — Portal con tarjetas dinámicas
- `src/features/FlujoGestion.tsx` — Layout de pasos de gestión
- `src/features/pasos/PasoDatosPersonales.tsx` — Paso 1: datos personales
- `src/features/pasos/PasoDatosEspecificos.tsx` — Paso 2: datos del bien/gestión
- `src/features/pasos/PasoTercero.tsx` — Paso 3: tercero de confianza
- `src/features/pasos/PasoDocumentos.tsx` — Paso 4: documentos
- `src/features/EnvioConfirmado.tsx` — Pantalla de confirmación
- `src/app/App.tsx` — Routing y layout principal
