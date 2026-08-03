import { CheckCircle2, CircleAlert, Clock3, Eye, Upload } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router";

import { prototypeEventEngine } from "@/prototype/simulator/prototype-simulator";
import { Badge } from "@/shared/components/base/Badge";
import { Button } from "@/shared/components/base/Button";
import { toast } from "@/shared/components/base/Toaster";

import { enviarGestion, type GestionState, marcarDocumentoCargado } from "../gestiones-store";
import { documentoEstaCargado } from "./documentos-rules";

interface PasoDocumentosProps {
  gestion: GestionState;
  onVolver: () => void;
}

/**
 * Etapa de carga y seguimiento documental.
 *
 * Cada archivo se publica antes de reflejarse localmente. Una carga nueva queda pendiente;
 * pendiente y aprobado solo permiten visualizar, mientras que rechazado muestra el motivo
 * y habilita el reemplazo. El envío final se habilita cuando todos los requisitos tienen
 * archivo y ninguno permanece rechazado.
 */

export function PasoDocumentos({ gestion, onVolver }: PasoDocumentosProps) {
  const navigate = useNavigate();
  const inputsArchivos = useRef<Record<string, HTMLInputElement | null>>({});
  const documentosCargados = gestion.documentosEstado.filter(documentoEstaCargado).length;
  const todosCargados = gestion.documentosEstado.every(
    (documento) => documentoEstaCargado(documento) && documento.estadoRevision !== "rechazado",
  );

  function abrirSelectorArchivo(nombreDocumento: string) {
    inputsArchivos.current[nombreDocumento]?.click();
  }

  async function handleSubirArchivo(nombreDocumento: string, archivo?: File) {
    if (!archivo) return;

    try {
      await prototypeEventEngine.publishEvent({
        eventId: "documentoSubido",
        payload: {
          gestionId: gestion.id,
          nombreDocumento,
          nombreArchivo: archivo.name,
        },
      });
      marcarDocumentoCargado(
        gestion.id,
        nombreDocumento,
        archivo.name,
        URL.createObjectURL(archivo),
      );
      toast.success("Archivo cargado. Quedó pendiente de aprobación.");
    } catch {
      toast.error("No pudimos cargar este archivo. Inténtalo nuevamente.");
    }
  }

  function handleVerDocumento(urlArchivo?: string) {
    if (!urlArchivo) {
      toast.error("No pudimos abrir este archivo. Intenta subirlo nuevamente.");
      return;
    }

    window.open(urlArchivo, "_blank", "noopener,noreferrer");
  }

  function handleEnviar() {
    enviarGestion(gestion.id);
    toast.success("Enviamos tus documentos a revisión.");
    navigate("/");
  }

  return (
    <div className="rounded-xl border border-black/[0.04] bg-white p-6 shadow-xs sm:p-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-lg font-semibold text-slate-800">Documentos</h2>
          <p className="text-xs text-muted-foreground">
            {documentosCargados} de {gestion.documentosEstado.length} cargados
          </p>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Sube los documentos necesarios para esta gestión. Revisaremos cada archivo antes de
          aprobarlo.
        </p>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          <strong className="font-medium text-primary">Importante:</strong> asegúrate de que los
          certificados y antecedentes hayan sido emitidos{" "}
          <strong className="font-medium text-slate-700">hace no más de un mes</strong>.
        </p>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border/80 bg-slate-50/50 px-4">
        {gestion.documentosEstado.map((documento) => {
          const estaCargado = documentoEstaCargado(documento);
          const estaRechazado = documento.estadoRevision === "rechazado";

          return (
            <div key={documento.nombre} className="py-5 first:pt-4 last:pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{documento.nombre}</p>
                {documento.estadoRevision === "aprobado" && (
                  <Badge
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                    variant="outline"
                  >
                    <CheckCircle2 aria-hidden="true" className="size-3" />
                    Aprobado
                  </Badge>
                )}
                {/* Amarillo explícito: el token warning del tema Lexy es naranjo. */}
                {documento.estadoRevision === "pendiente" && (
                  <Badge
                    className="border-yellow-200 bg-yellow-50 text-yellow-700"
                    variant="outline"
                  >
                    <Clock3 aria-hidden="true" className="size-3" />
                    Pendiente de aprobación
                  </Badge>
                )}
                {estaRechazado && (
                  <Badge
                    className="border-destructive/20 bg-destructive/5 text-destructive"
                    variant="outline"
                  >
                    <CircleAlert aria-hidden="true" className="size-3" />
                    Rechazado
                  </Badge>
                )}
              </div>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {documento.instruccionesObtencion}
              </p>

              {estaRechazado && documento.motivoRechazo && (
                <p
                  className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs leading-5 text-destructive"
                  role="alert"
                >
                  No pudimos aprobar este documento: {documento.motivoRechazo}
                </p>
              )}

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                  ref={(elemento) => {
                    inputsArchivos.current[documento.nombre] = elemento;
                  }}
                  accept="application/pdf,image/*"
                  aria-label={`Seleccionar archivo para ${documento.nombre}`}
                  className="sr-only"
                  id={`archivo-${gestion.id}-${documento.nombre}`}
                  onChange={(evento) => {
                    void handleSubirArchivo(documento.nombre, evento.target.files?.[0]);
                    evento.target.value = "";
                  }}
                  type="file"
                />

                {estaCargado && documento.nombreArchivo && (
                  <p className="min-w-0 truncate text-xs font-medium text-slate-600">
                    {documento.nombreArchivo}
                  </p>
                )}

                <div className="flex w-full shrink-0 items-center gap-2 sm:ml-auto sm:w-auto">
                  {!estaCargado ? (
                    <Button
                      className="flex-1 sm:flex-none"
                      size="sm"
                      variant="outline"
                      onClick={() => abrirSelectorArchivo(documento.nombre)}
                    >
                      <Upload aria-hidden="true" />
                      Subir archivo
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="flex-1 sm:flex-none"
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerDocumento(documento.urlArchivo)}
                      >
                        <Eye aria-hidden="true" />
                        Ver documento
                      </Button>
                      {/* Solo un rechazo autoriza reemplazar el archivo revisado. */}
                      {estaRechazado && (
                        <Button
                          className="flex-1 sm:flex-none"
                          size="sm"
                          variant="secondary"
                          onClick={() => abrirSelectorArchivo(documento.nombre)}
                        >
                          <Upload aria-hidden="true" />
                          Reemplazar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
        <Button variant="outline" onClick={onVolver}>
          Volver
        </Button>
        {todosCargados && <Button onClick={handleEnviar}>Enviar documentos a revisión</Button>}
      </div>
    </div>
  );
}
