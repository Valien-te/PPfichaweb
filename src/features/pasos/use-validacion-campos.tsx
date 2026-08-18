import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface CampoIncompleto {
  controlId: string;
  destinoMensaje: HTMLElement;
  mensaje: string | null;
  mensajeId: string;
}

const SELECTOR_CONTROLES_VALIDABLES = [
  'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([data-validation-optional="true"])',
  'textarea:not([data-validation-optional="true"])',
  'select:not([data-validation-optional="true"])',
  'button[role="combobox"]:not([data-validation-optional="true"])',
  '[role="radiogroup"]:not([data-validation-optional="true"])',
  '[role="checkbox"][data-validation-required="true"]',
].join(",");

function obtenerMensajeControl(control: HTMLElement): string {
  if (
    control instanceof HTMLSelectElement ||
    control.getAttribute("role") === "combobox" ||
    control.getAttribute("role") === "radiogroup" ||
    control.getAttribute("role") === "checkbox"
  ) {
    return "Selecciona una opción para continuar.";
  }

  return "Completa este campo para continuar.";
}

function obtenerDestinoMensaje(control: HTMLElement): HTMLElement {
  return (
    control.closest<HTMLElement>("[data-validation-field]") ??
    (control.getAttribute("role") === "radiogroup" ? control.closest("fieldset") : null) ??
    control.closest<HTMLElement>(".grid") ??
    control.parentElement ??
    control
  );
}

function obtenerGrupoValidacion(control: HTMLElement, index: number) {
  const grupo = control.closest<HTMLElement>("[data-validation-group]");
  if (!grupo) return null;

  const grupoId = grupo.id || `grupo-validacion-${index + 1}`;
  if (!grupo.id) grupo.id = grupoId;

  return {
    destinoMensaje:
      grupo.querySelector<HTMLElement>("[data-validation-group-message-target]") ?? grupo,
    mensaje: grupo.dataset.validationGroupMessage ?? "Completa los datos faltantes para continuar.",
    mensajeId: grupo.dataset.validationGroupMessageId ?? `${grupoId}-mensaje-error`,
  };
}

function controlEstaIncompleto(control: HTMLElement): boolean {
  if (
    control.hasAttribute("disabled") ||
    control.getAttribute("aria-disabled") === "true" ||
    control.closest('[aria-hidden="true"]')
  ) {
    return false;
  }

  if (
    control instanceof HTMLInputElement ||
    control instanceof HTMLTextAreaElement ||
    control instanceof HTMLSelectElement
  ) {
    return control.value.trim() === "" || !control.validity.valid;
  }

  if (control.getAttribute("role") === "combobox") {
    return control.hasAttribute("data-placeholder");
  }

  if (control.getAttribute("role") === "radiogroup") {
    return !control.querySelector('[role="radio"][data-state="checked"]');
  }

  if (control.getAttribute("role") === "checkbox") {
    return control.getAttribute("data-state") !== "checked";
  }

  return false;
}

function detectarCamposIncompletos(contenedor: HTMLElement | null): CampoIncompleto[] {
  if (!contenedor) return [];

  return Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR_CONTROLES_VALIDABLES))
    .filter((control) => control.getClientRects().length > 0 && controlEstaIncompleto(control))
    .map((control, index) => {
      const controlId = control.id || `campo-obligatorio-${index + 1}`;
      if (!control.id) control.id = controlId;
      const grupoValidacion = obtenerGrupoValidacion(control, index);

      return {
        controlId,
        destinoMensaje: grupoValidacion?.destinoMensaje ?? obtenerDestinoMensaje(control),
        mensaje:
          control.dataset.validationMessage === "none"
            ? null
            : (grupoValidacion?.mensaje ?? obtenerMensajeControl(control)),
        mensajeId: grupoValidacion?.mensajeId ?? `${controlId}-mensaje-error`,
      };
    });
}

