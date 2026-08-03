# Toaster — guía de uso

Notificaciones efímeras de la app (sobre **Sonner**, tematizado con tokens Lexy). Se monta **una vez** en el layout raíz y se dispara imperativo con `toast.*` desde cualquier parte. Reemplaza al `Toast` presentacional del sistema antiguo (deprecado). El componente vive en tu proyecto: instálalo con `create-lexy add toaster` y edítalo con libertad.

## Import

```tsx
// En el layout raíz (una sola vez):
import { Toaster } from "@/shared/components/base/Toaster";

// Donde dispares notificaciones:
import { toast } from "@/shared/components/base/Toaster";
```

## Montaje

```tsx
function App() {
  return (
    <>
      <Rutas />
      <Toaster />
    </>
  );
}
```

## Uso básico

```tsx
toast("Borrador guardado");
toast.success("Cambios guardados");
toast.error("No pudimos guardar. Intenta de nuevo.");
toast.warning("Tu sesión expira en 5 minutos");
toast.info("Hay una versión nueva disponible");

// Con acción y descripción:
toast.success("Contrato enviado", {
  description: "Le avisamos al cliente por correo.",
  action: { label: "Ver contrato", onClick: () => navigate(`/contratos/${id}`) },
});

// Operación async de una vez:
toast.promise(guardar(), {
  loading: "Guardando…",
  success: "Cambios guardados",
  error: "No pudimos guardar. Intenta de nuevo.",
});
```

## Tematización

Los tipos colorean con los tokens semánticos del theme vía las CSS vars de Sonner: `success` → `--color-success`, `error` → `--color-destructive`, `warning` → `--color-warning`, `info` → `--color-info`. Cambiar los tokens re-tematiza los toasts sin tocar el componente.

## Posición, duración y cola (criterio por mundo)

Defaults del componente: `position="bottom-right"`, `duration={4000}`, `visibleToasts={3}` — pensados para **CRM** (escritorio denso: la esquina inferior derecha no tapa toolbars ni encabezados, y la cola corta evita ruido en flujos de alta frecuencia).

Para **mundo cliente** (flujos guiados, móvil primero) configura el montaje:

```tsx
<Toaster position="top-center" duration={6000} visibleToasts={2} />
```

Arriba y centrado entra en el campo visual del flujo paso a paso, y la duración mayor da tiempo de lectura a personas no expertas.

## Props

`Toaster` acepta todas las props de Sonner (`position`, `duration`, `visibleToasts`, `closeButton`, `toastOptions`…); los defaults y el mapeo de tokens viven en el componente y son editables. Exporta también `toast` (la API imperativa completa de Sonner).

## Reglas (UX writing)

- Éxito puntual (guardado, envío) → toast con el **siguiente paso** cuando exista (*"Contrato enviado"* + acción *"Ver contrato"*).
- Error en toast solo si es transitorio y re-intentable (*"No pudimos guardar. Intenta de nuevo."*); errores de validación van en el formulario (`FormMessage`), y errores que bloquean la página van en la vista, no en un toast.
- Mensajes cortos, verbo primero, sin tecnicismos ni códigos de error.
- No comuniques con color solamente: el texto debe bastar.

## Cuándo NO usar

- **Confirmar antes de actuar** → `AlertDialog`.
- **Estado persistente de la vista** (vacío, error de carga) → `Empty` o estado en la página.
- **Errores de campos** → `FormMessage`.

## Para IA

1. Monta `<Toaster />` una vez en el layout raíz; nunca por vista.
2. Importa `toast` desde el componente local, no desde `sonner` directo (así hereda el tema).
3. Tras una mutación: éxito → `toast.success` con siguiente paso; fallo re-intentable → `toast.error` con cómo arreglarlo.
4. En mundo cliente configura `position="top-center" duration={6000}`; en CRM deja los defaults.
