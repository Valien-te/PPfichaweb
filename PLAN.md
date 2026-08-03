# Plan · Portal Protección Patrimonial

## 1. Resumen del producto

El proyecto es un prototipo funcional de un portal web para clientes del servicio de Protección Patrimonial de Lexy Deudor.

El portal permite que cada cliente vea las gestiones o contratos pendientes de su caso, complete los datos requeridos para cada una y suba los documentos necesarios cuando los tenga disponibles.

La primera versión mostrará solo 3 gestiones: **Compraventa de inmueble**, **Cesión de derechos hereditarios** y **Compraventa de acciones E1D**. La estructura debe quedar preparada para agregar nuevas gestiones más adelante sin rediseñar todo el portal.

El objetivo del prototipo es validar la experiencia del cliente: entrar al portal, entender qué debe completar, avanzar paso a paso por cada gestión y volver luego a subir documentos pendientes.

## 2. Usuarios y mundo

**Usuario principal:** cliente de Lexy Deudor que contrató el servicio de Protección Patrimonial.

**Mundo elegido:** `cliente`.

**Razón:** la experiencia está pensada para una persona externa al equipo Lexy, que necesita orientación clara, CTAs simples y formularios guiados para entregar información y documentos. No es una herramienta interna de CRM.

**Forma del producto:** app con secciones y navegación.

**Razón:** aunque parte desde una página principal, el cliente navega entre el portal, el detalle de cada gestión, formularios por pasos y documentos pendientes. Por eso se debe iniciar como `feature`.

## 3. Pantallas y flujos

### Pantalla 1 — Portal principal

**Objetivo:** mostrar al cliente las gestiones disponibles para su caso y el estado de avance de cada una.

**Contenido:**
- Cabecera con marca Lexy Deudor y nombre mock del cliente.
- Título: “Protección Patrimonial”.
- Texto breve de orientación.
- Progreso general del caso.
- Tarjetas para las 3 gestiones iniciales:
	- Compraventa de inmueble.
	- Cesión de derechos hereditarios.
	- Compraventa de acciones E1D.
- Cada tarjeta debe mostrar:
	- Nombre de la gestión.
	- Estado.
	- Avance porcentual.
	- Breve descripción de lo que falta.
	- CTA dinámico según estado.

**Estados iniciales sugeridos:**
- Compraventa de inmueble: “Pendiente de completar datos” · CTA: “Ir a completar”.
- Cesión de derechos hereditarios: “Faltan documentos” · CTA: “Subir documentos”.
- Compraventa de acciones E1D: “Pendiente de completar datos” · CTA: “Ir a completar”.

**Wireframe low-fi:**

```text
+--------------------------------------------------------------+
| Lexy Deudor                                      Ana Cliente |
+--------------------------------------------------------------+

Protección Patrimonial
Completa la información necesaria para preparar tus contratos y gestiones.

Progreso general del caso
[############----------------] 40%

Gestiones disponibles

+------------------------------+
| Compraventa de inmueble      |
| Estado: Pendiente de datos   |
| Avance: 25%                  |
|                              |
| Necesitamos datos del bien,  |
| del tercero y documentos.    |
|                              |
| [Ir a completar]             |
+------------------------------+

+------------------------------+
| Cesión de derechos           |
| hereditarios                 |
| Estado: Faltan documentos    |
| Avance: 70%                  |
|                              |
| Ya completaste los datos.    |
| Falta subir documentos.      |
|                              |
| [Subir documentos]           |
+------------------------------+

+------------------------------+
| Compraventa de acciones E1D  |
| Estado: Pendiente de datos   |
| Avance: 10%                  |
|                              |
| Completa los datos de la     |
| operación y del tercero.     |
|                              |
| [Ir a completar]             |
+------------------------------+
```

### Pantalla 2 — Datos personales

**Objetivo:** permitir que el cliente confirme si sus datos personales declarados están correctos o si necesita editarlos.

**Contenido:**
- Cabecera con botón “Volver al portal”.
- Nombre de la gestión seleccionada.
- Indicador de pasos.
- Campos precargados con datos mock del cliente.
- Checkbox de confirmación.
- CTA “Guardar y continuar”.

**Wireframe low-fi:**

```text
+--------------------------------------------------------------+
| Lexy Deudor                                [Volver al portal] |
+--------------------------------------------------------------+

Compraventa de inmueble

Paso 1 de 4
[Datos personales] → [Datos del bien] → [Tercero] → [Documentos]

Tus datos personales
Confirma que esta información está correcta o edítala si cambió.

Nombre completo       [Ana Pérez González              ]
RUT                   [12.345.678-9                    ]
Teléfono              [+56 9 1234 5678                 ]
Email                 [ana@email.com                   ]

[ ] Confirmo que mis datos están correctos

                                      [Guardar y continuar]
```

