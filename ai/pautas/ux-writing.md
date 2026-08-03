# Lexy — Guía de UX Writing

> Documento para IA y diseñadores. Define cómo se escribe dentro de los productos Lexy: tono, patrones de microcopy y reglas por tipo de componente. Los ejemplos están tomados de los productos Lexy (flujo de Carga de Documentos y desks del equipo).

Esta guía es operativa: no habla de filosofía de marca (eso vive en otros documentos), sino de **qué palabras poner en pantalla y cómo**. Cuando escribas un texto de interfaz para Lexy, esta es la referencia.

---

## 0. La regla base: háblale de tú

Lexy siempre habla de **tú**: cercano, directo, humano.

- *"Ingresa tu clave aquí"*
- *"Aún puedes subir los documentos"*
- *"Tu contraseña se usará solo para validar tu información"*
- *"Completa los datos solicitados"*

Única excepción: textos legales o contractuales (términos, mandatos) donde el registro jurídico lo exige. Todo lo demás es tú.

---

## 1. Principios de redacción

1. **Claridad antes que completitud.** Una frase corta que se entiende le gana a una correcta pero larga. Si puedes decirlo en menos palabras sin perder sentido, hazlo.
2. **El usuario primero, el sistema después.** Habla de lo que la persona gana o tiene que hacer, no de cómo funciona el sistema por dentro.
3. **Di qué pasa después.** Todo mensaje de estado deja claro el siguiente paso. Nunca dejes a la persona sin saber qué viene.
4. **Honestidad sin alarmismo.** Cuando hay una consecuencia (un plazo que vence, datos que se borran), dila con claridad — pero sin asustar ni culpar.
5. **Lenguaje cotidiano, no jurídico.** "Documento", "deuda", "plazo" — no "instrumento", "obligación crediticia", "término perentorio". El término técnico solo cuando no hay equivalente simple.
6. **Mayúscula solo inicial, no Title Case.** Títulos y botones llevan mayúscula en la primera letra nada más: *"Subir documento"*, no *"Subir Documento"*. Los nombres propios de documentos sí se capitalizan: *"Certificado de Dominio Vigente"*.
7. **Accesible para distintas formas de uso.** El texto debe funcionar para quien lee rápido, usa lector de pantalla, navega con teclado, tiene baja visión, está cansado o necesita volver a revisar. No dependas de posición, color o iconos sin nombrar la acción o el estado.
8. **Escaneable antes que decorativo.** Usa títulos, subtítulos, labels y agrupaciones que permitan encontrar rápido lo importante. Evita frases genéricas que suenan bien pero no describen la tarea.

---

## 2. Botones y llamados a la acción

**Patrón:** verbo en infinitivo o imperativo, concreto, que dice exactamente qué va a pasar.

- `Continuar`
- `Subir documento` · `Subir documentos ahora`
- `Guardar y continuar`
- `Guardar y enviar para revisión`
- `Volver al inicio`

**Reglas:**
- **Di el resultado, no la mecánica.** *"Guardar y enviar para revisión"* es mejor que *"Enviar"* porque anticipa qué ocurre.
- **Evita "Aceptar / OK" genéricos** cuando puedes nombrar la acción.
- **Los botones de confirmación restatean la elección.** En vez de Sí/No, el botón repite la decisión en las palabras del usuario:
  - Pregunta: *"¿Este archivo incluye las 3 liquidaciones?"*
  - Botones: *"Sí, contiene las 3 liquidaciones"* / *"No, es solo una liquidación"*
  - Así se elimina la ambigüedad de un Sí/No suelto y queda claro qué se confirma.
- **Máximo ~4 palabras**, salvo en los botones que restatean.
- **Un solo verbo por acción en todo el producto.** Para subir archivos, usa siempre **"subir documento"** (no alternes con "adjuntar archivo").

---

## 3. Títulos y encabezados

- **Secciones:** sustantivo, claro y escaneable. *"Documentos financieros"*, *"Documentación personal"*, *"Bienes"*, *"Instrucciones"*.
- **Títulos específicos.** Un título debe describir el tema o la tarea, no decorar la pantalla. *"Datos de la deuda"* es mejor que *"Tu información"* si la sección trata de deuda.
- **Palabras importantes al inicio.** La persona debe poder escanear en diagonal y reconocer campos, estados y acciones sin leer párrafos completos.
- **Agrupa con subtítulos cuando ayuda a evitar errores.** Divide datos personales, deudas, bienes y confirmación si la persona debe revisar cada bloque por separado.
- **No uses Title Case.** Todo texto de interfaz usa mayúscula solo inicial: títulos, headings, labels, menú, navegación, app bars y botones. Los nombres propios y términos de marca conservan su capitalización.
- **Ayuda contextual como pregunta del usuario.** Encabeza la ayuda con la duda real, en primera persona:
  - *"¿Cómo obtener este documento?"*
  - *"¿Cómo obtener tu clave de boletín comercial?"*
  - *"¿Necesitas ayuda visual?"*
  - *"¿Documento rechazado o vencido?"*
  - *"¿Problemas con un documento? Habla con el asistente virtual"*
