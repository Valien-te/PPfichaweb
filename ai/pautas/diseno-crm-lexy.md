# Lexy CRM — Filosofía de Diseño (interfaz interna)

> La interfaz existe para que el trabajo se haga fácil. Todo gira en torno a la tarea.

Este documento es la brújula para diseñar la plataforma interna de Lexy: el lugar donde los abogados y el equipo gestionan casos, ejecutan tareas, hacen seguimiento y mueven el trabajo hacia adelante. No contiene tokens, colores ni medidas — describe *cómo se siente* trabajar acá, no *cómo se construye*.

**Lee esto antes que nada:** la interfaz para clientes y la interfaz para el equipo son dos mundos distintos. La del cliente existe para *tranquilizar a alguien que la está pasando mal*. Esta existe para *que el abogado ejecute su trabajo de la forma más fácil e intuitiva posible*. No las confundas. Pero ojo: "fácil e intuitivo" no significa lento ni espaciado — significa que en cada momento la interfaz pone por delante lo que la tarea necesita, anticipa el siguiente paso y elimina la fricción. Es una herramienta orientada a la tarea, y la tarea es siempre el centro.

---

## 1. Para quién diseñamos acá

El usuario es un abogado o un miembro del equipo Lexy que va a pasar **horas al día, todos los días**, dentro de esta herramienta para ejecutar tareas concretas: avanzar un caso, redactar una gestión, cumplir un plazo, hacer seguimiento. Conoce el dominio y maneja muchos casos a la vez, mientras le interrumpen constantemente.

Nuestro trabajo de diseño tiene un propósito claro: **que cada tarea sea lo más fácil e intuitiva de realizar.** Que el abogado nunca tenga que pensar *cómo* usar la herramienta, solo *qué* quiere lograr — y que la interfaz lo lleve hasta ahí sin tropiezos. Eso a veces significa anticiparle el siguiente paso, a veces poner una acción justo donde la mano la busca, a veces tener todo el contexto a la vista para que no tenga que ir a buscarlo. La interfaz hace el trabajo pesado para que la persona se concentre en el criterio, que es lo único que el software no puede poner.

Nuestro éxito no se mide en "qué linda quedó la pantalla". Se mide en **qué tan fácil y fluido le resultó al abogado hacer lo que vino a hacer.**

---

## 2. La sensación que perseguimos

Si el producto de cliente se siente como *una conversación tranquila*, esto se siente como **un buen taller de trabajo**: cada herramienta a la mano, todo a la vista, nada que estorbe entre la persona y la tarea. Ordenado, fluido y sin fricción.

- **Fácil, no simplista.** La tarea se realiza con el mínimo esfuerzo posible — pero sin esconder lo que el trabajo realmente requiere. Quitamos fricción, no capacidad.
- **Intuitivo, no adivinatorio.** El siguiente paso es siempre evidente. La persona no tiene que detenerse a pensar cómo se usa la herramienta; la herramienta se explica sola al ritmo de la tarea.
- **Eficiente, no apurado.** La velocidad nace del orden y de la anticipación, no del caos. Densidad que se entiende, no que abruma.
- **Predecible, no rígida.** Todo está donde la tarea lo necesita y responde al instante. Las sorpresas, acá, cuestan tiempo y errores.

La pregunta de oro cuando dudemos: *¿esto hace más fácil ejecutar la tarea, o solo se ve bien?* Si no facilita el trabajo, sobra.

---

## 3. Principios de diseño

**1. La tarea es el centro de todo.**
Cada pantalla se diseña preguntando primero: ¿qué vino a hacer aquí la persona? Todo lo que ayuda a esa tarea va al frente; todo lo que no, se aparta o desaparece. No diseñamos "pantallas de información", diseñamos lugares donde se ejecuta un trabajo concreto, y los ordenamos alrededor de ese trabajo.

**2. La densidad al servicio de la tarea.**
Acá el espacio en blanco generoso no es calma, es scroll y clics extra. El abogado quiere ver su lista de casos, los datos clave de uno y sus próximas acciones sin tener que navegar. Mostramos más por pantalla — siempre que siga siendo legible y jerárquico, y siempre que sirva a la tarea que está ejecutando. Compactar bien es un acto de respeto por su tiempo.