### Pantalla 3 — Datos del bien o materia de la gestión

**Objetivo:** capturar los datos especiales de la gestión, especialmente cuando existe un bien asociado.

**Regla dinámica:** esta pantalla debe aparecer solo si la gestión seleccionada requiere datos de bien o datos especiales de la materia de la operación.

**Contenido para Compraventa de inmueble:**
- Tipo de bien.
- Dirección.
- Comuna.
- Rol o inscripción.
- Valor referencial.
- Observaciones.

**Contenido para Cesión de derechos hereditarios:**
- Causante o referencia de la herencia.
- Relación con la sucesión.
- Porcentaje o derechos a ceder, si aplica.
- Observaciones.

**Contenido para Compraventa de acciones E1D:**
- Sociedad o empresa.
- Cantidad de acciones.
- Porcentaje estimado.
- Valor referencial.
- Observaciones.

**Wireframe low-fi:**

```text
Compraventa de inmueble

Paso 2 de 4
[Datos personales] → [Datos del bien] → [Tercero] → [Documentos]

Datos del bien

Tipo de bien           [Inmueble                      v]
Dirección              [_______________________________]
Comuna                 [_______________________________]
Rol / inscripción      [_______________________________]
Valor referencial      [_______________________________]
Observaciones          [_______________________________]

[Volver]                              [Guardar y continuar]
```

### Pantalla 4 — Tercero de confianza

**Objetivo:** capturar los datos de la persona a quien el cliente transferirá o vinculará los bienes, derechos o acciones según la gestión.

**Contenido:**
- Nombre completo.
- RUT.
- Relación con el cliente.
- Teléfono.
- Email.
- Confirmación de que esta persona fue indicada como tercero de confianza.

**Wireframe low-fi:**

```text
Compraventa de inmueble

Paso 3 de 4
[Datos personales] → [Datos del bien] → [Tercero] → [Documentos]

Tercero de confianza

Nombre completo        [_______________________________]
RUT                    [_______________________________]
Relación               [Familiar / amigo / otro       v]
Teléfono               [_______________________________]
Email                  [_______________________________]

[ ] Confirmo que esta persona fue indicada como tercero de confianza

[Volver]                              [Guardar y continuar]
```

### Pantalla 5 — Documentos requeridos

**Objetivo:** mostrar al cliente qué documentos debe enviar para la gestión seleccionada y permitir simular la carga de archivos.

**Contenido:**
- Nombre de la gestión.
- Lista de documentos requeridos.
- Estado de cada documento.
- Botón “Subir archivo” por documento.
- CTA “Enviar documentos”.
- CTA secundario “Volver al portal”.
- Texto aclaratorio: si el cliente no tiene los documentos ahora, puede volver al portal y subirlos después.

**Wireframe low-fi:**

```text
Compraventa de inmueble

Paso 4 de 4
[Datos personales] → [Datos del bien] → [Tercero] → [Documentos]

Documentos requeridos

+--------------------------------------------------------------+
| Documento                                Estado              |
+--------------------------------------------------------------+
| Copia de cédula                         [Subir archivo]      |
| Certificado correspondiente             [Subir archivo]      |
| Antecedente del bien / derecho / acción [Subir archivo]      |
| Documento adicional de respaldo         [Subir archivo]      |
+--------------------------------------------------------------+

Puedes subirlos ahora o volver al portal y hacerlo después.

[Volver al portal]                         [Enviar documentos]
```

### Pantalla 6 — Confirmación

**Objetivo:** cerrar el flujo cuando el cliente envía datos o documentos.

**Contenido:**
- Mensaje de éxito simple.
- Explicación de qué pasa ahora.
- CTA para volver al portal.
- Estado actualizado de la gestión.

**Wireframe low-fi:**

```text
+--------------------------------------------------------------+
| Lexy Deudor                                                  |
+--------------------------------------------------------------+

Información recibida

Gracias, recibimos la información de esta gestión.
El equipo Lexy revisará los datos y documentos enviados.

Qué pasa ahora:
- Revisaremos si la información está completa.
- Si falta algo, te lo mostraremos en este portal.
- Puedes volver a revisar tus otras gestiones pendientes.

[Volver al portal]
```

### Flujo principal del cliente

