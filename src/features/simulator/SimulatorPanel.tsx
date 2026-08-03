import { FileText, Plus, Settings, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/shared/components/base/Button";

import {
  actualizarEstadoGestion,
  agregarGestion,
  eliminarGestion,
  type EstadoDocumentoSimulado,
  simularEstadoDocumento,
  useGestiones,
} from "../gestiones-store";
import type { EstadoGestion } from "../mock-data";
import { CONTRATOS_DISPONIBLES, generarGestionDesdePlantilla } from "./generador-gestiones";

const ESTADOS_DOCUMENTO: Array<{ value: EstadoDocumentoSimulado; label: string }> = [
  { value: "sinCargar", label: "Sin cargar" },
  { value: "pendiente", label: "Pendiente de aprobación" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

export function SimulatorPanel() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState(CONTRATOS_DISPONIBLES[0]);
  const gestiones = useGestiones();
  const gestionesConDocumentos = gestiones.filter((gestion) => gestion.documentosEstado.length > 0);

  const handleAdd = () => {
    const nueva = generarGestionDesdePlantilla(selectedContrato);
    agregarGestion(nueva);
  };

  const handleAbrirDocumentos = (gestionId: string) => {
    setIsOpen(false);
    navigate("/gestion/" + gestionId + "/documentos");
  };

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-[calc(1.5rem+env(safe-area-inset-left))] z-50 flex size-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        onClick={() => setIsOpen(true)}
        title="Panel del simulador"
      >
        <Settings className="size-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-[calc(1.5rem+env(safe-area-inset-left))] z-50 flex max-h-[80vh] w-80 flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-white">
          <Settings className="size-3.5 text-slate-400" />
          MODO SIMULADOR
        </h3>
        <button
          className="text-slate-400 transition-colors hover:text-white"
          onClick={() => setIsOpen(false)}
          title="Cerrar simulador"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-7 overflow-y-auto p-5">
        <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Inyectar contrato
          </h4>
          <div className="flex flex-col gap-2.5">
            <select
              className="w-full cursor-pointer rounded-lg border-transparent bg-slate-50 px-3 py-2 text-xs text-slate-700 shadow-sm transition-all focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              onChange={(event) => setSelectedContrato(event.target.value)}
              value={selectedContrato}
            >
              {CONTRATOS_DISPONIBLES.map((contrato) => (
                <option key={contrato} value={contrato}>
                  {contrato}
                </option>
              ))}
            </select>
            <Button
              className="h-8 w-full border border-slate-200 bg-slate-100 text-xs font-medium text-slate-700 shadow-none hover:bg-slate-200"
              onClick={handleAdd}
            >
              <Plus className="mr-1.5 size-3.5" /> Agregar al listado
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Forzar estados
          </h4>
          {gestiones.length === 0 ? (
            <p className="text-xs italic text-slate-400">No hay gestiones activas.</p>
          ) : (
            <div className="-mx-2 flex flex-col gap-1">
              {gestiones.map((gestion) => (
                <div
                  className="group flex flex-col gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                  key={gestion.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="truncate text-[11px] font-medium text-slate-700"
                      title={gestion.nombre}
                    >
                      {gestion.nombre}
                    </span>
                    <button
                      className="shrink-0 text-slate-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                      onClick={() => eliminarGestion(gestion.id)}
                      title="Eliminar gestión"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <select
                    className="w-full cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600 shadow-sm transition-all focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
                    onChange={(event) =>
                      actualizarEstadoGestion(gestion.id, event.target.value as EstadoGestion)
                    }
                    value={gestion.estado}
                  >
                    <option value="pendiente_datos">Faltan datos</option>
                    <option value="esperando_alzamiento">En espera del alzamiento</option>
                    <option value="transferencia_bloqueada">No puede continuar</option>
                    <option value="faltan_documentos">Faltan documentos</option>
                    <option value="en_revision">En revisión</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Estados de documentos
          </h4>
          {gestionesConDocumentos.length === 0 ? (
            <p className="text-xs italic text-slate-400">
              No hay gestiones con documentos para probar.
            </p>
          ) : (
            <div className="space-y-4">
              {gestionesConDocumentos.map((gestion) => (
                <div
                  className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/60"
                  key={gestion.id}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
                    <p className="truncate text-[11px] font-medium text-slate-700">
                      {gestion.nombre}
                    </p>
                    <button
                      className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80"
                      onClick={() => handleAbrirDocumentos(gestion.id)}
                    >
                      <FileText className="size-3" />
                      Ver etapa
                    </button>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {gestion.documentosEstado.map((documento) => {
                      const estadoActual =
                        documento.nombreArchivo && documento.estadoRevision
                          ? documento.estadoRevision
                          : "sinCargar";

                      return (
                        <div className="space-y-1.5 px-3 py-2.5" key={documento.nombre}>
                          <p className="line-clamp-2 text-[10px] leading-4 text-slate-500">
                            {documento.nombre}
                          </p>
                          <select
                            aria-label={"Estado simulado de " + documento.nombre}
                            className="w-full cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
                            onChange={(event) =>
                              simularEstadoDocumento(
                                gestion.id,
                                documento.nombre,
                                event.target.value as EstadoDocumentoSimulado,
                              )
                            }
                            value={estadoActual}
                          >
                            {ESTADOS_DOCUMENTO.map((estado) => (
                              <option key={estado.value} value={estado.value}>
                                {estado.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