**3. La información que se necesita junta, va junta.**
Nada de mandar al usuario a tres pantallas para juntar el contexto de una decisión. Lo que se consulta en conjunto, vive en conjunto. El trabajo fluye cuando el contexto no se fragmenta.

**4. La acción está siempre a la mano.**
Las tareas frecuentes se hacen en el menor número de pasos posible, idealmente sin cambiar de contexto. Acciones rápidas, edición en línea, atajos de teclado para los power users. Si algo se hace cincuenta veces al día, tiene que costar casi cero.

**5. El estado siempre es visible.**
El experto debe saber, sin preguntar: en qué etapa está cada caso, qué le toca hacer, qué está atrasado, qué espera de otros. El sistema le quita de la cabeza lo que el sistema puede recordar por él. La memoria de trabajo es un recurso escaso; no la gastamos en cosas que la interfaz puede sostener.

**6. Escaneabilidad sobre belleza.**
Una tabla densa y bien alineada que se lee en diagonal vale más que una tarjeta espaciosa y elegante. Priorizamos alineación, jerarquía visual y consistencia de formato para que el ojo encuentre lo que busca de inmediato. La estética sirve a la lectura rápida, no al revés.

**7. Cero pérdida de trabajo.**
Nada erosiona más la confianza de un profesional que perder lo que hizo. Guardado confiable, estados claros de "se guardó / no se guardó", confirmaciones solo donde el riesgo lo amerita, y siempre una forma de deshacer. El sistema es un colega responsable, no uno que te hace repetir trabajo.

**8. Consistencia férrea.**
El experto memoriza la herramienta y trabaja en piloto automático. Cada patrón que se repite igual es velocidad ganada; cada excepción es un tropiezo. Acá la consistencia importa todavía más que en el producto de cliente, porque el uso es intensivo y repetido.

**9. Accesibilidad operativa.**
El abogado también puede trabajar con fatiga visual, interrupciones, una mano ocupada, pantallas pequeñas, zoom alto o necesidades permanentes de accesibilidad. La densidad nunca justifica perder contraste, foco visible, navegación por teclado, labels claros o estados comprensibles. Una herramienta interna accesible reduce errores y velocidad perdida; no es una concesión, es calidad operativa.

---

## 4. Jerarquía y densidad — el espíritu, no la receta

**El trabajo manda; la marca acompaña.** Esta es una herramienta, no una pieza de marca. La identidad de Lexy está presente, pero contenida: da pertenencia y coherencia sin robar protagonismo ni espacio. Acá los fondos decorativos, los patrones expresivos y los gestos de marca grandes **no tienen lugar** — cada pixel que ocupa decoración es un pixel que no muestra información útil. El lujo, en una herramienta de trabajo, es la sobriedad.

**Los patrones conocidos son una fuente de confianza.** Tenemos un design system propio — nuestros componentes, nuestra estética, nuestra identidad — y eso no está en discusión. Lo que no reinventamos es *cómo se comportan* las cosas: una tabla se ordena como la gente espera que se ordene, un formulario valida cuando corresponde, un menú se abre donde la mano lo busca, un botón primario pesa más que uno secundario. Nos apoyamos deliberadamente en las convenciones y guidelines de la industria — los principios de Apple HIG, Fluent Design, Material y compañía — no para copiar su apariencia, sino para heredar décadas de patrones de interacción que el abogado ya tiene internalizados. Vestimos esos patrones con la piel de Lexy; no inventamos mecánicas nuevas para problemas ya resueltos. Cuando un control se ve propio pero se comporta como la persona espera, puede apretar el botón y avanzar **sin dudar**, confiando en que la herramienta hará exactamente lo que parece que va a hacer. Esa previsibilidad — alineación impecable, coherencia entre pantallas, consistencia férrea en cómo se ven y actúan los elementos — es lo que le da la seguridad para ejecutar la tarea en piloto automático. La originalidad, acá, se reserva para resolver mejor el problema de fondo, nunca para sorprender con la mecánica de un control. Lo familiar en el comportamiento no es falta de creatividad: es respeto por la confianza del usuario.