1. Cliente entra al portal.
2. Revisa sus 3 gestiones disponibles.
3. Presiona “Ir a completar” en una gestión pendiente.
4. Confirma o edita sus datos personales.
5. Completa los datos especiales de la gestión.
6. Completa los datos del tercero de confianza.
7. Revisa los documentos requeridos.
8. Sube documentos si los tiene.
9. Si no tiene documentos, vuelve al portal.
10. En el portal, la tarjeta cambia de CTA:
	- De “Ir a completar” a “Subir documentos”, si ya completó datos pero faltan archivos.
	- A “En revisión” si simuló el envío completo.
11. Cliente puede entrar nuevamente a una gestión para subir documentos pendientes.

## 4. Datos

Todos los datos de esta etapa deben ser **mock**. No debe existir backend, login real ni conexión con CRM.

### Datos mock del cliente

```ts
const clienteMock = {
	nombre: "Ana Pérez González",
	rut: "12.345.678-9",
	telefono: "+56 9 1234 5678",
	email: "ana@email.com",
	servicio: "Protección Patrimonial",
}
```

### Datos mock de gestiones

La app debe manejar las gestiones desde una lista editable, no desde pantallas rígidas. Esto permitirá agregar nuevas gestiones después.

```ts
const gestionesMock = [
	{
		id: "compraventa-inmueble",
		nombre: "Compraventa de inmueble",
		estado: "pendiente_datos",
		avance: 25,
		requiereDatosBien: true,
		descripcion: "Necesitamos datos del bien, del tercero y documentos.",
		documentos: [
			"Copia de cédula",
			"Certificado de dominio vigente",
			"Certificado de hipotecas y gravámenes",
			"Antecedente del inmueble",
		],
	},
	{
		id: "cesion-derechos-hereditarios",
		nombre: "Cesión de derechos hereditarios",
		estado: "faltan_documentos",
		avance: 70,
		requiereDatosBien: true,
		descripcion: "Ya completaste los datos. Falta subir documentos.",
		documentos: [
			"Copia de cédula",
			"Certificado de defunción del causante",
			"Certificado de posesión efectiva, si existe",
			"Antecedentes de los derechos hereditarios",
		],
	},
	{
		id: "compraventa-acciones-e1d",
		nombre: "Compraventa de acciones E1D",
		estado: "pendiente_datos",
		avance: 10,
		requiereDatosBien: true,
		descripcion: "Completa los datos de la operación y del tercero.",
		documentos: [
			"Copia de cédula",
			"Antecedentes de la sociedad",
			"Detalle de acciones o participación",
			"Documento adicional de respaldo",
		],
	},
]
```

### Estados mock

```ts
const estadosGestion = {
	pendiente_datos: {
		label: "Pendiente de completar datos",
		cta: "Ir a completar",
	},
	faltan_documentos: {
		label: "Faltan documentos",
		cta: "Subir documentos",
	},
	en_revision: {
		label: "En revisión",
		cta: "Ver detalle",
	},
	completado: {
		label: "Completado",
		cta: "Ver resumen",
	},
}
```

### Datos capturados por formulario

**Datos personales:**
- Nombre completo.
- RUT.
- Teléfono.
- Email.
- Confirmación de datos correctos.

**Datos de la gestión:**
- Campos variables según la gestión.
- Para inmueble: dirección, comuna, rol, valor referencial, observaciones.
- Para derechos hereditarios: causante, relación, derechos a ceder, observaciones.
- Para acciones E1D: sociedad, cantidad de acciones, porcentaje estimado, valor referencial, observaciones.

**Tercero de confianza:**
- Nombre completo.
- RUT.
- Relación.
- Teléfono.
- Email.
- Confirmación.

**Documentos:**
- Nombre del documento.
- Estado mock: pendiente / cargado.
- Nombre del archivo simulado, si existe.

## 5. Componentes y blocks a usar

El catálogo vigente de Lexy fue consultado desde:

```text
https://cdn.jsdelivr.net/npm/@lexydesign/registry@latest/r/registry.json
```

### Blocks

- `confirmacion`
	- Usar como base para la pantalla final de envío exitoso.
	- Instalar con `create-lexy add confirmacion`.

### Componentes por pantalla

#### Portal principal

- `app-header-bar` o `header-bar`
	- Cabecera con marca Lexy Deudor y acciones simples.
- `card`
	- Tarjetas de cada gestión.
- `badge`
	- Estado de cada gestión.
- `status-dot`
	- Refuerzo visual del estado.
- `progress`
	- Avance general y avance por gestión.
- `button`
	- CTA principal de cada tarjeta.
- `toaster`
	- Mensajes breves cuando cambia un estado simulado.

