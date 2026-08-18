# Contexto de este proyecto

> **Para agentes de IA:** lee este archivo al comenzar cada sesión de diseño y
> mantenlo al día. Es la memoria del proyecto: captura una sola vez lo que el
> diseñador ya decidió, para no volver a preguntarlo en cada sesión.
>
> - Si una sección dice _Por definir_, **pregunta** lo que necesites en la
>   primera tarea que lo requiera y **escribe aquí la respuesta**.
> - Cuando el diseñador tome una decisión de alcance, audiencia o referencia
>   («esto es para clientes», «usa este Figma», «sin login por ahora»),
>   **regístrala aquí** en una línea.
> - Mantén el archivo corto (una pantalla). Esto no es documentación: es el
>   brief vivo del proyecto.
>
> Lo técnico no va aquí: `architecture`, `world`, `addons` y rutas viven en
> `.lexy` (fuente de verdad técnica, no la dupliques).

## Qué estamos construyendo

Plataforma para que las personas completen los antecedentes de las gestiones legales que su abogado ya les recomendó para reorganizar preventivamente su patrimonio y protegerlo frente a embargos u otras perturbaciones legales.

## Para quién es

<!-- Quién lo usa y en qué situación. Si .lexy trae world=mixto, aquí se
     aclara qué partes son cliente y cuáles CRM. -->

Clientes que ya recibieron una recomendación de su abogado y necesitan entregar sus datos con claridad y calma para preparar las gestiones definidas. Es una experiencia del mundo cliente.

## Pantallas y flujos clave

<!-- Lista corta de las vistas que importan, con su objetivo. Ej:
     - Intake de antecedentes (cliente): que la persona entregue sus datos con calma.
     - Desk de casos (CRM): que el abogado vea estado y plazos de un vistazo. -->

- Fichas guiadas por contrato: reunir datos personales, bienes, otras personas comparecientes y documentos necesarios.
- Bienes a transferir o proteger: individualizar los bienes definidos con el abogado sin presentar la gestión como una decisión comercial espontánea.

## Datos principales

<!-- Resumen humano, no catálogo técnico:
     - Objetos principales que existen en la experiencia.
     - Datos que la persona necesita ver o modificar.
     - Supuestos que todavía debe validar TI.

     La fuente estructurada de entidades, campos, relaciones, estados y
     proyecciones vive en:
     src/prototype/data-contract/prototype-data-contract.ts
     No dupliques aquí el detalle del contrato. -->

- Personas, bienes y derechos asociados a cada gestión.
- Contrapartes, socios, apoderados y autorizantes que deban comparecer.
- Documentos exigidos según el contrato y las respuestas de la ficha.

## Referencias

<!-- Links de Figma, capturas o productos de referencia que mandan sobre
     composiciones genéricas. Indica qué parte del proyecto cubre cada una. -->

- `C:\Users\valen\Downloads\FICHACONSTITUCION_SOCIEDAD.docx`: referencia de contenido para los datos de constitución de sociedad; se excluye su sección de documentos.

## Decisiones y restricciones

<!-- Decisiones ya tomadas que un agente no debe re-litigar, y límites del
     encargo. Una línea por decisión, con fecha si ayuda. -->

