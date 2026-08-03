# Portal de Protección Patrimonial Lexy

Prototipo funcional para que una persona entregue, de manera guiada, los antecedentes
necesarios para preparar las gestiones legales que ya definió con el equipo Lexy.

La plataforma no recomienda qué contrato celebrar ni sustituye la revisión legal. Su
finalidad es transformar una solicitud de antecedentes compleja en una ficha clara,
mostrar qué falta y reunir los documentos que el equipo legal revisará posteriormente.

## Finalidad del desarrollo

El producto busca que una persona pueda:

1. reconocer qué gestión está completando;
2. confirmar sus datos personales;
3. individualizar los bienes o derechos involucrados;
4. informar a las demás personas que deben comparecer;
5. entender qué documentos necesita, para qué sirven y dónde obtenerlos;
6. enviar la ficha y conservar acceso de solo lectura a lo informado;
7. cargar documentos y conocer el resultado de su revisión.

Es una experiencia del **mundo cliente** de Lexy: usa lenguaje cotidiano, evita jerga
legal innecesaria y presenta una decisión por vez. El equipo legal y TI deben validar
las reglas marcadas como pendientes antes de convertir el prototipo en un sistema de
producción.

## Tecnología

- React 19, TypeScript y Vite.
- Tailwind CSS y componentes locales del Lexy Design System.
- React Router para el portal y las etapas de cada ficha.
- Contrato de datos, motor de eventos y simulador persistente para el prototipo.
- `pnpm` como gestor de dependencias.

Los componentes Lexy se instalan como código local y editable; no se consumen como una
librería cerrada. La configuración está en [`.lexy`](.lexy).

## Inicio rápido

Requisitos: Node.js compatible con Vite 8 y Corepack habilitado.

```bash
corepack enable
pnpm install
pnpm dev
```

Comandos principales:

```bash
pnpm dev                         # abrir la vista previa
pnpm check:prototype             # validar datos, eventos, simulador y reglas
pnpm lint                        # revisar calidad estática del código
pnpm lint:geometry               # validar espaciado y radios Lexy
pnpm build                       # validar y generar la versión publicable
pnpm preview                     # revisar la versión construida
npx create-lexy doctor           # revisar componentes y diferencias con el registry
```

## Recorrido de la persona

El portal muestra una tarjeta por gestión con su estado, avance e identificador natural.
Al abrirla, la ficha construye dinámicamente este camino:

1. **Datos personales**: confirma los antecedentes de la persona contratante.
2. **Cónyuge o conviviente civil**: aparece solo cuando debe comparecer.
3. **Datos del bien**: aparece si el contrato necesita individualizar bienes o derechos.
4. **Tercero**: puede representar al tercero de confianza, segundo socio, apoderado o,
   en una transferencia ante Registro Civil, instrucciones para realizar el trámite.
5. **Documentos**: aparece únicamente cuando la matriz documental resuelve requisitos.

Cada cambio de etapa lleva la pantalla al inicio. Antes de enviar, la persona puede volver
a etapas anteriores. Al presionar **Enviar ficha**, todos los campos quedan bloqueados y
la ficha completa permanece navegable en modo de solo lectura.

Si corresponde cargar documentos, la confirmación conduce a esa etapa. Si no corresponde,
la gestión vuelve al portal para su revisión.

## Estados principales

### Gestión

- `pendiente_datos`: faltan respuestas de la ficha.
- `faltan_documentos`: la ficha fue enviada y quedan documentos por cargar.
- `en_revision`: la información fue enviada al equipo legal.
- `completado`: el flujo fue completado.
- Estados especiales de vehículo permiten guardar una gestión en espera o bloqueada.

### Documento

- **Sin cargar**: permite seleccionar un archivo.
- **Pendiente de aprobación**: usa amarillo y permite visualizar el archivo.
- **Aprobado**: usa verde y conserva la visualización.
- **Rechazado**: usa rojo, muestra el motivo y habilita **Reemplazar**.

Un documento pendiente o aprobado no puede reemplazarse desde el portal. Esta restricción
evita que cambie el archivo que el equipo legal está revisando o ya aprobó.

## Reglas de negocio

Las reglas ejecutables viven en módulos `*-rules.ts`. Las pantallas deben consumirlos y
no mantener listas o condiciones paralelas.

### Enrutamiento de inmuebles

La forma de adquisición tiene mayor precedencia que la titularidad:

- una adquisición por herencia, inscrita o no, cambia la gestión a **Cesión de derechos
  hereditarios**;
- si no hay herencia y existe copropiedad, cambia a **Cesión de derechos**;
- si la persona corrige la respuesta, se restaura el contrato original.

