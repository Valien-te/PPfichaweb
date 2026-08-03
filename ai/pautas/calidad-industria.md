# Calidad nivel industria — el pase anti-genérico

Esta pauta define la **vara de calidad** de una interfaz Lexy: qué separa una
pantalla con oficio de una pantalla "generada por IA". Úsala en dos momentos:
al **elegir el patrón** (antes de componer) y como **pase final** antes de
entregar. Los valores concretos viven en [sistema-visual.md](sistema-visual.md);
las reglas de oficio en [buenas-practicas.md](buenas-practicas.md). Esto es el
criterio de revisión.

## La referencia mental correcta

Antes de componer, pregúntate a qué se parecería esta pantalla en un producto
de primer nivel del mismo dominio:

- **CRM / herramientas internas:** Linear, Stripe Dashboard, Notion, Attio,
  Height. Superficies planas, tablas serias, toolbars compactas, color
  funcional, cero decoración.
- **Cliente en momento difícil:** GOV.UK, bancos digitales serios, portales de
  salud bien diseñados. Una idea por pantalla, lenguaje directo, cero pirotecnia.

Si tu composición no podría vivir en uno de esos productos, todavía no está al
nivel. "Bonita" no es el estándar; **creíble como producto real** lo es.

## Señales de interfaz genérica (si aparece una, corrígela)

Estas son las marcas típicas de UI generada sin criterio. Ninguna pasa el pase
final:

1. **Hero + tres cards** para algo que no es una landing. Un intake, un desk o
   un formulario no abren con claim emocional ni grid de features.
2. **Todo centrado.** El centrado es para momentos puntuales (confirmación,
   login). El trabajo real se alinea a la izquierda y a una grilla.
3. **Stat-cards por defecto.** Cuatro tarjetas de métricas arriba de un
   dashboard que nadie pidió. Las métricas entran solo si alguien decide algo
   con ellas.
4. **Cards uniformes para todo.** Grid de tarjetas idénticas como solución
   universal de layout. La tabla, la lista y la superficie plana existen.
5. **Iconos decorativos** en cada título de sección, ilustraciones genéricas,
   emoji. Lexy no decora; cada icono se gana su lugar.
6. **Gradientes y sombras dramáticas** donde el sistema pide superficie y borde.
7. **Datos de relleno irreales:** "John Doe", "Lorem ipsum", "Empresa S.A.",
   métricas redondas (100%, 1.000). Delatan demo y impiden evaluar la
   jerarquía real.
8. **Copy de folleto:** "Bienvenido a tu plataforma integral de gestión legal".
   El título dice la tarea, no el pitch (ver [ux-writing.md](ux-writing.md)).
9. **Estados ausentes:** solo se diseñó el caso feliz con datos perfectos, sin
   carga, vacío ni error.
10. **Simetría forzada:** rellenar columnas o cards para que "se vea parejo".
    La jerarquía manda; el relleno es ruido.

## Cómo se ve el oficio

Lo que hace que una pantalla se sienta producto real:

- **Un punto focal.** En cada vista se puede decir en una frase qué es lo más
  importante, y la composición lo confirma sin leer.
- **Ritmo de espaciado consistente.** El mismo gap para el mismo tipo de
  relación, en toda la pantalla (grid 8pt; ver
  [sistema-visual.md](sistema-visual.md)). El desorden de espaciado es lo
  primero que delata falta de oficio.
- **Alineación impecable.** Labels, celdas, botones y bordes comparten ejes.
  Una sola columna desalineada rompe la credibilidad de toda la vista.
- **Color con disciplina.** Neutros para la estructura, marca donde dirige la
  mirada, tonos de estado solo para estado. Si una pantalla tiene más de un
  acento compitiendo, sobra uno.
- **Datos de ejemplo realistas del dominio:** nombres chilenos, RUT con
  formato (`12.345.678-9`), materias reales (despido, deuda, error médico),
  plazos concretos («Vence en 3 días»), montos verosímiles ($1.250.000). El
  contenido realista obliga a resolver truncamiento, columnas y jerarquía de
  verdad.
- **Los cuatro estados resueltos** (carga, vacío, error, contenido) con los
  componentes del sistema: `Skeleton`/`Spinner`, `Empty`, mensaje de error con
  reintento.
- **Microcopy específico.** Cada botón dice su resultado concreto; cada estado
  dice qué hacer después. Texto genérico = diseño genérico.

## Patrón reconocible antes que layout inventado

Para cada tipo de encargo existe un patrón que la industria ya validó. Parte
de ahí y vístelo de Lexy; no inventes la mecánica:

| Encargo | Patrón de partida | Receta |
|---|---|---|
| Lista operativa de registros | Toolbar + tabla densa + paginación | [recetas-layout.md](recetas-layout.md) §4 |
| Trabajo sobre un registro | Master-detail (contexto + tabs de trabajo) | [recetas-layout.md](recetas-layout.md) §5 |
| Captura de datos cliente | Wizard de pasos enfocados con progreso | [recetas-layout.md](recetas-layout.md) §1 |
| App interna completa | Sidebar colapsable + área de trabajo (`SidebarProvider`, `AppSidebar`, `SidebarInset`) | [recetas-layout.md](recetas-layout.md) §7 |
| Acceso | Card única centrada | [recetas-layout.md](recetas-layout.md) §3 |
| Confirmación / éxito | Mensaje + qué sigue + una salida | [recetas-layout.md](recetas-layout.md) §2 |

Si el encargo trae referencia visual o Figma, **la referencia manda** sobre
esta tabla (ver [arquitectura-informacion-ux.md](arquitectura-informacion-ux.md)).

## El pase final (antes de entregar, siempre)

Recorre la pantalla terminada una vez con estas preguntas. Si alguna falla,
corrige antes de mostrar:

1. ¿Podría esta pantalla vivir en un producto de primer nivel del mismo
   dominio sin desentonar?
2. ¿Hay alguna señal de la lista de genéricos (hero indebido, cards de
   relleno, iconos decorativos, datos falsos, copy de folleto)?
3. ¿El espaciado tiene un ritmo consistente y todo comparte ejes de alineación?
4. ¿La densidad corresponde al mundo (aire en cliente, compacto jerarquizado
   en CRM)?
5. ¿Los datos de ejemplo son realistas y del dominio legal chileno?
6. ¿Están los cuatro estados y el microcopy dice siempre el siguiente paso?
7. Si quito un elemento cualquiera, ¿se pierde algo? Si no, quítalo
   («menos, pero mejor»).
