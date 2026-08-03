import { Button } from "@/shared/components/base/Button";

import { completarOrientacionRegistroCivilVehiculo } from "../gestiones-store";
import { URL_REQUISITOS_TRANSFERENCIA_REGISTRO_CIVIL } from "./registro-civil-vehiculo-rules";

interface PasoRegistroCivilVehiculoProps {
  esUltimoPasoFicha?: boolean;
  soloLectura?: boolean;
  gestionId: string;
  onVolver: () => void;
  onSiguiente: () => void;
}

const instrucciones = [
  {
    titulo: "Agenda tu atención",
    descripcion: "Reserva una hora en una oficina del Registro Civil. Necesitarás tu ClaveÚnica.",
  },
  {
    titulo: "Asistan con los documentos",
    descripcion:
      "Deben asistir tú y la persona que recibirá el vehículo. Lleven sus cédulas vigentes, el padrón del vehículo y el permiso de circulación al día.",
  },
  {
    titulo: "Solicita la transferencia",
    descripcion:
      "Indica que realizarán una transferencia mediante declaración consensual. En la oficina deberán pagar los derechos e impuestos correspondientes.",
  },
  {
    titulo: "Guarda el comprobante",
    descripcion:
      "Conserva la copia o el comprobante de la solicitud de transferencia que te entregue el Registro Civil.",
  },
];

export function PasoRegistroCivilVehiculo({
  esUltimoPasoFicha = false,
  soloLectura = false,
  gestionId,
  onVolver,
  onSiguiente,
}: PasoRegistroCivilVehiculoProps) {
  function handleContinuar() {
    if (soloLectura) {
      onSiguiente();
      return;
    }

    completarOrientacionRegistroCivilVehiculo(gestionId);
    onSiguiente();
  }

  return (
    <section
      aria-labelledby="titulo-registro-civil-vehiculo"
      className="rounded-lg border border-border bg-card p-6 shadow-xs sm:p-8"
    >
      <header>
        <h2 id="titulo-registro-civil-vehiculo" className="text-lg font-semibold text-foreground">
          Transfiere el vehículo en el Registro Civil
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          En tu caso, no necesitamos preparar un contrato. Puedes realizar la transferencia
          directamente ante un oficial del Registro Civil mediante una declaración consensual. Así
          evitas el trámite y el costo adicional de autorizar un contrato en una notaría.
        </p>
      </header>

      <ol className="mt-6 space-y-5">
        {instrucciones.map((instruccion, index) => (
          <li key={instruccion.titulo} className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/[0.06] text-sm font-semibold text-primary"
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-sm font-semibold text-foreground">{instruccion.titulo}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {instruccion.descripcion}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-lg border border-warning/25 bg-warning/[0.02] p-4">
        <h3 className="text-sm font-semibold text-foreground">Documento obligatorio</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Al finalizar, deberás subir el comprobante de la solicitud de transferencia emitido por el
          Registro Civil. Es el único documento que te pediremos para cerrar esta gestión.
        </p>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onVolver}>
          Volver
        </Button>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <a href={URL_REQUISITOS_TRANSFERENCIA_REGISTRO_CIVIL} target="_blank" rel="noreferrer">
              Ver requisitos oficiales
            </a>
          </Button>
          <Button onClick={handleContinuar}>
            {soloLectura
              ? "Continuar"
              : esUltimoPasoFicha
                ? "Enviar ficha"
                : "Continuar a documentos"}
          </Button>
        </div>
      </div>
    </section>
  );
}