#### Flujo de gestión

- `form`
	- Formularios con validación.
- `input`
	- Campos de texto.
- `label`
	- Etiquetas de campos.
- `select`
	- Campos como tipo de bien o relación con tercero.
- `checkbox`
	- Confirmaciones.
- `textarea`
	- Observaciones.
- `date-picker`
	- Solo si Claude Code decide que alguna gestión mock requiere fecha.
- `button`
	- Continuar, volver, guardar.
- `progress`
	- Avance por pasos.
- `badge`
	- Estado de la gestión.

#### Documentos

- `card`
	- Contenedor del listado de documentos.
- `button`
	- Simular carga de archivo.
- `badge`
	- Estado pendiente/cargado.
- `table`
	- Si el listado de documentos necesita verse como filas comparables.
- `toaster`
	- Confirmación de archivo simulado cargado.

#### Confirmación

- `confirmacion`
	- Pantalla base de éxito.
- `button`
	- Volver al portal.

### Comandos de instalación de componentes sugeridos

Antes de instalar, Claude Code debe revisar cada pieza con `create-lexy view`.

```bash
create-lexy view app-header-bar
create-lexy view header-bar
create-lexy view card
create-lexy view badge
create-lexy view status-dot
create-lexy view progress
create-lexy view button
create-lexy view form
create-lexy view input
create-lexy view label
create-lexy view select
create-lexy view checkbox
create-lexy view textarea
create-lexy view toaster
create-lexy view table
create-lexy view confirmacion
```

Luego instalar solo lo necesario:

```bash
create-lexy add app-header-bar
create-lexy add card
create-lexy add badge
create-lexy add status-dot
create-lexy add progress
create-lexy add button
create-lexy add form
create-lexy add input
create-lexy add label
create-lexy add select
create-lexy add checkbox
create-lexy add textarea
create-lexy add toaster
create-lexy add table
create-lexy add confirmacion
```

Si `app-header-bar` no calza con la experiencia cliente, usar `header-bar` en su lugar.

## 6. Bloque de arranque

Ejecutar desde una carpeta vacía:

```bash
npx create-lexy create portal-proteccion-patrimonial --type feature --world cliente
cd portal-proteccion-patrimonial
npx @lexydesign/ai install
```

Después de instalar la infra de IA, ejecutar:

```bash
create-lexy doctor
```

## 7. Hitos de construcción

### Hito 1 — Arranque del proyecto e instalación del esqueleto

**Trabajo:**
- Ejecutar el bloque de arranque.
- Instalar la infra de IA.
- Ejecutar `create-lexy doctor`.
- Revisar con `create-lexy view` los componentes principales.
- Instalar los componentes base del esqueleto: `app-header-bar`, `card`, `badge`, `status-dot`, `progress`, `button`, `toaster`.

**Criterio de salida verificable:**
- El proyecto corre con `pnpm dev`.
- Se ve una pantalla inicial con cabecera Lexy Deudor.
- `create-lexy doctor` no muestra errores críticos.
- `PROJECT-CONTEXT.md` queda actualizado con el objetivo del portal.

### Hito 2 — Portal principal dinámico

**Trabajo:**
- Crear la lista mock de las 3 gestiones.
- Renderizar las tarjetas desde esa lista.
- Mostrar estado, avance y CTA dinámico.
- Calcular progreso general mock desde las gestiones.
- Preparar la estructura para agregar nuevas gestiones más adelante solo editando la lista mock.

**Criterio de salida verificable:**
- El portal muestra exactamente las 3 gestiones iniciales.
- Cada tarjeta tiene su CTA correcto.
- Si se agrega una cuarta gestión al mock, aparece en el portal sin crear una pantalla nueva manualmente.

### Hito 3 — Flujo guiado de datos

**Trabajo:**
- Crear la vista de detalle de gestión.
- Implementar pasos: datos personales, datos de gestión, tercero de confianza.
- Usar datos personales precargados.
- Permitir editar campos.
- Guardar el avance en estado local del prototipo.
- Mostrar u omitir la pantalla de datos del bien según la configuración de la gestión.

**Criterio de salida verificable:**
- Desde “Ir a completar”, el cliente entra al flujo de la gestión seleccionada.
- Puede avanzar entre pasos.
- Los campos muestran datos mock y aceptan edición.
- La pantalla de datos especiales se alimenta desde la gestión seleccionada.

### Hito 4 — Documentos y cambio de estado

