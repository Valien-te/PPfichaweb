import { useState } from "react";

import { Button } from "@/shared/components/base/Button";
import { Checkbox } from "@/shared/components/base/Checkbox";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
import { toast } from "@/shared/components/base/Toaster";

import { confirmarDatosPersonales, getClienteDatos } from "../gestiones-store";

// Comunas y Regiones de Chile para el autocompletado
const COMUNAS_REGIONES: Record<string, string> = {
  Santiago: "Metropolitana",
  Providencia: "Metropolitana",
  "Las Condes": "Metropolitana",
  Vitacura: "Metropolitana",
  "Lo Barnechea": "Metropolitana",
  Ñuñoa: "Metropolitana",
  Maipú: "Metropolitana",
  "La Florida": "Metropolitana",
  "Viña del Mar": "Valparaíso",
  Valparaíso: "Valparaíso",
  Concepción: "Biobío",
  Temuco: "La Araucanía",
  Antofagasta: "Antofagasta",
  "La Serena": "Coquimbo",
  Rancagua: "O'Higgins",
  Talca: "Maule",
  "Puerto Montt": "Los Lagos",
  Iquique: "Tarapacá",
};
const COMUNAS = Object.keys(COMUNAS_REGIONES);

interface PasoDatosPersonalesProps {
  esUltimoPasoFicha?: boolean;
  soloLectura?: boolean;
  onVolver: () => void;
  onSiguiente: () => void;
}