- Proyecto generado con `create-lexy` el {{GENERATED_AT}} con el nombre `{{PROJECT_NAME}}`.
- 2026-08-02: todas las fichas muestran sobre la cabecera el breadcrumb `Mis gestiones > [nombre de la gestión — identificador real]`; el identificador usa la misma regla del portal y se omite mientras no exista, sin generar referencias artificiales ni repetir el paso actual del stepper.
- 2026-07-15: los datos del cónyuge o conviviente civil se completan en un paso condicional inmediatamente después de los datos personales; pacto de sustitución y liquidación de sociedad conyugal usan ese paso en lugar del paso de tercero.
- 2026-07-21: se elimina el contrato "Otro" y se agregan "Resciliación" (datos personales, contraparte y documentos, sin paso de bien) y "Renuncia a los gananciales" (datos personales, cónyuge o excónyuge y documentos, sin paso de bien).
- 2026-07-22: el tercero de confianza es la persona elegida por el cliente para transferirle sus bienes.
- 2026-08-18: el paso Tercero mantiene el título "Datos de tu tercero de confianza", pero su bajada nombra el objeto concreto en compraventas de acciones, establecimiento comercial y patente comercial; en Aporte inmobiliario SRL explica que la persona participará en la sociedad a la que se aportará el inmueble.
- 2026-07-22: si un inmueble fue adquirido por herencia, con o sin posesión efectiva inscrita, la gestión cambia inmediatamente a "Cesión de derechos hereditarios".
- 2026-07-22: en inmuebles no hereditarios se pregunta si el cliente es la única persona propietaria; si hay copropiedad, la gestión cambia a "Cesión de derechos" y puede restaurar el contrato original si cambia la respuesta.
- 2026-07-22: todo el portal, incluidos formularios y confirmación, ofrece un acceso flotante y discreto a WhatsApp con el Ejecutivo/a Legal asignado mediante configuración de entorno.
- 2026-07-22: en transferencias, el tercero nunca puede ser cónyuge ni una persona incapaz; edad menor a 21 años, parentesco directo y falta de ingresos estables suman señales de riesgo que requieren recomendación de cambio y aceptación explícita para continuar.
- 2026-07-23: en los datos del bien, "Tipo de adquisición" es la primera pregunta y actúa como enrutador progresivo; solo después se muestran los campos existentes que correspondan. Los cambios de adquisición o titularidad deben restaurar la gestión original de forma reversible, sin agregar campos.
- 2026-07-23: en transferencias de inmuebles, si cliente y tercero viven en regiones distintas se consulta si pueden firmar juntos. Si no pueden, se agrega un "Mandato con autocontrato" cuando una parte firmará por ambas, o un "Mandato" general cuando firmará una persona externa.
- 2026-07-27: en "Constitución de sociedades" siempre se confirman primero los datos del cliente; los datos de la sociedad incluyen nombre y tipo societario, capital, cantidad total de acciones para SpA/S.A., duración, domicilio y administración. E.I.R.L. omite el segundo socio; SpA/S.A. piden las acciones del segundo socio y Limitada su porcentaje de derechos sociales en la sección de esa persona, además de los datos personales estándar y la regla de tener 18 años o más.
- 2026-07-28: E.I.R.L. no pregunta quién administra. SpA y Limitada preguntan quién administrará, y S.A. quién representará, con opciones cliente, segundo socio u otra persona; si es otra persona, sus datos personales completos se solicitan junto a los del segundo socio y debe tener 18 años o más.
- 2026-07-28: todas las constituciones, incluidas E.I.R.L., SpA, S.A. y Limitada, preguntan obligatoriamente en lenguaje cotidiano a qué se dedicará la sociedad.
- 2026-07-28: "Constitución de sociedades" nunca solicita documentos; al guardar el último paso de datos, la ficha se envía directamente y muestra la confirmación.
- 2026-07-28: en "Liquidación de sociedad conyugal", si el cliente responde que no adquirió inmuebles ni vehículos durante el matrimonio, la gestión cambia a "Pacto de sustitución de régimen matrimonial"; el régimen de destino es siempre separación de bienes y no se presenta como elección. Si corrige cualquiera de las respuestas a "Sí", vuelve a la liquidación.
- 2026-07-28: en transferencias de inmuebles, si el tercero de confianza está casado bajo sociedad conyugal o tiene AUC bajo comunidad de bienes, se solicitan los datos de su cónyuge o conviviente civil porque debe comparecer a autorizar; queda vinculado al tercero, a la gestión y al cliente.
- 2026-07-29: la evaluación de transferencia pregunta por facultades mentales solo cuando el tercero tiene más de 60 años y siempre solicita el certificado que exigirá la notaría, emitido por psiquiatra o neurólogo. El campo incluye una ayuda breve que orienta a responder “No” cuando una condición como el alzhéimer o una demencia avanzada le impide tomar decisiones por sí misma. Si se responde que no está en plenas facultades mentales, la transferencia queda bloqueada y se debe elegir a otra persona. También se advierte que el tercero debe poder acreditar ingresos porque, de lo contrario, el SII podría cuestionar la transferencia.
- 2026-07-29: los campos completados usan un fondo gris muy tenue y vuelven a blanco al recibir foco; el morado suave queda reservado para cards condicionales que requieren una decisión, como “Firma del contrato”. Las ayudas pasivas permanecen neutras y los mensajes o estados informativos usan los tokens `info`.
- 2026-07-29: el identificador junto al nombre de cada gestión se deriva exclusivamente de sus datos reales: dirección en contratos de inmueble, arriendo y aporte inmobiliario SRL; placa patente en contratos de vehículo; razón social en compraventas de acciones; nombre de la sociedad en constituciones. En cesión de derechos hereditarios muestra la dirección si existe un solo inmueble o “(N inmuebles)” si hay varios. Bienes muebles, mandatos, liquidación de sociedad conyugal, establecimiento o patente comercial, declaración de allegado, pacto, renuncia a los gananciales y resciliación no muestran especificación. No se generan identificadores aleatorios.
- 2026-07-29: el paso de tercero no solicita una confirmación adicional de que los datos estén correctos. La completitud de los campos habilita el avance directamente en terceros de confianza, cónyuges, segundos socios, administradores, representantes y mandatos; la aceptación explícita de señales de riesgo se mantiene cuando corresponde.
- 2026-07-29: la evaluación del tercero presenta las señales revisables en una card con fondo amarillo cálido al 2%, borde del mismo tono y sin cajas anidadas. Usa un texto compacto para explicar que el SII o un tribunal podrían cuestionar la transferencia, recomienda elegir a una persona que no sea pariente y tenga ingresos estables, y exige una aceptación explícita para continuar. El rojo queda reservado para impedimentos que bloquean la transferencia.
- 2026-07-29: solo en "Transferencia de vehículo RC", el paso de tercero se reemplaza por "Registro Civil" y entrega instrucciones para realizar presencialmente una declaración consensual, sin preparar un contrato notarial. Al continuar se eliminan posibles datos de tercero y el único documento obligatorio es el comprobante de solicitud de transferencia emitido por el Registro Civil.
- 2026-08-18: en "Transferencia de vehículo RC", la bajada del paso "Agenda tu atención" comienza con `Reserva una hora` como enlace directo al sistema institucional de reservas del Registro Civil. Se integra en el texto continuo, separado del acceso a los requisitos oficiales y se abre en una pestaña nueva.
- 2026-07-29: "Compraventa de vehículo" y "Transferencia de vehículo RC" preguntan obligatoriamente si existe una prenda vigente, solo con respuestas Sí/No. Si existe, preguntan cuántas cuotas faltan y, salvo que la deuda ya esté pagada, si las cuotas pendientes están al día. La gestión queda en espera únicamente cuando quedan entre una y tres cuotas y todas están al día. Con mora, más de tres cuotas o una deuda pagada cuyo alzamiento aún está pendiente, la transferencia queda bloqueada; si concurren más de tres cuotas y mora, el mensaje debe mencionar ambas causas. Solo puede continuar cuando la prenda ya no esté vigente.
- 2026-07-29: en "Transferencia de vehículo RC", el permiso de circulación debe estar al día; responder No bloquea el avance al Registro Civil. En "Compraventa de vehículo", un permiso de circulación vencido no impide completar ni preparar el contrato.
- 2026-07-29: en transferencias de vehículos, la acción final de los datos del bien cambia según el resultado: "Guardar y continuar" cuando puede avanzar, "Guardar en espera" únicamente para una a tres cuotas al día y "Guardar estado" cuando la transferencia no puede continuar. Esta última conserva los antecedentes, vuelve al portal y muestra el estado "No puede continuar" con la acción "Actualizar estado".
- 2026-07-28: "Constitución de sociedades" no pregunta por aporte de bienes; tampoco conserva tipo ni descripción de bienes aportados de respuestas anteriores.
- 2026-07-28: en "Mandato" y "Mandato con autocontrato" se seleccionan uno o más tipos de bienes; cuando se incluyen inmuebles, el cliente puede agregar varios y completa dirección, comuna y región para cada uno.
- 2026-07-28: la pregunta sobre disponibilidad para firmar juntos se muestra, solo cuando cliente y tercero viven en regiones distintas, en transferencias de inmuebles —compraventa, cesión o derechos hereditarios—, compraventa de vehículo y compraventa de bienes muebles. Si se crea un mandato por falta de firma conjunta, queda vinculado al contrato principal: el bien se prerrellena y su especificación se sincroniza en ambos sentidos.
- 2026-07-28: la disponibilidad para firmar juntos también se pregunta en "Compraventa de acciones (Régimen tradicional)" y nunca en "Empresa en un Día"; los datos de las acciones se comparten con el mandato vinculado.
- 2026-07-29: ambas compraventas de acciones preguntan el tipo societario —SRL, SpA o S.A.—. Para SRL solicitan participación porcentual; para SpA y S.A., número de acciones. Los campos incompatibles se excluyen al cambiar la selección y el mismo detalle se sincroniza con el mandato vinculado. Cada campo "Razón social de la empresa" incluye ayuda que lo explica como el nombre legal de la empresa.
- 2026-07-28: en un "Mandato" simple se pregunta si el poder lo otorga el cliente o el tercero del contrato principal, y luego quién será la persona apoderada; los datos ya conocidos se reutilizan. En "Mandato con autocontrato" se pregunta únicamente si el cliente firma también por el tercero o si el tercero firma también por el cliente, reutilizando a ambas partes cuando ya están registradas.
- 2026-07-28: todas las fichas son completadas directamente por la persona contratante. El texto visible siempre le habla de "tú" y usa "tus datos"; "cliente" queda reservado para identificadores y documentación interna.
- 2026-07-28: en un mandato general, la persona apoderada debe tener un RUT distinto tanto de la persona contratante como de la otra parte del contrato; una coincidencia muestra una alerta junto al RUT e impide continuar.
- 2026-07-28: compraventa y comodato de bienes muebles usan una tabla editable porque habitualmente se ingresan más de diez bienes. En escritorio se muestran filas alineadas; en móvil, cada fila se transforma en un bloque compacto sin desplazamiento horizontal. Se puede agregar y eliminar cualquier bien; no se ofrece una acción para duplicarlo.
- 2026-07-28: el contexto interno considera que la gestión forma parte de una reorganización patrimonial preventiva definida con asesoría legal, pero la interfaz nunca atribuye instrucciones o decisiones al abogado. En bienes muebles, compraventa usa "Bienes a transferir" y comodato usa "Bienes a proteger"; este mismo título identifica el paso y encabeza una sola vez su contenido.
- 2026-07-28: toda entrega que modifique textos de las fichas debe incluir en la conversación un detalle exhaustivo, separado por contrato, con cada texto anterior y su reemplazo exacto.
- 2026-07-28: en bienes muebles se pide inventariar los bienes de mayor valor del hogar y describirlos con precisión, incluyendo tamaño, material o número de serie cuando corresponda; los bienes iguales pueden agruparse por cantidad y se indica "Sin marca" cuando aplique.
- 2026-07-29: compraventa y comodato de bienes muebles no solicitan documentos; al guardar el último paso de datos, la ficha se envía directamente y muestra la confirmación. Se elimina del producto la declaración jurada de dominio de bienes muebles.
- 2026-08-02: cada documento solicitado muestra siempre en la plataforma una instrucción breve para obtenerlo, sin enlaces externos. La vigencia máxima de un mes se informa como texto integrado, sin card; “Importante:” usa el mismo color `primary` del timeline y los énfasis tienen peso medio. Cada requisito ocupa todo el ancho: nombre y estado forman la cabecera, la explicación no se comprime y una franja inferior alinea el archivo a la izquierda con las acciones agrupadas a la derecha. Al cargar queda “Pendiente de aprobación” con amarillo real (`yellow-50`, `yellow-200`, `yellow-700`) porque el token `warning` del producto es naranjo, y solo se puede visualizar; el equipo legal puede aprobar o rechazar con motivo, y únicamente un rechazo habilita `Reemplazar`.
- 2026-08-02: el pie de la etapa de documentos mantiene una sola acción de regreso, `Volver`, alineada a la izquierda como en el resto de la ficha; no repite `Volver al portal`.
- 2026-08-02: el panel de simulación permite forzar por documento los estados `Sin cargar`, `Pendiente de aprobación`, `Aprobado` y `Rechazado`, genera un archivo sintético para los estados cargados, agrega un motivo determinista al rechazo y ofrece acceso directo a la etapa de documentos de la gestión.
- 2026-08-02: solo "Compraventa de patente comercial" pregunta obligatoriamente en "Datos del bien" cómo fue constituida la sociedad, con las opciones visibles "Escritura pública firmada en notaría" y "Empresa en un Día".
- 2026-08-02: los documentos se resuelven por escritura desde una única matriz de requisitos. Liquidación de sociedad conyugal deriva certificados según vehículos e inmuebles declarados; compraventa de patente comercial no pide documentos para Empresa en un Día y solicita antecedentes societarios para constitución tradicional. Las escrituras declaradas sin documentos omiten esa etapa.
- 2026-08-02: en cesión de derechos hereditarios y liquidación de sociedad conyugal, los documentos registrales se solicitan por cada bien y, cuando hay más de uno, reutilizan los identificadores del producto: dirección para inmuebles y placa patente para vehículos. Un mandato vinculado comparte la lista, los archivos y los estados documentales con su contrato principal en ambos sentidos.
- 2026-08-02: el libro de accionistas se obtiene en el Servicio de Impuestos Internos, en línea o de forma presencial. Ningún contrato solicita una copia de la cédula de identidad como documento para cargar; las menciones a llevar la cédula a un trámite presencial son solo instrucciones del trámite.
- 2026-08-02: la bajada de cada documento explica primero, en lenguaje simple, qué acredita o para qué sirve y luego dónde obtenerlo, sin enlaces ni salidas de la plataforma.
- 2026-08-03: la acción final de la ficha se llama `Enviar ficha`, tanto cuando a continuación corresponde cargar documentos como cuando la gestión no solicita documentos. Las acciones intermedias conservan sus textos actuales y los estados excepcionales de vehículos mantienen `Guardar estado` o `Guardar en espera`.
- 2026-08-03: al presionar `Enviar ficha`, los datos de esa gestión quedan bloqueados para el cliente. Puede volver a los pasos anteriores y recorrerlos en modo de solo lectura, pero no modificar campos, confirmaciones ni colecciones; la etapa de documentos permanece operativa. La ficha informa este estado con una bajada breve y solo TI o el equipo autorizado podrá definir una reapertura futura.
- 2026-08-03: después del envío exitoso aparece un diálogo pequeño de confirmación antes de cambiar de etapa. Usa una superficie blanca con borde primario sutil, más aire, un ícono primario visible y contenido centrado; el título tiene peso semibold y la bajada usa cuerpo pequeño, con una separación ligeramente mayor entre ambos. Si la escritura solicita documentos, explica que ahora corresponde subirlos y ofrece `Subir documentos`; si no los solicita, confirma el envío para revisión y ofrece `Continuar`. Es la única acción visible y queda centrada; se elimina `Revisar ficha`.
- 2026-08-03: se elimina la página independiente `Información recibida`. Después de la confirmación modal o del envío de documentos se vuelve al portal. En una gestión `En revisión` o `Completada`, `Ver detalle` abre la ficha desde `Datos personales`; todos los pasos guardados pueden recorrerse en modo de solo lectura y los campos permanecen bloqueados.
- 2026-08-03: al revisar una ficha enviada, la confirmación de datos personales permanece visible como marcada aunque esté bloqueada y se separa claramente del último campo del formulario.
- 2026-08-03: mientras se completa la ficha, solo los pasos anteriores navegables muestran cursor de enlace; el actual y los futuros mantienen cursor neutro. Una vez enviada, la línea, todos los círculos y sus etiquetas permanecen en color primario, y cada paso queda habilitado con cursor de enlace para recorrer la ficha en modo de solo lectura.
- 2026-08-03: en cesión de derechos hereditarios, la comuna de cada inmueble define a quién puede elegirse. Las jurisdicciones de San Miguel —San Miguel, San Joaquín, La Granja, La Pintana, San Ramón, El Bosque, Pedro Aguirre Cerda, Lo Espejo y San Bernardo— y Villa Alemana exigen que la persona elegida también sea heredera; todas las demás comunas permiten elegir a otra persona heredera o a alguien externo a la herencia. Con varios inmuebles prevalece la regla restrictiva. El paso de tercero explica la regla en lenguaje cotidiano y exige confirmar o indicar el vínculo antes de continuar.
- 2026-08-03: un mandato creado para resolver la firma comienza en `pendiente_datos` y debe recorrer sus propios pasos aunque comparta bienes y documentos con el contrato principal. El portal y las rutas priorizan el primer paso realmente incompleto sobre el estado general; Documentos solo se abre cuando las etapas anteriores están completas. Cambiar entre mandato general y mandato con autocontrato reinicia el avance propio de la ficha, sin perder bienes ni estados documentales compartidos.
- 2026-08-03: la gestión mock de Cesión de derechos hereditarios que parte en `faltan_documentos` incluye datos personales confirmados, una propiedad heredada ubicada en Providencia y una tercera persona externa a la herencia con antecedentes sintéticos completos. Al revisar la ficha en modo de solo lectura, todos los pasos previos deben ser coherentes con la fase documental mostrada en el portal.
- 2026-08-03: una misma persona puede ser tercero de confianza en un máximo de dos escrituras entre Aporte inmobiliario SRL, Compraventa de inmueble, Compraventa de inmueble y usufructo, Cesión de derechos, Compraventa de nuda propiedad y Cesión de derechos hereditarios. Se compara el RUT normalizado entre gestiones principales, cada escritura cuenta una vez aunque incluya varios bienes, y se excluyen Liquidación de sociedad conyugal y los mandatos. El segundo uso se informa sin bloquear; el tercero muestra un error en una fila completa bajo el RUT y bloquea el guardado sin desalinear los campos.
- 2026-08-03: la persona contratante nunca puede ingresar su propio RUT en los datos de otra persona del paso Tercero, incluidos tercero de confianza, contraparte, segundo socio y apoderado. Los RUT se comparan normalizados, el error ocupa una fila completa bajo la pareja Apellido materno/RUT para conservar la alineación y el avance queda bloqueado; el store repite la invariante cuando guarda datos de tercero.
- 2026-08-09: en todos los pasos editables de la ficha —Datos personales, Datos del bien, Cónyuge y Tercero— la acción para guardar y continuar permanece habilitada aunque falten campos rellenables por la persona. Al intentar avanzar, la interfaz destaca cada campo incompleto, muestra un mensaje independiente inmediatamente debajo y lleva el foco al primero; no usa una card resumen y los errores no aparecen antes del primer intento. La confirmación de Datos personales también se destaca y recibe foco, pero no agrega un mensaje redundante bajo una declaración que ya explica qué debe confirmarse. Los impedimentos legales o técnicos, como identidad coincidente, minoría de edad o una transferencia bloqueada, conservan su tratamiento específico y no se confunden con falta de datos.
- 2026-08-18: Compraventa y Comodato de bienes muebles conservan el borde de error en cada celda incompleta y el foco en la primera, pero muestran un único mensaje de completitud debajo de toda la tabla; en móvil la misma colección agrupada mantiene este comportamiento. Los formularios y colecciones presentados como tarjetas conservan mensajes por campo.
- 2026-08-09: ninguna persona ingresada como tercero, segundo socio, administrador o representante puede ser menor de 18 años. La fecha de nacimiento se marca con un error específico, el formulario no avanza y el store repite la validación. Entre 18 y 20 años continúa siendo una señal revisable que requiere aceptación cuando corresponda. El checkbox y el texto de aceptación de riesgos permanecen siempre en la misma fila; su posible error se ubica debajo del conjunto.