- Usa la pregunta para entradas a ayuda, FAQ, asistente y estados problemáticos. Para títulos de sección operativa, usa sustantivo.

---

## 4. Consecuencias y confirmaciones

Cuando una acción tenga impacto, explica el resultado en lenguaje neutro, directo y verificable. No intentes empujar la decisión con miedo, culpa o dramatización.

**Patrón:** acción + consecuencia + posibilidad de deshacer o corregir, si existe.

- *"Enviar documentos para revisión"* → *"El equipo legal revisará estos documentos. Si falta algo, te pediremos corregirlo."*
- *"Eliminar documento"* → *"El documento saldrá de esta solicitud. Puedes volver a subirlo antes de enviar."*
- *"Reiniciar formulario"* → *"Se borrarán los datos ingresados en este paso. Podrás completarlos nuevamente."*

**Reglas:**
- Di qué pasará si la persona confirma la acción y qué podrá hacer después.
- Si existe una forma de deshacer, restaurar o corregir, nómbrala en el mismo mensaje.
- No exageres la consecuencia: evita *"perderás todo"*, *"acción irreversible"* o *"¿estás seguro?"* si puedes explicar el resultado concreto.
- No suavices una consecuencia real. Si un dato se borra, di que se borra; si queda en revisión, di que queda en revisión.
- En acciones sensibles, el botón debe repetir la acción concreta: `Eliminar documento`, `Enviar para revisión`, `Reiniciar formulario`.

**Evita:**
- *"¿Estás seguro?"* sin explicar qué cambia.
- Mensajes que intentan influir: *"No podrás avanzar si haces esto"* cuando en realidad hay una alternativa.
- Consecuencias ambiguas: *"Se actualizará tu caso"* sin decir qué se actualiza.

---

## 5. Mensajes de éxito

**Patrón:** exclamación celebratoria breve + qué pasa ahora + dónde hacer seguimiento.

- *"¡Tus documentos fueron enviados con éxito!"* → *"Estamos revisando los documentos. Podrás seguir su estado en la pestaña 'Enviados'."*
- *"¡Documentos cargados con éxito!"*
- *"Documentos guardados con éxito"* → *"Tu información se guardó correctamente."*

**Reglas:**
- El título celebra (con `¡!`); el cuerpo informa el siguiente paso.
- Nunca termines en el "éxito" a secas: di qué sigue (*"estamos revisando"*, *"podrás seguir su estado"*).
- Si hay un lugar donde seguir el proceso, nómbralo explícitamente.

---

## 6. Plazos, vencimientos y urgencia

El momento más delicado del tono: comunicar urgencia real **sin asustar**. Combina una consecuencia honesta con una salida siempre abierta.

- *"¡Llegaste al final del plazo!"* → *"Tienes 3 días adicionales para enviar tus documentos. Si no lo haces a tiempo, deberás reiniciar el proceso de documentación desde cero."*
- *"El plazo ha terminado, por favor sube tus documentos. Tu ejecutiva legal revisará tu información en conjunto con el abogado y te indicará los siguientes pasos."*
- *"Plazo cumplido. Aún puedes subir los documentos y estudiaremos tu caso."*

**Reglas:**
- **Siempre deja una puerta abierta.** Incluso con el plazo cumplido: *"Aún puedes subir los documentos y estudiaremos tu caso"*. Nunca un callejón sin salida.
- **La consecuencia se dice clara pero neutra:** *"deberás reiniciar el proceso desde cero"* es un hecho, no una amenaza. Sin "perderás todo", sin mayúsculas de pánico, sin exclamación en la consecuencia.
- **Humaniza el proceso.** Mencionar a *"tu ejecutiva legal"* y *"el abogado"* recuerda que hay personas reales acompañando — baja la ansiedad.
- **Cuenta regresiva con número visible** (*"15 días"*, *"3 días adicionales"*) para que la urgencia sea concreta, no vaga.

---

## 7. Estados de documentos / ítems