Fuente: [`src/features/adquisicion-rules.ts`](src/features/adquisicion-rules.ts).

### Liquidación de sociedad conyugal

- Si se adquirieron inmuebles o vehículos durante el matrimonio, se conserva la
  liquidación y se solicitan los bienes declarados.
- Si no se adquirieron inmuebles ni vehículos, la gestión cambia a **Pacto de sustitución
  de régimen matrimonial**.
- El régimen de destino es separación de bienes; no es una elección del cliente.

Fuente: [`src/features/regimen-patrimonial-rules.ts`](src/features/regimen-patrimonial-rules.ts).

### Comparecientes y camino de la ficha

- Pacto de sustitución, liquidación y renuncia a los gananciales solicitan al cónyuge
  o excónyuge en lugar de un tercero.
- Las transferencias de inmueble pueden requerir además al cónyuge o conviviente civil.
- El cónyuge comparece cuando existe matrimonio bajo sociedad conyugal o AUC bajo
  comunidad de bienes.
- Constitución de sociedades pide un segundo socio, salvo E.I.R.L.
- SpA, S.A. y Limitada preguntan quién administrará o representará; si es otra persona,
  se solicitan sus datos completos.
- Transferencia de vehículo RC reemplaza el tercero por instrucciones del Registro Civil.

Fuente: [`src/features/pasos/tercero-rules.ts`](src/features/pasos/tercero-rules.ts).

### Tercero de confianza y señales de riesgo

El tercero nunca puede ser el cónyuge ni una persona que, según lo declarado, no pueda
participar legalmente. Estas condiciones bloquean el avance.

La persona contratante tampoco puede ingresarse a sí misma como tercero de confianza,
contraparte, segundo socio o apoderado. La plataforma compara ambos RUT normalizados,
muestra el error en una fila completa bajo el RUT y bloquea el guardado tanto en la UI
como en el store local.

Son señales revisables, pero no impedimentos automáticos:

- tener menos de 21 años;
- ser hijo/a, padre, madre o hermano/a;
- no contar con ingresos estables.

Si existe una señal, la plataforma recomienda otra persona y exige una aceptación
explícita para continuar. Sobre 60 años se consulta por facultades mentales y se agrega
un certificado emitido por psiquiatra o neurólogo.

Fuente: [`src/features/pasos/tercero-risk-rules.ts`](src/features/pasos/tercero-risk-rules.ts).

### Máximo de escrituras inmobiliarias por tercero

Una misma persona puede ser tercero de confianza en un máximo de dos escrituras entre:
Aporte inmobiliario SRL, Compraventa de inmueble, Compraventa de inmueble y usufructo,
Cesión de derechos, Compraventa de nuda propiedad y Cesión de derechos hereditarios.
La comparación se realiza por RUT normalizado y considera cada gestión principal una sola
vez, aunque contenga varios inmuebles. Liquidación de sociedad conyugal y los mandatos
vinculados quedan expresamente excluidos.

El segundo uso se informa junto al RUT y continúa permitido. Un tercer uso muestra un
error en una fila completa bajo ambos campos de esa línea y bloquea el guardado sin
desalinear la grilla.

Fuente: [`src/features/pasos/tercero-inmobiliario-rules.ts`](src/features/pasos/tercero-inmobiliario-rules.ts).

### Cesión de derechos hereditarios

La comuna de cada inmueble determina a quién puede elegirse:

- **Solo otra persona heredera:** San Miguel, San Joaquín, La Granja, La Pintana,
  San Ramón, El Bosque, Pedro Aguirre Cerda, Lo Espejo, San Bernardo y Villa Alemana.
- **Persona heredera o persona externa:** todas las demás comunas, incluidas las
  jurisdicciones expresamente registradas en la matriz.
- No existe actualmente una regla de “solo persona externa”.
- Si hay varios inmuebles y cualquiera pertenece a una comuna restrictiva, prevalece
  la restricción y la persona elegida debe ser heredera.

La normalización ignora mayúsculas, tildes y variantes de guion para evitar resultados
distintos por formato de entrada.

Fuente: [`src/features/pasos/cesion-hereditaria-tercero-rules.ts`](src/features/pasos/cesion-hereditaria-tercero-rules.ts).

### Firma y mandatos vinculados

- Solo se consulta si las partes pueden firmar juntas cuando viven en regiones distintas
  y el contrato tiene un bien sincronizable.
- Si una de las partes firmará por ambas, se crea un **Mandato con autocontrato**.
- Si firmará una persona externa, se crea un **Mandato** general.
- El apoderado del mandato general debe tener un RUT diferente de la persona contratante
  y de la otra parte.
