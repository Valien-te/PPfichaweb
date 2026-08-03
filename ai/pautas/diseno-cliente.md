# Lexy — Filosofía de Diseño

> Hacemos fácil lo legal.

Este documento no contiene tokens, colores ni medidas. Es la brújula. Si alguna vez no sabes qué decisión tomar, vuelve aquí: describe *cómo se siente* Lexy, no *cómo se construye*. Las especificaciones técnicas viven en otro lugar; esto vive en el criterio.

---

## 1. Quiénes somos cuando diseñamos

Lexy existe para una persona que está, casi siempre, en un mal momento: la despidieron, la está ahogando una deuda, un error médico le cambió la vida. Llega asustada, desinformada y convencida de que "lo legal" es un mundo hostil hecho para dejarla afuera.

Nuestro trabajo de diseño tiene un solo propósito: **bajarle las pulsaciones**. Todo lo que diseñamos debe hacer que esa persona respire un poco más tranquila. Si una pantalla, un texto o una composición genera ansiedad, intimida o confunde, está mal diseñada — por muy bonita que sea.

No somos un estudio jurídico que se ve moderno. Somos una empresa de tecnología que resuelve problemas legales. Esa diferencia de identidad lo cambia todo: no buscamos transmitir solemnidad, prestigio ni autoridad inalcanzable. Buscamos transmitir **claridad, cercanía y control**.

---

## 2. La sensación que perseguimos

Si tuviéramos que resumir el "feel" de Lexy en una imagen: **una conversación tranquila con alguien que sabe lo que hace y no te hace sentir tonto.**

- **Claro, no simplón.** Simplificamos lo complejo sin tratar al usuario como si no entendiera nada. Respeto e inteligencia, siempre.
- **Cercano, no informal.** Hablamos de tú, con calidez, pero nunca perdemos la credibilidad. Somos el abogado amigo, no el amigo que improvisa.
- **Moderno, no frío.** La tecnología está al servicio de la persona, no para presumir. Nada de futurismo gélido ni minimalismo que parece hospital.
- **Seguro, no arrogante.** Transmitimos que esto va a salir bien, sin prometer imposibles ni inflar el pecho.

Cuando dudemos del tono de algo, la pregunta es: *¿esto tranquiliza o impresiona?* Siempre elegimos tranquilizar.

---

## 3. Principios de diseño

**1. Primero la legibilidad, después todo lo demás.**
Un texto que no se lee con comodidad es un fracaso, sin importar qué tan lindo se vea el fondo. La decoración nunca le gana al contenido. Si hay que elegir entre un recurso visual impactante y la claridad de un mensaje, gana el mensaje.

**2. El espacio es parte del mensaje.**
El aire comunica calma. Una composición apretada le grita al usuario que ya está sobrepasado. Damos respiro generoso, dejamos que las cosas respiren, no llenamos cada rincón porque sí.

**3. Una idea por pantalla.**
Acompañamos a la persona paso a paso. No la abrumamos con todo a la vez. Cada momento del recorrido tiene un foco claro y una sola cosa importante que hacer o entender.

**4. Menos, pero mejor.**
Mil "no" por cada "sí". No agregamos secciones, datos, íconos ni adornos para "rellenar" o para parecer más completos. Cada elemento se gana su lugar o no entra. Si una pantalla se siente vacía, es un problema de composición, no una invitación a meter más cosas.

**5. Consistencia que genera confianza.**
La persona aprende a usar Lexy una vez y confía en que va a funcionar igual siempre. La sorpresa es enemiga de la tranquilidad. Repetimos patrones, no reinventamos en cada pantalla.

**6. Honestidad visual.**
No escondemos costos en letra chica, no disfrazamos errores, no usamos trucos para empujar decisiones. El diseño refleja la misma transparencia que prometemos en el servicio. Si algo es malo para el usuario, no lo maquillamos.

**7. Accesibilidad por defecto.**
La persona puede estar estresada, cansada, con baja visión, con poca motricidad, usando el teléfono en malas condiciones o apoyándose en tecnología asistiva. Diseñamos para esas variaciones desde el inicio. Una interfaz cliente debe poder leerse con comodidad, navegarse con teclado, entenderse sin depender solo del color y corregirse sin culpa ni confusión. Los mínimos WCAG son punto de partida; la meta es que más personas puedan completar el flujo con autonomía.

---

## 4. Patrones de interfaz cliente

### Ficha web o formulario de antecedentes

Cuando el encargo sea una ficha web, intake, formulario de antecedentes o carga de datos para revisión legal, no diseñes una landing. La pantalla debe sentirse como un trámite guiado y tranquilo, no como una página comercial.

Patrón recomendado:

- Flujo por pasos cuando la información sea extensa.
- Stepper visible si hay varias etapas.
- Una sección principal por pantalla o paso.
- Título directo de la tarea, por ejemplo `Datos personales`.
- Copy breve que explique para qué se piden los datos.
- Nota clara para campos obligatorios si corresponde.
- Formulario de ancho contenido, legible, con pares de campos solo cuando ayudan a escanear.
- CTA principal claro al final del paso, por ejemplo `Guardar y continuar`.
- Ayuda contextual o flotante cuando reduzca ansiedad sin competir con el formulario.

Evita:

- Hero grande con claim emocional.
- Eyebrows como `Ficha`, `Evaluación`, `Nuevo caso` si no aportan orientación.
- Cards envolviendo cada bloque de formulario cuando el patrón necesita continuidad.
- Aside explicativo o resumen lateral si el diseño de referencia no lo muestra.
- Iconos decorativos para cada sección.
- Meter todas las etapas en una sola pantalla para parecer completo.

Si una referencia de Figma muestra una ficha de un paso, respeta ese patrón: stepper, foco único, densidad, campos y CTA. No la transformes en dashboard ni en formulario completo multi-sección salvo que el encargo lo pida.

---

## 5. Identidad visual — el espíritu, no la receta

**El isotipo es nuestra firma.** La marca tiene un símbolo propio que comunica activación, conexión y "encendido" — la chispa de poner las cosas en movimiento. Lo tratamos con respeto: tiene aire alrededor, protagonismo cuando corresponde, y nunca lo deformamos ni lo recargamos. Funciona mejor como gesto grande y seguro que como adorno pequeño y repetido sin criterio.

**Los fondos y patrones son atmósfera, no ruido.** La marca tiene un mundo gráfico propio, con texturas y patrones construidos a partir de su símbolo. Los usamos para dar identidad y profundidad — pero **siempre subordinados al contenido**. Un patrón nunca compite con un texto. Cuando hay que comunicar algo importante, el fondo se hace a un lado: se atenúa, se calma, se vuelve telón. La regla de oro: si tienes que entrecerrar los ojos para leer encima de un fondo, el fondo perdió.

**La tipografía tiene jerarquía clara.** Hay una voz para los grandes momentos — los titulares, las portadas, lo que tiene que emocionar y quedar — y otra voz para el trabajo diario — los textos largos, las interfaces, lo que tiene que leerse sin esfuerzo durante minutos. No confundimos los roles: lo expresivo para destacar, lo legible para acompañar. Mezclar mal estos registros es la forma más rápida de que algo se sienta poco profesional.

**El color tiene jerarquía emocional.** Hay un color que es la marca, que aparece donde importa y dirige la mirada. Hay tonos de apoyo que crean ambiente. Y hay colores con trabajo funcional — avisar de un éxito, una alerta, un error — que tienen que leerse como lo que son, universalmente, sin que el usuario tenga que aprender un código. Un estado de éxito se siente como éxito; una alerta se siente como alerta. Nunca sacrificamos esa claridad funcional por coherencia estética.

**Las submarcas son familia, no clones.** Lexy tiene líneas especializadas. Cada una tiene su matiz propio que la hace reconocible, pero todas pertenecen claramente a la misma casa. Se sienten hermanas: comparten estructura, tono y espíritu, y se diferencian con sutileza, no con estridencia.

---

## 6. Voz y tono editorial

La forma en que escribimos *es* diseño. Un buen layout con mal texto es un mal producto.

**Cómo suena Lexy:**

- **Hablamos de tú.** Cercanía directa, nunca el "usted" distante y acartonado de los abogados tradicionales.
- **Primera persona plural.** "Hacemos", "creemos", "te acompañamos". Estamos del mismo lado de la mesa que el usuario, no enfrente.
- **Frases cortas y humanas.** Decimos "lo legal", no "la materia jurídica". Si una palabra técnica se puede reemplazar por una cotidiana sin perder precisión, la reemplazamos.
- **Primero el beneficio, después la prueba.** Abrimos con lo que la persona gana, no con nuestras credenciales ni con latinazgos.
- **Énfasis con intención.** Cuando queremos destacar una idea, lo hacemos en un solo gesto y sobre una sola palabra — el diferenciador, el verbo que importa. No acumulamos recursos de énfasis ni gritamos con mayúsculas y signos. Un acento bien puesto vale más que diez.

**Lo que nunca hacemos:**

- No usamos jerga legal para impresionar.
- No prometemos lo que no podemos cumplir.
- No asustamos para vender ("si no actúas ya, lo pierdes todo").
- No usamos emoji: no son parte de nuestra identidad y diluyen la credibilidad.
- No escribimos párrafos eternos donde basta una frase.

**La prueba del tono:** lee cualquier texto en voz alta imaginando que se lo dices a alguien recién llegado, asustado, sentado frente a ti. Si suena a folleto corporativo, a contrato o a robot, reescríbelo. Si suena a una persona competente y amable explicándole las cosas con calma — está listo.

---

## 7. Cómo tomar decisiones cuando esto no alcanza

Ningún documento cubre todos los casos. Cuando enfrentes una decisión sin respuesta obvia, pásala por estos filtros, en orden:

1. **¿Tranquiliza a una persona estresada?** Si genera ansiedad, descártalo.
2. **¿Se entiende sin esfuerzo?** La claridad le gana a la elegancia siempre.
3. **¿Es honesto?** Si esconde, presiona o engaña, no es Lexy.
4. **¿Se siente parte de la familia?** Coherente con todo lo demás, sin sorpresas gratuitas.
5. **¿Sobra?** Si lo puedes quitar y nada se pierde, quítalo.

Diseñar para Lexy es, en el fondo, un acto de empatía: ponerse en los zapatos de alguien que la está pasando mal y construirle un camino claro, cálido y sin trampas. Si cada decisión nace de ahí, el resto se ordena solo.