Estados cortos, una o dos palabras, consistentes en todo el producto:
- `Documento subido` · `Aprobado` · `En revisión` · `Documento rechazado` · `Documento vencido`

**Reglas:**
- Un solo término por estado, en todas las pantallas. No alternes *"rechazado"* / *"no aprobado"* / *"denegado"*.
- Cuando un estado es problemático (rechazado/vencido), **acompáñalo siempre de la acción de salida**:
  - *"Si un documento aparece como rechazado o vencido, haz clic en [ícono] para conocer el motivo y subirlo nuevamente."*
- El estado dice qué pasó; el texto de apoyo dice qué hacer.

---

## 8. Instrucciones y ayuda contextual

Explica el *cómo* paso a paso, con lenguaje de acción directa:
- *"Completa los datos solicitados y descarga el PDF."*
- *"Puedes hacer clic en cada imagen para abrirla en tamaño completo."*
- Referencias concretas a sitios reales: *"www.registrocivil.cl"*.

**Reglas:**
- Imperativo amable en segunda persona: *"Completa"*, *"Descarga"*, *"Haz clic"*.
- Pasos en el orden exacto en que se ejecutan.
- Nombra herramientas y sitios reales sin rodeos; la persona los va a buscar.
- Cuando ofrezcas ayuda extra, enmárcala como beneficio: *"¿Necesitas ayuda visual?"* antes de explicar el truco.
- Evita abreviaturas si hay espacio para escribir la palabra completa. Usa *"por ejemplo"* en vez de *"ej."*, *"y otros documentos"* en vez de *"etc."*.
- Si una abreviatura es necesaria o muy conocida en el dominio, escríbela de forma consistente y con apoyo contextual cuando pueda confundirse. Por ejemplo, `RUT` puede usarse, pero el label debe ser claro: *"RUT del solicitante"*.

---

## 9. Confianza, privacidad y datos sensibles

Cuando pidas algo sensible (una clave, un dato personal), **explica para qué y da garantía** en el mismo momento del pedido.

- *"Tu contraseña se usará solo para validar tu información en el Boletín Comercial, garantizando la confidencialidad y protección de tus datos."*

**Reglas:**
- Junto al campo sensible, explica **para qué se usa** y **que está protegido**.
- Acota el uso ("solo para…") — nada de propósitos vagos.
- Nunca pidas un dato sensible sin justificarlo ahí mismo.

---

## 10. Campos de formulario

- **Placeholder = instrucción de acción:** *"Ingresa tu clave aquí"*.
- Label corto y claro; el placeholder ejemplifica o instruye, no repite el label.
- Mensajes de error: di qué pasó y cómo arreglarlo, en tono neutro (*"Ingresa un correo válido"*, no *"Error de validación"*).
- El label debe existir aunque haya placeholder. El placeholder no reemplaza al label.
- Si un campo es obligatorio, dilo de forma consistente y accesible; no dependas solo de un asterisco sin explicación.
- Para botones con solo icono, escribe un `aria-label` claro: `Eliminar deuda`, `Abrir ayuda`, `Cerrar`.
- Los estados deben leerse como texto: `En revisión`, `Documento rechazado`, `Guardado`, no solo por color.

---

## 11. Glosario de términos preferidos

| Usa | Evita |
|---|---|
| documento | instrumento / archivo adjunto |
| subir un documento | adjuntar archivo |
| deuda | obligación crediticia |
| plazo | término / fecha perentoria |
| revisar tu caso | analizar el expediente |
| tu ejecutiva legal / el abogado | el equipo jurídico |
| contraseña | credencial |
| enviar para revisión | someter a evaluación |
| por ejemplo | ej. / e.g. |
| y otros documentos | etc. |

---

## 12. Checklist antes de publicar un texto

1. ¿Está en **tú**?
2. ¿Se entiende en una lectura, sin jerga jurídica?
3. Si es un estado o acción, ¿dice **qué pasa después**?
4. Si hay una consecuencia, ¿está dicha **clara, neutra y sin asustar**, con opción de deshacer o corregir cuando exista?
5. ¿El botón dice el **resultado concreto** de la acción?
6. ¿Usa el **término del glosario** y es consistente con el resto del producto?
7. ¿Mayúscula solo inicial (no Title Case)?
8. ¿Los títulos y subtítulos permiten escanear la pantalla rápido?
9. ¿Evitaste abreviaturas innecesarias?
10. ¿Sobra alguna palabra? Quítala.

> La prueba final: léelo imaginando que se lo dices, de tú, a alguien que está estresado y no sabe de leyes. Si suena claro, cálido y le deja claro el siguiente paso — está listo.