export function PasoDatosPersonales({
  esUltimoPasoFicha = false,
  soloLectura = false,
  onVolver,
  onSiguiente,
}: PasoDatosPersonalesProps) {
  const clienteDatos = getClienteDatos();
  // Inicializamos con datos del store global
  const [datos, setDatos] = useState({
    nombres: clienteDatos.nombres,
    apellidoPaterno: clienteDatos.apellidoPaterno,
    apellidoMaterno: clienteDatos.apellidoMaterno,
    rut: clienteDatos.rut,
    fechaNacimiento: clienteDatos.fechaNacimiento,
    nacionalidad: clienteDatos.nacionalidad,
    estadoCivil: clienteDatos.estadoCivil,
    regimenMatrimonial: clienteDatos.regimenMatrimonial,
    profesion: clienteDatos.profesion,
    email: clienteDatos.email,
    telefono: clienteDatos.telefono,
    domicilio: clienteDatos.domicilio,
    comuna: clienteDatos.comuna,
    region: clienteDatos.region,
  });
  const [confirmado, setConfirmado] = useState(false);

  function handleChange(campo: keyof typeof datos, valor: string) {
    setDatos((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === "estadoCivil" && valor !== "Casado/a" && valor !== "Acuerdo de Unión Civil") {
        next.regimenMatrimonial = "";
      }
      if (campo === "comuna" && COMUNAS_REGIONES[valor]) {
        next.region = COMUNAS_REGIONES[valor];
      }
      return next;
    });
  }

  function handleGuardar() {
    if (soloLectura) {
      onSiguiente();
      return;
    }

    const camposRequeridos = [
      datos.nombres,
      datos.apellidoPaterno,
      datos.apellidoMaterno,
      datos.rut,
      datos.fechaNacimiento,
      datos.nacionalidad,
      datos.profesion,
      datos.estadoCivil,
      datos.email,
      datos.telefono,
      datos.domicilio,
      datos.comuna,
      datos.region,
    ];

    const regimenRequerido =
      datos.estadoCivil === "Casado/a" || datos.estadoCivil === "Acuerdo de Unión Civil";

    if (
      camposRequeridos.some((c) => !c || String(c).trim() === "") ||
      (regimenRequerido &&
        (!datos.regimenMatrimonial || String(datos.regimenMatrimonial).trim() === ""))
    ) {
      toast.warning("Por favor, completa todos los campos obligatorios antes de continuar.");
      return;
    }

    if (!confirmado) {
      toast.warning("Confirma que tus datos están correctos antes de continuar.");
      return;
    }
    confirmarDatosPersonales(datos);
    // Persistir estado civil y régimen para que PasoTercero los lea de forma confiable
    localStorage.setItem("lexy_estadoCivil", datos.estadoCivil);
    localStorage.setItem("lexy_regimenMatrimonial", datos.regimenMatrimonial);
    toast.success("Datos personales guardados exitosamente");
    onSiguiente();
  }

  const camposRequeridos = [
    datos.nombres,
    datos.apellidoPaterno,
    datos.apellidoMaterno,
    datos.rut,
    datos.fechaNacimiento,
    datos.nacionalidad,
    datos.profesion,
    datos.estadoCivil,
    datos.email,
    datos.telefono,
    datos.domicilio,
    datos.comuna,
    datos.region,
  ];

  const regimenRequerido =
    datos.estadoCivil === "Casado/a" || datos.estadoCivil === "Acuerdo de Unión Civil";
  const regimenValido =
    !regimenRequerido || (datos.regimenMatrimonial && datos.regimenMatrimonial.trim() !== "");
  const todosCamposLlenos =
    camposRequeridos.every((c) => c && String(c).trim() !== "") && regimenValido;
  const botonDeshabilitado = !todosCamposLlenos || !confirmado;

  return (
    <div className="rounded-xl border border-black/[0.04] bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Encabezado del paso */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Datos personales</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          Confírmanos que tus datos personales están correctos.
        </p>
      </div>

      <fieldset
        disabled={soloLectura}
        className="contents [&_input:disabled]:opacity-100 [&_select:disabled]:opacity-100 [&_textarea:disabled]:opacity-100 [&_[role=combobox]:disabled]:opacity-100"
      >
        {/* Datalist global para autocompletar comunas */}
        <datalist id="comunas-chile">
          {COMUNAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {/* Grid de campos */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="nombres">Nombres</Label>
            <Input
              id="nombres"
              value={datos.nombres}
              onChange={(e) => handleChange("nombres", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
            <Input
              id="apellidoPaterno"
              value={datos.apellidoPaterno}
              onChange={(e) => handleChange("apellidoPaterno", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="apellidoMaterno">Apellido materno</Label>
            <Input
              id="apellidoMaterno"
              value={datos.apellidoMaterno}
              onChange={(e) => handleChange("apellidoMaterno", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rut">RUT</Label>
            <Input
              id="rut"
              value={datos.rut}
              onChange={(e) => handleChange("rut", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={datos.fechaNacimiento}
              onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="nacionalidad">Nacionalidad</Label>
            <Input
              id="nacionalidad"
              value={datos.nacionalidad}
              onChange={(e) => handleChange("nacionalidad", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="profesion">Profesión u oficio</Label>
            <Input
              id="profesion"
              value={datos.profesion}
              onChange={(e) => handleChange("profesion", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="estadoCivil">Estado civil</Label>
            <select
              id="estadoCivil"
              value={datos.estadoCivil}
              data-filled={datos.estadoCivil.trim().length > 0}
              onChange={(e) => handleChange("estadoCivil", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors duration-150 data-[filled=true]:bg-muted/50 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
              <option value="Acuerdo de Unión Civil">Acuerdo de Unión Civil</option>
            </select>
          </div>

          {/* Régimen matrimonial condicional */}
          {(datos.estadoCivil === "Casado/a" || datos.estadoCivil === "Acuerdo de Unión Civil") && (
            <div className="grid gap-1.5 animate-in slide-in-from-top-2 duration-200">
              <Label htmlFor="regimenMatrimonial">Régimen matrimonial / patrimonial</Label>
              <select
                id="regimenMatrimonial"
                value={datos.regimenMatrimonial}
                data-filled={datos.regimenMatrimonial.trim().length > 0}
                onChange={(e) => handleChange("regimenMatrimonial", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors duration-150 data-[filled=true]:bg-muted/50 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecciona una opción</option>
                {datos.estadoCivil === "Casado/a" ? (
                  <>
                    <option value="Sociedad Conyugal">
                      Sociedad conyugal (comunidad de bienes)
                    </option>
                    <option value="Participación en los Gananciales">
                      Participación en los gananciales
                    </option>
                    <option value="Separación de Bienes">Separación de bienes</option>
                  </>
                ) : (
                  <>
                    <option value="Comunidad de Bienes">Comunidad de bienes</option>
                    <option value="Separación de Bienes">Separación de bienes</option>
                  </>
                )}
              </select>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={datos.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={datos.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="domicilio">Domicilio</Label>
            <Input
              id="domicilio"
              value={datos.domicilio}
              onChange={(e) => handleChange("domicilio", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="comuna">Comuna</Label>
            <Input
              id="comuna"
              list="comunas-chile"
              placeholder="Escribe para buscar..."
              value={datos.comuna}
              onChange={(e) => handleChange("comuna", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="region">Región</Label>
            <Input
              id="region"
              value={datos.region}
              onChange={(e) => handleChange("region", e.target.value)}
            />
          </div>
        </div>

        {/* Declaración + acción */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmar-datos"
              checked={soloLectura || confirmado}
              onCheckedChange={(checked) => setConfirmado(checked === true)}
              className="mt-1 disabled:opacity-100"
            />
            <Label
              htmlFor="confirmar-datos"
              className="cursor-pointer font-normal leading-relaxed text-slate-700"
            >
              Confirmo que mis datos personales están correctos para redactar mis documentos legales{" "}
              <span className="italic">
                (esta información se guardará y no se volverá a preguntar en otras fichas).
              </span>
            </Label>
          </div>
        </div>
      </fieldset>

      <div className="mt-8 flex justify-between gap-4">
        <Button variant="outline" onClick={onVolver} className="w-full sm:w-auto">
          Volver al portal
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={!soloLectura && botonDeshabilitado}
          className="w-full sm:w-auto"
        >
          {soloLectura
            ? "Continuar"
            : esUltimoPasoFicha
              ? "Enviar ficha"
              : "Confirmar datos y continuar"}
        </Button>
      </div>
    </div>
  );
}
