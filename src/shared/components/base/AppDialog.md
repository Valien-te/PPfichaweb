# AppDialog

Diálogo de aplicación para confirmaciones, avisos y formularios breves. Compone el `Dialog` base con título, descripción, contenido opcional y acciones consistentes con Lexy.

## Uso

```tsx
<AppDialog
  trigger={<Button>Enviar</Button>}
  title="Ficha enviada"
  description="Enviamos los datos de tu ficha para revisión."
  confirmLabel="Continuar"
/>
```

Puede controlarse con `open` y `onOpenChange` cuando el diálogo debe aparecer como resultado de otra acción.

Usa `hideCancelAction` cuando la confirmación tenga una única acción principal. Combínalo con `actionsAlignment="center"` para centrarla.

Para ajustes tipográficos puntuales, usa `headerClassName`, `titleClassName` y `descriptionClassName` sin alterar la jerarquía semántica del diálogo.