**La jerarquía visual hace el trabajo pesado.** Con mucha información en pantalla, lo que distingue una buena interfaz de una abrumadora es la jerarquía: qué se ve primero, qué es secundario, qué está agrupado con qué. Usamos peso, tamaño, agrupación y alineación para que el ojo del experto vaya solo a lo importante. Un buen tablero denso se *siente* ordenado aunque tenga el triple de datos que una pantalla de cliente.

**El color trabaja, no decora.** En esta interfaz el color es sobre todo funcional: distinguir estados, señalar urgencias, agrupar categorías, marcar lo que requiere atención. Un caso atrasado, una tarea vencida, un hito cumplido — se reconocen al instante por su color, de forma consistente en todo el sistema. El color es un lenguaje de trabajo, no un adorno; lo usamos con disciplina para que nunca pierda significado.

**La tipografía es para leer rápido y mucho.** Acá no buscamos expresividad ni momentos memorables; buscamos que se puedan leer tablas, listas y formularios durante horas sin fatiga. Claridad, alineación impecable y una jerarquía de texto sobria y predecible. Lo expresivo se queda en el producto de cliente; acá manda lo funcional.

**Las tablas y listas son ciudadanas de primera clase.** Buena parte del trabajo vive en vistas de muchos registros. Las tratamos con el cariño que merecen: ordenables, filtrables, escaneables, con la información correcta en cada columna y acciones al alcance. Una tabla bien diseñada es, en este producto, tan importante como una buena portada lo es en el de cliente.

---

## 5. Voz y tono editorial

El producto de cliente habla cálido y tranquilizador. Acá hablamos como **colegas eficientes entre profesionales**: directos, precisos, sin rodeos.

**Cómo suena el CRM:**

- **Preciso y breve.** Etiquetas claras, sin adornos. El experto no necesita que lo motiven con frases lindas; necesita saber qué es cada cosa de un vistazo.
- **Vocabulario profesional, sin miedo.** Acá sí usamos los términos del oficio — etapas procesales, tipos de gestión, nomenclatura jurídica real. El usuario los conoce y traducirlos a lenguaje simple solo lo haría más lento.
- **Orientado a la acción.** Los textos de botones y tareas dicen qué va a pasar, en verbos claros y concretos. Nada de ambigüedad sobre el resultado de una acción.
- **Sin paternalismo, pero nunca a costa de la claridad.** No explicamos de más ni celebramos cada microacción, pero sí dejamos siempre evidente qué hacer y cómo. Respetar al usuario es no hacerle perder el tiempo — jamás es dejarlo perdido.

**Los mensajes que sí importan: errores y estados.** Cuando algo sale mal o hay que confirmar algo riesgoso, somos claros y útiles: qué pasó, qué consecuencia tiene, qué puede hacer. Sin alarmismo pero sin esconder la gravedad. En una herramienta de trabajo, un buen mensaje de error vale más que diez frases motivacionales.

**La prueba del tono:** imagina que un colega abogado con experiencia lee el texto por encima del hombro. Si le suena obvio, profesional y eficiente — bien. Si le suena a que lo están tratando como novato o a que le están haciendo perder el tiempo con relleno — reescríbelo.

---

## 6. Cómo tomar decisiones cuando esto no alcanza

Pasa cada decisión por estos filtros, en orden:

1. **¿Hace más fácil ejecutar la tarea?** Ese es el norte. Si no facilita el trabajo, sobra.
2. **¿El siguiente paso es evidente sin pensarlo?** Si la persona tiene que detenerse a descifrar la interfaz, falló.
3. **¿Muestra lo necesario sin obligar a navegar?** El contexto fragmentado es el enemigo.
4. **¿Es consistente con el resto?** El uso intensivo premia la repetición y castiga la excepción.
5. **¿Protege el trabajo del usuario?** Nada que arriesgue perder lo hecho.
6. **¿La decoración le está quitando espacio a la tarea?** Si sí, gana la tarea.

Diseñar el CRM de Lexy es diseñar alrededor de la tarea. El acto de empatía acá es hacerle el trabajo fácil al abogado: entender qué viene a lograr, quitarle del camino todo lo que estorba, anticiparle el siguiente paso y construirle un lugar donde ejecutar su trabajo sea simple, intuitivo y fluido — para que pueda dedicar su cabeza a lo único que importa: el caso de una persona real.