**Trabajo:**
- Mostrar documentos requeridos según la gestión.
- Simular carga de archivo por documento.
- Permitir volver al portal sin completar la carga.
- Cambiar el estado visual de la gestión:
	- Si datos completos y documentos faltantes: “Faltan documentos”.
	- Si documentos simulados enviados: “En revisión”.

**Criterio de salida verificable:**
- Cada gestión muestra su propia lista de documentos.
- Al simular carga, el documento cambia a estado cargado.
- Al volver al portal, el CTA de la tarjeta cambia según el estado mock.

### Hito 5 — Confirmación y pulido de experiencia

**Trabajo:**
- Adaptar el block `confirmacion` para cierre del flujo.
- Agregar mensajes breves con `toaster`.
- Revisar textos para que sean claros para clientes.
- Asegurar que no haya términos técnicos visibles.
- Revisar responsive básico para pantalla de notebook y móvil.

**Criterio de salida verificable:**
- Al enviar documentos simulados, aparece una pantalla de confirmación.
- El cliente puede volver al portal.
- El portal refleja el nuevo estado de la gestión.
- La experiencia completa se puede recorrer sin errores desde la página principal.

## 8. Reglas para Claude Code

Claude Code debe seguir estas reglas durante todo el trabajo:

1. Trabajar **un hito a la vez**.
2. No avanzar al siguiente hito hasta validar el criterio de salida del hito actual.
3. Antes de crear un componente nuevo, verificar si ya existe en el catálogo con:

```bash
create-lexy view <componente>
```

4. Instalar componentes con:

```bash
create-lexy add <componente>
```

5. Nunca copiar código del catálogo a mano.
6. No usar estilos fuera de los tokens del theme Lexy.
7. No crear backend, login real, base de datos ni integración con CRM.
8. Mantener todos los datos como mock en esta versión.
9. Construir el portal de forma dinámica, basado en una lista de gestiones.
10. No dejar rígidas las 3 gestiones en pantallas separadas si puede resolverse desde datos.
11. Al cerrar cada hito, actualizar `PROJECT-CONTEXT.md` con:
	- Qué se construyó.
	- Qué decisiones se tomaron.
	- Qué queda pendiente.
	- Estado del prototipo.

## 9. Instrucciones exactas para Antigravity / Claude Code

### Paso 1 — Crear carpeta de trabajo

Crear una carpeta vacía en el computador, por ejemplo:

```bash
portal-proteccion-patrimonial-workspace
```

Guardar este archivo `PLAN.md` dentro de esa carpeta.

### Paso 2 — Abrir Antigravity

Abrir Antigravity en esa carpeta vacía.

### Paso 3 — Abrir el agente de Antigravity

Pedirle al agente:

```text
Lee PLAN.md completo antes de hacer cualquier cambio. Ejecuta el plan en orden, un hito a la vez. Parte por el bloque de arranque. No avances de hito hasta cumplir su criterio de salida.
```

### Paso 4 — Bloque de arranque que debe ejecutar Antigravity

```bash
npx create-lexy create portal-proteccion-patrimonial --type feature --world cliente
cd portal-proteccion-patrimonial
npx @lexydesign/ai install
create-lexy doctor
```

### Paso 5 — Validación inicial

Cuando termine el arranque, pedirle:

```text
Valida el Hito 1: dime si el proyecto corre con pnpm dev, si create-lexy doctor está correcto y qué componentes instalaste. Luego actualiza PROJECT-CONTEXT.md.
```

### Paso 6 — Continuar por hitos

Después, pedirle:

```text
Continúa con el Hito 2. Recuerda mantener las gestiones como datos mock editables para que luego podamos agregar más gestiones sin rediseñar el portal.
```

Repetir el mismo patrón para los hitos siguientes.

## 10. Fuera de alcance de esta versión

Esta primera versión no debe incluir:

- Login real.
- Backend.
- Base de datos.
- Guardado persistente real.
- Integración con CRM.
- Firma electrónica.
- Subida real de archivos.
- Reglas legales definitivas para todos los contratos de Protección Patrimonial.
- Catálogo completo de más de 20 gestiones.
- Automatizaciones reales hacia operaciones o abogados.

Todo eso queda como fuera de alcance y requiere conversación posterior con TI / operaciones.

## 11. Handoff para el designer

1. Descarga `PLAN.md` desde este chat.
2. Crea una carpeta vacía para el proyecto y deja el archivo ahí.
3. Abre Antigravity en esa carpeta.
4. Abre el agente de Antigravity o Claude Code.
5. Dile:

```text
Lee PLAN.md y ejecútalo en orden. Parte por el bloque de arranque.
```

6. Pide que trabaje hito por hito y que valide el criterio de salida antes de avanzar.