- Contrato principal y mandato comparten bienes, documentos, archivos y estados en ambos
  sentidos. No deben producirse cargas documentales duplicadas.
- El mandato conserva su propio avance: siempre debe completar Datos del bien y sus datos
  de representación antes de acceder a Documentos, aunque los archivos ya estén compartidos.
- Cambiar entre mandato general y mandato con autocontrato reinicia los pasos propios del
  mandato, pero mantiene sincronizados los bienes y documentos del contrato principal.

Fuentes: [`firma-mandato-rules.ts`](src/features/pasos/firma-mandato-rules.ts) y
[`bienes-vinculados-rules.ts`](src/features/pasos/bienes-vinculados-rules.ts).

### Vehículos con prenda

- Sin prenda vigente: puede continuar.
- Entre una y tres cuotas pendientes y al día: se guarda **En espera**.
- Cuotas en mora: se bloquea por mora.
- Más de tres cuotas: se bloquea por plazo.
- Más de tres cuotas y mora: se conservan ambas causas para explicarlas.
- Deuda pagada con alzamiento pendiente: se bloquea hasta completar el alzamiento.
- En Transferencia de vehículo RC, un permiso de circulación vencido también bloquea.
- En Compraventa de vehículo, el permiso vencido no impide preparar el contrato.

Fuente: [`src/features/pasos/vehiculo-prenda-rules.ts`](src/features/pasos/vehiculo-prenda-rules.ts).

### Identificadores de gestiones y bienes

El portal usa exclusivamente datos reales:

- dirección para inmuebles, arriendo y aporte inmobiliario;
- patente para vehículos;
- razón social para compraventas de acciones;
- nombre de la sociedad para constituciones;
- en derechos hereditarios, una dirección o el texto `(N inmuebles)`.

Los contratos sin un identificador natural no reciben un folio inventado. Cuando un
documento se repite por bien, se usa la dirección o patente correspondiente.

Fuente: [`src/features/identificador-gestion-rules.ts`](src/features/identificador-gestion-rules.ts).

## Matriz documental

Todas las instrucciones explican primero qué acredita el documento y luego dónde
obtenerlo, dentro de la propia plataforma y sin exigir que la persona abra otro sitio.
Los certificados y antecedentes deben haber sido emitidos **hace no más de un mes**.
Ningún contrato solicita una copia de la cédula de identidad como archivo.

| Contrato                                     | Documentos                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| Compraventa de inmueble                      | Dominio vigente; inscripción conservatoria; hipotecas y gravámenes            |
| Compraventa de inmueble y usufructo          | Dominio vigente; inscripción conservatoria; hipotecas y gravámenes            |
| Cesión de derechos                           | Dominio vigente; inscripción conservatoria; hipotecas y gravámenes            |
| Compraventa de nuda propiedad                | Dominio vigente; inscripción conservatoria; hipotecas y gravámenes            |
| Cancelación y alzamiento de hipoteca         | Dominio vigente; inscripción conservatoria; hipotecas y gravámenes            |
| Cesión de derechos hereditarios              | Los tres documentos del inmueble por cada inmueble; posesión efectiva una vez |
| Liquidación de sociedad conyugal             | Documentos por cada inmueble o vehículo declarado                             |
| Compraventa de vehículo                      | Anotaciones vigentes; inscripción o padrón                                    |
| Cancelación y alzamiento de prenda           | Documentos del vehículo; escritura de constitución de prenda                  |
| Transferencia de vehículo RC                 | Comprobante de transferencia                                                  |
| Compraventa de acciones, régimen tradicional | Constitución; inscripción con anotaciones; vigencia; libro de accionistas     |
| Compraventa de establecimiento comercial     | Constitución; inscripción con anotaciones; vigencia; libro de accionistas     |
| Compraventa de patente comercial             | Documentos societarios solo si fue constituida por escritura pública          |
| Contrato de arriendo                         | Dominio vigente                                                               |
| Aporte inmobiliario SRL                      | Dominio vigente; inscripción conservatoria; hipotecas y gravámenes            |
| Resciliación                                 | Copia del contrato que se dejará sin efecto                                   |
| Mandato y mandato con autocontrato           | Los mismos documentos y estados del contrato principal                        |

No requieren documentos:

- Compraventa de bienes muebles.
- Comodato de bienes muebles.
- Declaración jurada de allegado.
- Pacto de sustitución de régimen matrimonial.
- Compraventa de acciones (Empresa en un Día).
- Constitución de sociedades.
- Compraventa de patente comercial constituida mediante Empresa en un Día.

