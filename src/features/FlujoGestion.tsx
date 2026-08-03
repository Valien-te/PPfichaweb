import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";

import { prototypeEventEngine } from "@/prototype/simulator/prototype-simulator";
import { AppDialog } from "@/shared/components/base/AppDialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/base/Breadcrumb";
import { Button } from "@/shared/components/base/Button";
import { toast } from "@/shared/components/base/Toaster";

import {
  enviarGestion,
  type GestionState,
  getClienteDatos,
  getGestionState,
  marcarFichaEnviada,
  useGestion,
} from "./gestiones-store";
import { obtenerIdentificadorGestion } from "./identificador-gestion-rules";
import { obtenerPresentacionBienesMuebles } from "./pasos/datos-especificos-copy";
import { PasoConyuge } from "./pasos/PasoConyuge";
import { PasoDatosEspecificos } from "./pasos/PasoDatosEspecificos";
import { PasoDatosPersonales } from "./pasos/PasoDatosPersonales";
import { PasoDocumentos } from "./pasos/PasoDocumentos";
import { PasoRegistroCivilVehiculo } from "./pasos/PasoRegistroCivilVehiculo";
import { PasoTercero } from "./pasos/PasoTercero";
import { esTransferenciaVehiculoRegistroCivil } from "./pasos/registro-civil-vehiculo-rules";
import {
  debeMostrarPasoDocumentos,
  esContratoConSegundoSocio,
  obtenerPasoEntradaGestion,
  obtenerSecuenciaPasosGestion,
  type PasoGestionId,
} from "./pasos/tercero-rules";

const ETIQUETAS_PASOS: Record<PasoGestionId, string> = {
  "datos-personales": "Datos personales",
  conyuge: "Cónyuge",
  "datos-especificos": "Datos del bien",
  tercero: "Tercero",
  documentos: "Documentos",
};

function construirPasos(gestion: GestionState) {
  const clienteDatos = getClienteDatos();
  const estadoCivil =
    localStorage.getItem("lexy_estadoCivil") ||
    gestion.clienteEstadoCivil ||
    clienteDatos.estadoCivil ||
    "";
  const regimen =
    localStorage.getItem("lexy_regimenMatrimonial") ||
    gestion.clienteRegimenMatrimonial ||
    clienteDatos.regimenMatrimonial ||
    "";
  const tipoSociedad =
    typeof gestion.valoresEspecificos?.tipoSociedad === "string"
      ? gestion.valoresEspecificos.tipoSociedad
      : "";
  const presentacionBienesMuebles = obtenerPresentacionBienesMuebles(gestion.nombre);
  return obtenerSecuenciaPasosGestion(
    gestion.nombre,
    gestion.requiereDatosBien,
    estadoCivil,
    regimen,
    tipoSociedad,
    gestion.documentosEstado.length > 0,
  ).map((id) => ({
    id,
    label:
      id === "datos-especificos" && presentacionBienesMuebles
        ? presentacionBienesMuebles.titulo
        : id === "tercero" && esTransferenciaVehiculoRegistroCivil(gestion.nombre)
          ? "Registro Civil"
          : id === "tercero" && esContratoConSegundoSocio(gestion.nombre)
            ? "Segundo socio"
            : ETIQUETAS_PASOS[id],
  }));
}

