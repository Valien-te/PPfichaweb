# Arquitectura de informacion y carga visual

Esta pauta guía cómo ordenar información en interfaces Lexy para que sean claras, progresivas y fáciles de leer. Úsala junto con la filosofía de cliente o CRM y la guía de UX writing.

## Regla base

La interfaz no debe mostrar todo al mismo tiempo para parecer completa. Debe mostrar primero lo que permite avanzar, y revelar el resto cuando el usuario lo necesita.

Una buena pantalla Lexy tiene:

- Un foco principal evidente.
- Un título que explica la tarea o el estado, no una etiqueta decorativa.
- Secciones agrupadas por decisión o acción.
- Jerarquía visual suficiente para escanear sin leer todo.
- Contenido secundario disponible, pero no compitiendo con la acción principal.
- Accesibilidad resuelta desde la estructura: orden lógico, etiquetas claras, foco visible y estados que no dependan solo del color.

## Jerarquía

La jerarquía ayuda a que la persona entienda dónde está, qué es importante y qué puede hacer. Debe existir en dos niveles al mismo tiempo:

- **Jerarquía visual:** tamaño, peso, espaciado, contraste, color, forma, iconos, movimiento y posición.
- **Jerarquía semántica:** orden del HTML, landmarks, headings, labels y foco.

La jerarquía visual y la semántica deben coincidir. Si la pantalla se ve como un flujo claro pero el HTML se lee desordenado, la interfaz falla para tecnologías asistivas y también aumenta el riesgo de errores de implementación.

### Feedback y disponibilidad

Usa feedback visual, textual y de interacción para mostrar qué está disponible:

- Labels visibles para controles y campos.
- Estados claros: activo, seleccionado, deshabilitado, error, éxito, pendiente.
- Iconos como apoyo, no como única explicación.
- Color con texto o forma adicional cuando comunica estado.
- Feedback de foco, hover, active y loading cuando corresponda.

### Reducir complejidad

Cada botón, imagen, icono, línea de texto, card y separador aumenta la complejidad de la UI. Antes de agregar algo, pregunta:

- ¿Ayuda a ubicar a la persona?
- ¿Aclara qué es importante?
- ¿Permite actuar o decidir?
- ¿Reduce riesgo, error o ansiedad?

Si no cumple ninguna, elimínalo.

### Niveles de importancia

Para expresar importancia relativa:

- Coloca acciones principales arriba o abajo de la pantalla, en zonas fáciles de encontrar.
- Mantén juntas las acciones relacionadas.
- Agrupa elementos de jerarquía similar.
- Evita que acciones secundarias compitan con la acción principal.
- Usa contraste, tamaño y espaciado para dirigir la mirada, no solo color.

### Landmarks y headings web

Las tecnologías asistivas transforman la pantalla en una experiencia lineal. Por eso el orden del DOM, landmarks y headings importan tanto como el layout visual.

Usa estos landmarks cuando correspondan:

- `nav`: listas o grupos de navegación. Si hay más de uno, usa `aria-label` para diferenciarlos.
- `search`: búsqueda principal o contextual.
- `main`: contenido principal de la página. Debe haber solo uno.
- `header`: cabecera o banner repetido de la página.
- `aside`: contenido complementario que puede entenderse por separado.
- `footer`: información final o legal del sitio.
- `section`: región importante dentro de `main`, etiquetada con heading claro.
- `form`: bloque que captura o envía información.

Reglas:

- Un solo `h1` para el propósito principal de la página.
- Usa `h2` para secciones principales y `h3` para subsecciones.
- No saltes niveles de heading solo para conseguir un tamaño visual.
- El orden del DOM debe seguir el orden de lectura esperado.
- En grillas, el orden debe leerse de izquierda a derecha y de arriba abajo.
- Si una región es importante, su nombre debe ser claro para navegación asistiva.

## Accesibilidad y carga cognitiva

La accesibilidad ayuda a todas las personas, no solo a quienes tienen una discapacidad permanente. Una persona puede estar con baja visión, usando lector de pantalla, con una lesión temporal, con poca concentración, en una pantalla pequeña o bajo presión.

Diseña la arquitectura de información considerando:

- Orden de lectura lógico, de arriba hacia abajo y de lo general a lo específico.
- Encabezados reales y jerárquicos, no texto grande usado como decoración.
- Agrupación con `fieldset`/`legend` o secciones claras cuando los campos pertenecen a una misma decisión.
- Acciones cercanas al contenido que afectan.
- Ayuda contextual en el punto de necesidad.
- Estados, errores y avisos expresados con texto además de color.
- Progressive disclosure que reduzca carga cognitiva sin esconder información crítica.

Honrar necesidades individuales significa permitir que la interfaz tolere distintas formas de uso: teclado, zoom, lectura pausada, revisión antes de enviar, cambios de preferencia y corrección sin perder trabajo.

## Evita eyebrows

Evita usar eyebrows como recurso por defecto. Un eyebrow es una etiqueta pequeña arriba del título, por ejemplo `PASO 1`, `NUEVA SOLICITUD`, `CLIENTE`, `LEGAL TECH`, `RESUMEN`.

En Lexy suelen agregar ruido porque:

- Repiten información que ya puede decir el título.
- Hacen que la pantalla se sienta más marketera que útil.
- Crean una capa visual extra antes del contenido real.
- Empujan a usar jerarquía decorativa en vez de jerarquía funcional.

### Qué usar en vez de eyebrows

Prefiere:

- Títulos informativos: `Completa tus datos para revisar tu caso`.
- Subtítulos con próximo paso: `Usaremos esta información para preparar la primera revisión`.
- Estados integrados al componente: badges, tags, status dots o texto de estado cerca del dato.
- Breadcrumbs o tabs cuando la navegación lo requiere.
- Stepper o progreso cuando el flujo realmente tiene pasos.

### Cuándo sí puede existir una etiqueta superior

Solo úsala si cumple una función real:

- Estado operativo: `En revisión`, `Pendiente`, `Vence hoy`.
- Ubicación en un flujo: `Paso 2 de 4`, si el paso ayuda a orientarse.
- Tipo de caso o categoría que cambia decisiones: `Deuda`, `Despido`, `Salud`.

Si la etiqueta no cambia comprensión, prioridad o acción, elimínala.

## Progressive disclosure

Progressive disclosure significa mostrar primero lo esencial y revelar detalles, excepciones o acciones secundarias cuando sean necesarias.

Úsalo para manejar carga visual sin esconder información importante.

### Orden recomendado

1. Qué está pasando o qué debe hacer la persona.
2. Por qué importa o qué pasará después.
3. Acción principal.
4. Campos o datos mínimos para avanzar.
5. Información secundaria agrupada.
6. Ayuda contextual, detalles legales, ejemplos o excepciones.

### Patrones útiles

- Pasos cortos para flujos largos.
- Secciones colapsables para detalles no críticos.
- Tabs cuando hay categorías pares que no se necesitan ver al mismo tiempo.
- Dialog o sheet para acciones puntuales que no deben romper contexto.
- Ayuda contextual cerca del campo, no en bloques largos al inicio.
- Resúmenes progresivos: mostrar lo capturado y permitir editar por sección.

### No ocultes

No uses progressive disclosure para esconder:

- Costos, consecuencias o riesgos.
- Errores que bloquean el avance.
- Datos necesarios para tomar una decisión.
- Próximos pasos después de enviar información.
- Plazos relevantes.

## Referencias visuales

Si el encargo incluye Figma, screenshot o un diseño anterior, primero extrae el patrón antes de proponer mejoras.

Observa y conserva:

- Tipo de pantalla: ficha, wizard, desk, tabla, formulario, carga de documentos, detalle.
- Navegación: stepper, tabs, sidebar, header, footer o ninguna.
- Densidad: compacta, media, espaciosa.
- Contenedores: continuidad del formulario, cards, tabla, paneles, sheets.
- Posición del CTA principal.
- Ayuda: inline, tooltip, floating help, banner.
- Ancho del contenido y alineación general.

No cambies el tipo de pantalla por iniciativa propia. Si la referencia es una ficha web con stepper y una sola etapa visible, no la conviertas en una página con hero, sidebar, cards, resumen sticky o todas las etapas abiertas.

## Patrón: ficha web cliente

Usa este patrón para formularios de antecedentes, intake legal, fichas de litigios o cualquier flujo donde una persona debe entregar datos para revisión.

Estructura recomendada:

1. Stepper superior cuando hay varias etapas.
2. Fondo calmo y continuo.
3. Contenido principal en una columna de ancho controlado.
4. Título de la etapa, no frase de marketing.
5. Texto breve de contexto.
6. Nota de obligatorios si aplica.
7. Campos agrupados por relación natural.
8. CTA principal al final del paso.
9. Ayuda flotante o contextual si reduce ansiedad.

Evita:

- Hero.
- Eyebrow.
- Card lateral de próximos pasos.
- Cards por cada sección del formulario.
- Iconos de sección como decoración.
- Mostrar deudas, bienes, sociedades y confirmación en la misma pantalla si el patrón tiene pasos.

## Cliente vs CRM

### Interfaces de cliente

Prioriza calma y claridad:

- Una idea principal por pantalla o sección.
- Copy corto que explique el beneficio y el siguiente paso.
- Menos campos visibles cuando el flujo pueda dividirse.
- Ayuda contextual que reduzca ansiedad.
- Confirmaciones claras después de enviar información.

Evita dashboards densos, muchas tarjetas compitiendo y bloques largos de explicación antes de la acción.

### Interfaces CRM o internas

Prioriza tarea y escaneo:

- La información que se consulta junta debe vivir junta.
- Muestra más densidad solo si está jerarquizada.
- Usa tablas, listas, filtros y estados visibles cuando aceleran el trabajo.
- Lleva acciones frecuentes cerca del dato o fila correspondiente.
- Oculta detalles secundarios, no acciones frecuentes.

Evita esconder contexto operativo en modales innecesarios o colapsar información que el abogado necesita comparar.

## Checklist UX antes de entregar

1. ¿El título dice la tarea, estado o beneficio real sin necesitar un eyebrow?
2. ¿La primera pantalla deja claro qué hacer y qué pasará después?
3. ¿Cada sección agrupa información que se usa junta?
4. ¿La información secundaria está disponible sin competir con lo principal?
5. ¿Hay algún bloque, tarjeta o etiqueta que solo decora? Elimínalo.
6. ¿Los campos aparecen en el orden en que la persona puede responderlos?
7. ¿Los errores y estados aparecen cerca de donde se corrigen?
8. ¿La acción principal es visible sin buscarla?
9. ¿La pantalla se puede escanear en diagonal?
10. ¿La composición reduce carga visual sin esconder consecuencias importantes?
11. ¿El orden del HTML coincide con el orden visual y de lectura?
12. ¿Hay landmarks y headings suficientes para navegar la página con lector de pantalla?