La matriz ejecutable y los textos de obtención están en
[`src/features/pasos/documentos-rules.ts`](src/features/pasos/documentos-rules.ts).

## Arquitectura del código

```text
src/
├── app/                         # composición y rutas principales
├── features/
│   ├── PortalPrincipal.tsx      # listado y estados de gestiones
│   ├── FlujoGestion.tsx         # camino, envío, bloqueo y navegación
│   ├── gestiones-store.ts       # estado local y sincronización funcional
│   ├── *-rules.ts               # reglas transversales puras
│   ├── pasos/                   # etapas y reglas específicas de ficha
│   └── simulator/               # panel para crear y forzar estados
├── prototype/
│   ├── data-contract/           # entidades, campos y relaciones declaradas
│   ├── event-engine/            # cargas y eventos externos simulados
│   └── simulator/               # escenarios, handlers y persistencia mock
└── shared/components/base/       # componentes Lexy instalados localmente
scripts/                         # verificaciones ejecutables de contratos y reglas
ai/                              # contexto, pautas y protocolo del proyecto Lexy
```

### Fuentes de verdad

- Datos visibles o editables: [`prototype-data-contract.ts`](src/prototype/data-contract/prototype-data-contract.ts).
- Comunicaciones externas: [`prototype-event-engine-contract.ts`](src/prototype/event-engine/prototype-event-engine-contract.ts).
- Datos sintéticos: [`src/prototype/simulator/`](src/prototype/simulator/).
- Reglas funcionales: archivos `*-rules.ts` bajo `src/features/`.
- Decisiones vivas de producto: [`ai/PROJECT-CONTEXT.md`](ai/PROJECT-CONTEXT.md).
- Componentes y rutas Lexy: [`.lexy`](.lexy) y [`ai/lexy-ai-manifest.json`](ai/lexy-ai-manifest.json).

## Simulador

El panel de simulación permite:

- abrir un caso especial que intenta usar al mismo tercero en una tercera escritura inmobiliaria;
- crear gestiones sintéticas para los contratos disponibles;
- cambiar el estado de una gestión;
- abrir directamente su etapa de documentos;
- forzar por documento los estados sin cargar, pendiente, aprobado y rechazado;
- generar un archivo sintético y un motivo de rechazo determinista.

El escenario principal incluye una Cesión de derechos hereditarios con la ficha ya
enviada: muestra una propiedad heredada en Providencia y una tercera persona sintética
completa, para que la etapa “Faltan documentos” pueda revisarse con contexto realista.

Los datos del simulador son ficticios, reproducibles y no deben copiarse directamente
en componentes de pantalla.

## Cómo modificar reglas con seguridad

1. Identificar la fuente de verdad del dato o decisión.
2. Actualizar el contrato de datos si aparece un campo, estado o proyección nueva.
3. Modificar el módulo `*-rules.ts`, no la condición directamente en la vista.
4. Agregar o actualizar el chequeo correspondiente en `scripts/`.
5. Consumir el resultado desde la pantalla o el store.
6. Actualizar este README y `ai/PROJECT-CONTEXT.md` si cambia una decisión funcional.
7. Ejecutar:

```bash
pnpm check:prototype
pnpm lint
pnpm lint:geometry
pnpm build
```

Las reglas nacidas desde usabilidad y no confirmadas por backend deben usar
`origin: "generatedByUsability"` y `technicalValidation.status: "pendingTi"` en el
contrato de datos.

## Límites antes de producción

Este repositorio es un prototipo funcional. Antes de publicar se debe:

- reemplazar el almacenamiento y los eventos simulados por integraciones autorizadas;
- validar con Legal y Operaciones la matriz de contratos, comparecientes y documentos;
- resolver los elementos `pendingTi` del contrato de datos;
- definir autenticación, autorización y reapertura de fichas;
- implementar almacenamiento seguro, antivirus, trazabilidad y control de acceso para archivos;
- revisar privacidad, tratamiento de datos personales y retención de información;
- seguir [`ai/PRODUCTION-CLEANUP.md`](ai/PRODUCTION-CLEANUP.md).

## Catálogo Lexy

```bash
npx create-lexy view --list      # descubrir componentes y bloques
npx create-lexy view button      # revisar código y documentación
npx create-lexy add button       # instalar una copia local editable
npx create-lexy diff button      # comparar la copia local con el registry
npx create-lexy doctor           # revisar salud y drift del proyecto
```

El patrón de importación de este proyecto es:

```ts
import { Button } from "@/shared/components/base/Button";
```