export function FlujoGestion() {
  const { gestionId, pasoId } = useParams<{ gestionId: string; pasoId: string }>();
  const navigate = useNavigate();
  const gestion = useGestion(gestionId ?? "");
  const [confirmacionEnvio, setConfirmacionEnvio] = useState<{
    requiereDocumentos: boolean;
    rutaDestino: string;
  } | null>(null);

  useEffect(() => {
    // Cada cambio de etapa comienza arriba para no heredar el scroll del formulario anterior.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [gestionId, pasoId]);

  // Determinar pasos según la gestión
  const pasos = gestion ? construirPasos(gestion) : [];
  const primerPasoPendiente = gestion
    ? obtenerPasoEntradaGestion(
        pasos.map((paso) => paso.id),
        gestion,
        gestion.fichaEnviada,
      )
    : undefined;

  const pasoActualIdx = pasos.findIndex((p) => p.id === pasoId);
  const pasoActual = pasoActualIdx >= 0 ? pasoActualIdx : 0;
  const siguientePaso = pasos[pasoActual + 1]?.id;
  const esUltimoPasoFicha =
    pasoId !== "documentos" && (siguientePaso === "documentos" || pasoActual === pasos.length - 1);

  if (!gestion) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Gestión no encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          Volver al portal
        </Button>
      </main>
    );
  }

  const identificadorGestion = obtenerIdentificadorGestion(
    gestion.nombre,
    gestion.valoresEspecificos ?? {},
  );

  function handleVolver() {
    if (pasoActual > 0) {
      navigate(`/gestion/${gestionId}/${pasos[pasoActual - 1].id}`);
    } else {
      navigate("/");
    }
  }

  async function handleSiguiente() {
    if (!gestion) return;
    let gestionActualizada = getGestionState(gestion.id) ?? gestion;
    let pasosActualizados = construirPasos(gestionActualizada);
    let indiceActual = pasosActualizados.findIndex((paso) => paso.id === pasoId);
    const siguientePasoActualizado = pasosActualizados[indiceActual + 1]?.id;
    const estaEnviandoFicha =
      pasoId !== "documentos" &&
      (siguientePasoActualizado === "documentos" || indiceActual === pasosActualizados.length - 1);
    let fichaRecienEnviada = false;

    if (estaEnviandoFicha && !gestionActualizada.fichaEnviada) {
      // Publicar primero evita bloquear localmente una ficha que el backend no recibió.
      try {
        await prototypeEventEngine.publishEvent({
          eventId: "fichaEnviada",
          payload: { gestionId: gestionActualizada.id },
        });
      } catch {
        toast.error("No pudimos enviar tu ficha. Inténtalo nuevamente.");
        return;
      }

      marcarFichaEnviada(gestionActualizada.id);
      fichaRecienEnviada = true;
      gestionActualizada = getGestionState(gestionActualizada.id) ?? gestionActualizada;
      pasosActualizados = construirPasos(gestionActualizada);
      indiceActual = pasosActualizados.findIndex((paso) => paso.id === pasoId);
    }

    if (indiceActual >= 0 && indiceActual < pasosActualizados.length - 1) {
      const proximoPaso = pasosActualizados[indiceActual + 1].id;
      const rutaDestino = `/gestion/${gestionId}/${proximoPaso}`;
      if (fichaRecienEnviada) {
        // La confirmación intermedia explica el próximo paso antes de navegar.
        setConfirmacionEnvio({
          requiereDocumentos: proximoPaso === "documentos",
          rutaDestino,
        });
        return;
      }
      navigate(rutaDestino);
      return;
    }

    if (
      indiceActual === pasosActualizados.length - 1 &&
      !debeMostrarPasoDocumentos(
        gestionActualizada.nombre,
        gestionActualizada.documentosEstado.length > 0,
      )
    ) {
      enviarGestion(gestionActualizada.id);
      const rutaDestino = "/";
      if (fichaRecienEnviada) {
        setConfirmacionEnvio({ requiereDocumentos: false, rutaDestino });
        return;
      }
      navigate(rutaDestino);
    }
  }

  function handleContinuarDespuesDelEnvio() {
    if (!confirmacionEnvio) return;
    const { rutaDestino } = confirmacionEnvio;
    setConfirmacionEnvio(null);
    navigate(rutaDestino);
  }

  function handleVolverAlPortal() {
    navigate("/");
  }

  if (pasoId && !pasos.some((paso) => paso.id === pasoId)) {
    return (
      <Navigate to={`/gestion/${gestion.id}/${pasos.at(-1)?.id ?? "datos-personales"}`} replace />
    );
  }

  const indicePasoSolicitado = pasos.findIndex((paso) => paso.id === pasoId);
  const indicePrimerPasoPendiente = pasos.findIndex((paso) => paso.id === primerPasoPendiente);
  if (
    !gestion.fichaEnviada &&
    indicePrimerPasoPendiente >= 0 &&
    indicePasoSolicitado > indicePrimerPasoPendiente
  ) {
    return <Navigate to={`/gestion/${gestion.id}/${primerPasoPendiente}`} replace />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Cabecera de página */}
      <div className="mb-6">
        <Breadcrumb aria-label="Navegación de la gestión" className="mb-2">
          <BreadcrumbList className="gap-1.5 text-xs leading-5">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="font-normal text-primary hover:text-primary/80">
                <Link to="/">Mis gestiones</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-400 [&>svg]:size-3.5" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="min-w-0 break-words font-normal text-slate-600">
                {gestion.nombre}
                {identificadorGestion && ` — ${identificadorGestion}`}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Completa tu ficha</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Ya tenemos parte de tus datos. Asegúrate de que estén correctos y completa los que falten.
        </p>
      </div>

      {/* Indicador de pasos (Stepper alineado con el contenido de las cards) */}
      <div className="relative mb-14 w-full px-6 sm:px-8">
        {/* Línea conectora de fondo */}
        <div className="absolute top-4 left-6 right-6 sm:left-8 sm:right-8 h-0.5 -translate-y-1/2 z-0 px-5">
          <div className="w-full h-full bg-slate-100 relative">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: gestion.fichaEnviada
                  ? "100%"
                  : `${(pasoActual / (pasos.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Pasos */}
        <div className="relative flex justify-between z-10">
          {pasos.map((paso, i) => {
            const isCurrent = i === pasoActual;
            const isPast = i < pasoActual;

            return (
              <div key={paso.id} className="flex flex-col items-center relative w-10">
                {/* Botón de Paso */}
                {/* Antes del envío solo se vuelve atrás; después todos los pasos son revisables. */}
                <button
                  onClick={() => navigate(`/gestion/${gestionId}/${paso.id}`)}
                  disabled={!gestion.fichaEnviada && !isPast && !isCurrent}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Paso ${i + 1}: ${paso.label}`}
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 relative z-10 ${
                    isCurrent
                      ? `${gestion.fichaEnviada ? "cursor-pointer" : "cursor-default"} bg-primary text-primary-foreground shadow-xs ring-4 ring-primary/10 scale-110`
                      : isPast || gestion.fichaEnviada
                        ? "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95"
                        : "bg-slate-100 text-slate-400 cursor-default"
                  }`}
                >
                  {i + 1}
                </button>

                {/* Etiqueta abajo */}
                <span
                  className={`absolute top-10 whitespace-nowrap text-xs font-semibold leading-tight left-1/2 -translate-x-1/2 transition-colors duration-200 ${
                    isCurrent ? "block" : "hidden sm:block"
                  } ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isPast || gestion.fichaEnviada
                        ? "text-primary"
                        : "text-slate-400"
                  }`}
                >
                  {paso.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido del paso (la card ahora la maneja cada componente) */}
      <div className="mb-8">
        {/* La ficha enviada es navegable, pero todos sus pasos reciben modo de solo lectura. */}
        {gestion.fichaEnviada && pasoId !== "documentos" && (
          <p className="mb-4 text-sm leading-relaxed text-slate-500" role="status">
            <span className="font-medium text-primary">Ficha enviada.</span> Puedes revisar tus
            respuestas, pero ya no puedes modificarlas.
          </p>
        )}
        {pasoId === "datos-personales" && (
          <PasoDatosPersonales
            esUltimoPasoFicha={esUltimoPasoFicha}
            soloLectura={gestion.fichaEnviada}
            onVolver={handleVolver}
            onSiguiente={handleSiguiente}
          />
        )}
        {pasoId === "conyuge" && (
          <PasoConyuge
            esUltimoPasoFicha={esUltimoPasoFicha}
            soloLectura={gestion.fichaEnviada}
            gestionId={gestion.id}
            onVolver={handleVolver}
            onSiguiente={handleSiguiente}
          />
        )}
        {pasoId === "datos-especificos" && (
          <PasoDatosEspecificos
            esUltimoPasoFicha={esUltimoPasoFicha}
            soloLectura={gestion.fichaEnviada}
            gestion={gestion}
            onVolver={handleVolver}
            onSiguiente={handleSiguiente}
            onVolverAlPortal={handleVolverAlPortal}
          />
        )}
        {pasoId === "tercero" && esTransferenciaVehiculoRegistroCivil(gestion.nombre) && (
          <PasoRegistroCivilVehiculo
            esUltimoPasoFicha={esUltimoPasoFicha}
            soloLectura={gestion.fichaEnviada}
            gestionId={gestion.id}
            onVolver={handleVolver}
            onSiguiente={handleSiguiente}
          />
        )}
        {pasoId === "tercero" && !esTransferenciaVehiculoRegistroCivil(gestion.nombre) && (
          <PasoTercero
            esUltimoPasoFicha={esUltimoPasoFicha}
            soloLectura={gestion.fichaEnviada}
            gestionId={gestion.id}
            onVolver={handleVolver}
            onSiguiente={handleSiguiente}
          />
        )}
        {pasoId === "documentos" && <PasoDocumentos gestion={gestion} onVolver={handleVolver} />}
      </div>

      <AppDialog
        open={confirmacionEnvio !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmacionEnvio(null);
        }}
        trigger={<button type="button" className="hidden" aria-hidden tabIndex={-1} />}
        icon={<CheckCircle2 className="size-10 text-primary" strokeWidth={1.75} aria-hidden />}
        title="Ficha enviada"
        headerClassName="gap-3"
        titleClassName="font-semibold"
        descriptionClassName="text-sm leading-5"
        description={
          confirmacionEnvio?.requiereDocumentos
            ? "Enviamos los datos de tu ficha para revisión. Ahora debes subir los documentos de esta escritura."
            : "Enviamos los datos de tu ficha para revisión. Te avisaremos si necesitamos que corrijas o completes información."
        }
        confirmLabel={confirmacionEnvio?.requiereDocumentos ? "Subir documentos" : "Continuar"}
        onConfirm={handleContinuarDespuesDelEnvio}
        actionsAlignment="center"
        hideCancelAction
        className="gap-6 border-primary/15 bg-card px-8 py-8 sm:max-w-sm"
      />
    </main>
  );
}
