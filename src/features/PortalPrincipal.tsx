import { FileText, Home, Scale, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/shared/components/base/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/base/Card";
import { Progress } from "@/shared/components/base/Progress";

import { enviarGestion, useGestiones } from "./gestiones-store";
import { obtenerIdentificadorGestion } from "./identificador-gestion-rules";
import type { EstadoGestion } from "./mock-data";
import { clienteMock, estadosGestion, mensajeProgreso } from "./mock-data";
import {
  debeMostrarPasoConyuge,
  debeMostrarPasoDocumentos,
  debeMostrarPasoTercero,
  esContratoConSegundoSocio,
} from "./pasos/tercero-rules";

/* ───── Mapeos visuales por estado elegantes y limpios ───── */

function ctaVariantFromEstado(estado: EstadoGestion) {
  switch (estado) {
    case "pendiente_datos":
      return "default" as const;
    case "esperando_alzamiento":
      return "secondary" as const;
    case "transferencia_bloqueada":
      return "secondary" as const;
    case "faltan_documentos":
      return "secondary" as const;
    case "en_revision":
      return "secondary" as const;
    case "completado":
      return "outline" as const;
  }
}

function ctaClassFromEstado(estado: EstadoGestion) {
  if (
    estado === "esperando_alzamiento" ||
    estado === "transferencia_bloqueada" ||
    estado === "faltan_documentos" ||
    estado === "en_revision"
  ) {
    return "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20";
  }
  return "";
}

function iconFromContrato(nombre: string) {
  const norm = nombre.toLowerCase();
  switch (true) {
    case norm.includes("inmueble") || norm.includes("propiedad") || norm.includes("hipoteca"):
      return Home;
    case norm.includes("acciones") || norm.includes("sociedad") || norm.includes("comercial"):
      return Scale;
    case norm.includes("vehiculo") || norm.includes("prenda"):
      return TrendingUp;
    default:
      return FileText;
  }
}

export function PortalPrincipal() {
  const gestiones = useGestiones();
  const navigate = useNavigate();

  function handleCtaClick(gestionId: string, estado: EstadoGestion) {
    const gestion = gestiones.find((g) => g.id === gestionId);
    if (!gestion) return;

    if (estado === "esperando_alzamiento" || estado === "transferencia_bloqueada") {
      navigate(`/gestion/${gestionId}/datos-especificos`);
      return;
    }

    if (estado === "en_revision" || estado === "completado") {
      navigate(`/gestion/${gestionId}/datos-personales`);
      return;
    }

    if (estado === "faltan_documentos") {
      if (debeMostrarPasoDocumentos(gestion.nombre, gestion.documentosEstado.length > 0)) {
        navigate(`/gestion/${gestionId}/documentos`);
        return;
      }
      enviarGestion(gestionId);
      navigate("/");
      return;
    }

    if (esContratoConSegundoSocio(gestion.nombre)) {
      navigate(`/gestion/${gestionId}/datos-personales`);
      return;
    }

    if (!gestion.datosPersonalesConfirmados) {
      navigate(`/gestion/${gestionId}/datos-personales`);
      return;
    }

    const estadoCivil =
      localStorage.getItem("lexy_estadoCivil") || gestion.clienteEstadoCivil || "";
    const regimen =
      localStorage.getItem("lexy_regimenMatrimonial") || gestion.clienteRegimenMatrimonial || "";

    if (debeMostrarPasoConyuge(gestion.nombre, estadoCivil, regimen) && !gestion.conyugeCompleto) {
      navigate(`/gestion/${gestionId}/conyuge`);
      return;
    }
    if (gestion.requiereDatosBien && !gestion.datosEspecificosCompletos) {
      navigate(`/gestion/${gestionId}/datos-especificos`);
      return;
    }
    const tipoSociedad =
      typeof gestion.valoresEspecificos?.tipoSociedad === "string"
        ? gestion.valoresEspecificos.tipoSociedad
        : "";
    if (debeMostrarPasoTercero(gestion.nombre, tipoSociedad) && !gestion.terceroCompleto) {
      navigate(`/gestion/${gestionId}/tercero`);
      return;
    }

    if (debeMostrarPasoDocumentos(gestion.nombre, gestion.documentosEstado.length > 0)) {
      navigate(`/gestion/${gestionId}/documentos`);
      return;
    }
    enviarGestion(gestionId);
    navigate("/");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* ── Bienvenida ── */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Protejamos lo tuyo
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
          Hola {clienteMock.nombre.split(" ")[0]}, construyamos juntos el escudo para tu patrimonio.
          El camino es simple: completa la ficha con la información de tus gestiones y sube los
          documentos requeridos. Con esto prepararemos los documentos legales necesarios para
          asegurar tus bienes.
        </p>
      </div>

      {/* ── Indicador de etapas del caso (Minimalista) ── */}
      <div className="mb-12">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-4">
          Etapas de tu protección
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Etapa 1 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-black/[0.06] shadow-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
              1
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Ingreso de datos</p>
              <p className="text-xs text-slate-500 mt-0.5">Fichas y documentos requeridos</p>
            </div>
          </div>

          {/* Etapa 2 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-black/[0.06] shadow-xs opacity-70">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground text-xs font-bold">
              2
            </span>
            <div>
              <p className="text-sm font-medium text-slate-700">Preparación legal</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Elaboración de instrumentos y contratos
              </p>
            </div>
          </div>

          {/* Etapa 3 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-black/[0.06] shadow-xs opacity-70">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground text-xs font-bold">
              3
            </span>
            <div>
              <p className="text-sm font-medium text-slate-700">Legalización y cierre</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Firma, trámites notariales o inscripciones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gestiones ── */}
      <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
        <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Tus gestiones
        </h2>
        <span className="text-xs text-muted-foreground">
          {gestiones.filter((g) => g.estado === "completado" || g.estado === "en_revision").length}{" "}
          de {gestiones.length} enviadas
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {gestiones.map((gestion, index) => {
          const estadoInfo = estadosGestion[gestion.estado];
          const Icon = iconFromContrato(gestion.nombre);
          const identificadorGestion = obtenerIdentificadorGestion(
            gestion.nombre,
            gestion.valoresEspecificos ?? {},
          );

          return (
            <Card
              key={gestion.id}
              className="min-w-0 transition-all duration-300 ease-out hover:shadow-xs"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="px-4 pb-2 pt-4">
                <div className="flex min-w-0 items-start gap-3">
                  {/* Icono de la gestión elegante sobre fondo sutil */}
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                    <Icon className="size-5 text-primary" />
                  </span>

                  {/* Título e Identificador concatenado */}
                  <CardTitle className="min-w-0 flex-1 break-words text-sm font-medium tracking-tight text-slate-900">
                    <span>{gestion.nombre}</span>
                    {identificadorGestion && (
                      <span className="mt-1 block break-words font-normal text-slate-500 sm:mt-0 sm:inline">
                        <span className="hidden sm:inline"> — </span>
                        {identificadorGestion}
                      </span>
                    )}
                  </CardTitle>
                </div>

                {/* Resumen del contrato */}
                <p className="mt-2 break-words text-xs leading-relaxed text-slate-500">
                  {gestion.resumen}
                </p>
              </CardHeader>

              <CardContent className="min-w-0 px-4 pb-3">
                {/* Estado fusionado: Label + Mensaje dinámico */}
                <div className="mt-3 min-w-0 break-words">
                  <span className="text-xs font-semibold text-slate-700">
                    Paso actual:{" "}
                    <span className="font-medium text-slate-600">
                      {estadosGestion[gestion.estado].label}
                    </span>
                  </span>
                  <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                    — {mensajeProgreso(gestion.id, gestion.estado)}
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5 sm:hidden">
                    {mensajeProgreso(gestion.id, gestion.estado)}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-3 flex min-w-0 items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <Progress value={gestion.avance} className="h-1.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{gestion.avance}%</span>
                </div>
              </CardContent>

              <CardFooter className="w-full justify-stretch px-4 pt-0 pb-4 sm:justify-end">
                <Button
                  variant={ctaVariantFromEstado(gestion.estado)}
                  className={`h-10 w-full rounded px-4 text-sm sm:h-8 sm:w-auto sm:px-3.5 sm:text-xs ${ctaClassFromEstado(gestion.estado)}`}
                  onClick={() => handleCtaClick(gestion.id, gestion.estado)}
                >
                  {estadoInfo.cta}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <p className="mt-12 text-center text-xs text-muted-foreground/80">
        Si tienes dudas sobre alguna gestión, tu equipo Lexy está disponible para ayudarte.
      </p>
    </div>
  );
}