function limpiarMarcasValidacion(contenedor: HTMLElement) {
  for (const control of contenedor.querySelectorAll<HTMLElement>(
    '[data-validation-error="true"]',
  )) {
    const mensajeId = control.dataset.validationMessageId;
    const describedBy = (control.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((id) => id && id !== mensajeId);

    if (control.dataset.validationPreserveAriaInvalid !== "true") {
      const ariaInvalidOriginal = control.dataset.validationOriginalAriaInvalid;
      if (ariaInvalidOriginal === "__ausente__") control.removeAttribute("aria-invalid");
      else if (ariaInvalidOriginal) control.setAttribute("aria-invalid", ariaInvalidOriginal);
    }
    if (describedBy.length > 0) control.setAttribute("aria-describedby", describedBy.join(" "));
    else control.removeAttribute("aria-describedby");
    control.removeAttribute("data-validation-error");
    control.removeAttribute("data-validation-message-id");
    control.removeAttribute("data-validation-original-aria-invalid");
    control.classList.remove("!border-destructive", "ring-1", "ring-destructive/30");
  }
}

export function useValidacionCampos() {
  // Decisión UX compartida: la completitud de campos no deshabilita el botón.
  // Los errores aparecen solo tras intentar avanzar y se actualizan mientras la
  // persona corrige. Por defecto hay uno bajo cada control; una colección marcada
  // con data-validation-group consolida el copy sin quitar el estado de cada campo.
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [validacionIntentada, setValidacionIntentada] = useState(false);
  const [camposIncompletos, setCamposIncompletos] = useState<CampoIncompleto[]>([]);

  const actualizarValidacion = useCallback(() => {
    setCamposIncompletos(detectarCamposIncompletos(contenedorRef.current));
  }, []);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || !validacionIntentada) return;

    let frame = 0;
    const actualizarDespuesDelRender = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(actualizarValidacion);
    };

    contenedor.addEventListener("input", actualizarDespuesDelRender);
    contenedor.addEventListener("change", actualizarDespuesDelRender);
    contenedor.addEventListener("click", actualizarDespuesDelRender);

    return () => {
      cancelAnimationFrame(frame);
      contenedor.removeEventListener("input", actualizarDespuesDelRender);
      contenedor.removeEventListener("change", actualizarDespuesDelRender);
      contenedor.removeEventListener("click", actualizarDespuesDelRender);
    };
  }, [actualizarValidacion, validacionIntentada]);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    limpiarMarcasValidacion(contenedor);
    for (const campo of camposIncompletos) {
      const control = document.getElementById(campo.controlId);
      if (!control || !contenedor.contains(control)) continue;

      const describedBy = new Set(
        (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean),
      );
      if (campo.mensaje) describedBy.add(campo.mensajeId);
      control.setAttribute(
        "data-validation-original-aria-invalid",
        control.getAttribute("aria-invalid") ?? "__ausente__",
      );
      control.setAttribute("aria-invalid", "true");
      control.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
      control.setAttribute("data-validation-error", "true");
      if (campo.mensaje) control.setAttribute("data-validation-message-id", campo.mensajeId);
      control.classList.add("!border-destructive", "ring-1", "ring-destructive/30");
    }

    return () => limpiarMarcasValidacion(contenedor);
  }, [camposIncompletos]);

  function validarCampos(): boolean {
    const faltantes = detectarCamposIncompletos(contenedorRef.current);
    setValidacionIntentada(true);
    setCamposIncompletos(faltantes);

    if (faltantes.length > 0) {
      requestAnimationFrame(() => {
        const primerControl = document.getElementById(faltantes[0].controlId);
        primerControl?.focus({ preventScroll: true });
        primerControl?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return false;
    }

    return true;
  }

  const mensajesUnicos = new Map<string, CampoIncompleto>();
  for (const campo of camposIncompletos) {
    if (campo.mensaje && !mensajesUnicos.has(campo.mensajeId)) {
      mensajesUnicos.set(campo.mensajeId, campo);
    }
  }

  const mensajesValidacion = validacionIntentada
    ? Array.from(mensajesUnicos.values()).map((campo) =>
        campo.mensaje
          ? createPortal(
              <p
                id={campo.mensajeId}
                role="alert"
                className="col-span-full w-full text-sm leading-5 text-destructive"
              >
                {campo.mensaje}
              </p>,
              campo.destinoMensaje,
              campo.mensajeId,
            )
          : null,
      )
    : null;

  return { contenedorRef, mensajesValidacion, validarCampos };
}
