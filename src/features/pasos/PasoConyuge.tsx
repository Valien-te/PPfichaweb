import { useState } from "react";

import { Button } from "@/shared/components/base/Button";
import { Checkbox } from "@/shared/components/base/Checkbox";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
import { toast } from "@/shared/components/base/Toaster";

import {
  type ConyugeDatos,
  getClienteDatos,
  guardarDatosConyuge,
  useGestion,
} from "../gestiones-store";
import { obtenerModoCapturaTercero } from "./tercero-rules";
import { useValidacionCampos } from "./use-validacion-campos";

interface PasoConyugeProps {
  esUltimoPasoFicha?: boolean;
  soloLectura?: boolean;
  gestionId: string;
  onVolver: () => void;
  onSiguiente: () => void;
}

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

export function PasoConyuge({
  esUltimoPasoFicha = false,
  soloLectura = false,
  gestionId,
  onVolver,
  onSiguiente,
}: PasoConyugeProps) {
  const gestion = useGestion(gestionId);
  const clienteDatos = getClienteDatos();
  const estadoCivilCliente =
    localStorage.getItem("lexy_estadoCivil") ||
    gestion?.clienteEstadoCivil ||
    clienteDatos.estadoCivil ||
    "";
  const regimenCliente =
    localStorage.getItem("lexy_regimenMatrimonial") ||
    gestion?.clienteRegimenMatrimonial ||
    clienteDatos.regimenMatrimonial ||
    "";
  const modoCaptura = obtenerModoCapturaTercero(gestion?.nombre || "");
  const esRenunciaGananciales = gestion?.nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes("renuncia a los gananciales");
  const esConvivienteCivil = estadoCivilCliente === "Acuerdo de Unión Civil";
  const persona = esRenunciaGananciales
    ? "cónyuge o excónyuge"
    : esConvivienteCivil
      ? "conviviente civil"
      : "cónyuge";

  const [datos, setDatos] = useState<ConyugeDatos>(() => ({
    nombres: gestion?.datosConyuge?.nombres || "",
    apellidoPaterno: gestion?.datosConyuge?.apellidoPaterno || "",
    apellidoMaterno: gestion?.datosConyuge?.apellidoMaterno || "",
    rut: gestion?.datosConyuge?.rut || "",
    fechaNacimiento: gestion?.datosConyuge?.fechaNacimiento || "",
    nacionalidad: gestion?.datosConyuge?.nacionalidad || "Chilena",
    profesion: gestion?.datosConyuge?.profesion || "",
    email: gestion?.datosConyuge?.email || "",
    estadoCivil:
      estadoCivilCliente === "Casado/a" || esConvivienteCivil ? estadoCivilCliente : "Casado/a",
    regimenMatrimonial:
      regimenCliente || gestion?.datosConyuge?.regimenMatrimonial || "Sociedad Conyugal",
    domicilio: gestion?.datosConyuge?.domicilio || "",
    comuna: gestion?.datosConyuge?.comuna || "",
    region: gestion?.datosConyuge?.region || "",
  }));
  const [confirmado, setConfirmado] = useState(false);
  const { contenedorRef, mensajesValidacion, validarCampos } = useValidacionCampos();

  function handleChange(campo: keyof ConyugeDatos, valor: string) {
    setDatos((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === "comuna" && COMUNAS_REGIONES[valor]) {
        next.region = COMUNAS_REGIONES[valor];
      }
      return next;
    });
  }

  const camposRequeridos = [
    datos.nombres,
    datos.apellidoPaterno,
    datos.apellidoMaterno,
    datos.rut,
    datos.fechaNacimiento,
    datos.nacionalidad,
    datos.profesion,
    datos.email,
    datos.estadoCivil,
    datos.regimenMatrimonial,
    datos.domicilio,
    datos.comuna,
    datos.region,
  ];
  const formularioValido = camposRequeridos.every((campo) => campo.trim() !== "") && confirmado;

  function handleGuardar() {
    if (soloLectura) {
      onSiguiente();
      return;
    }

    if (!formularioValido) {
      validarCampos();
      return;
    }

    guardarDatosConyuge(gestionId, datos, modoCaptura === "soloConyuge");
    toast.success(`Datos de tu ${persona} guardados`);
    onSiguiente();
  }

  return (
    <div ref={contenedorRef} className="space-y-6">
      <datalist id="comunas-conyuge">
        {COMUNAS.map((comuna) => (
          <option key={comuna} value={comuna} />
        ))}
      </datalist>

      <section className="rounded-xl border border-black/[0.04] bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Datos de tu {persona}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {esRenunciaGananciales
              ? "Necesitamos identificar a la persona vinculada a la sociedad conyugal."
              : "Necesitamos esta información porque también debe comparecer en la escritura."}
          </p>
        </div>

        <fieldset
          disabled={soloLectura}
          className="contents [&_input:disabled]:opacity-100 [&_select:disabled]:opacity-100 [&_textarea:disabled]:opacity-100 [&_[role=combobox]:disabled]:opacity-100"
        >
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-nombres">Nombres</Label>
              <Input
                id="conyuge-nombres"
                value={datos.nombres}
                onChange={(e) => handleChange("nombres", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-paterno">Apellido paterno</Label>
              <Input
                id="conyuge-paterno"
                value={datos.apellidoPaterno}
                onChange={(e) => handleChange("apellidoPaterno", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-materno">Apellido materno</Label>
              <Input
                id="conyuge-materno"
                value={datos.apellidoMaterno}
                onChange={(e) => handleChange("apellidoMaterno", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-rut">RUT</Label>
              <Input
                id="conyuge-rut"
                placeholder="12.345.678-9"
                value={datos.rut}
                onChange={(e) => handleChange("rut", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-fecha-nacimiento">Fecha de nacimiento</Label>
              <Input
                id="conyuge-fecha-nacimiento"
                type="date"
                value={datos.fechaNacimiento}
                onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-nacionalidad">Nacionalidad</Label>
              <Input
                id="conyuge-nacionalidad"
                value={datos.nacionalidad}
                onChange={(e) => handleChange("nacionalidad", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-profesion">Profesión u oficio</Label>
              <Input
                id="conyuge-profesion"
                value={datos.profesion}
                onChange={(e) => handleChange("profesion", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-email">Correo electrónico</Label>
              <Input
                id="conyuge-email"
                type="email"
                placeholder="nombre@example.com"
                value={datos.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-estado-civil">Estado civil</Label>
              <Input
                id="conyuge-estado-civil"
                value={datos.estadoCivil}
                disabled
                className="cursor-not-allowed bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-regimen">Régimen patrimonial</Label>
              <Input
                id="conyuge-regimen"
                value={datos.regimenMatrimonial}
                disabled
                className="cursor-not-allowed bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="conyuge-domicilio">Domicilio</Label>
              <Input
                id="conyuge-domicilio"
                placeholder="Calle, número y departamento"
                value={datos.domicilio}
                onChange={(e) => handleChange("domicilio", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-comuna">Comuna</Label>
              <Input
                id="conyuge-comuna"
                list="comunas-conyuge"
                value={datos.comuna}
                onChange={(e) => handleChange("comuna", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="conyuge-region">Región</Label>
              <Input
                id="conyuge-region"
                value={datos.region}
                onChange={(e) => handleChange("region", e.target.value)}
              />
            </div>
          </div>

          <div
            data-validation-field
            className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmar-datos-conyuge"
                data-validation-required="true"
                checked={confirmado}
                onCheckedChange={(checked) => setConfirmado(checked === true)}
                className="mt-1"
              />
              <Label
                htmlFor="confirmar-datos-conyuge"
                className="cursor-pointer font-normal leading-relaxed text-slate-700"
              >
                Confirmo que los datos de mi {persona} están correctos y actualizados.
              </Label>
            </div>
          </div>
        </fieldset>
      </section>

      {mensajesValidacion}

      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={onVolver} className="w-full sm:w-auto">
          Volver
        </Button>
        {/* La acción permanece habilitada: al presionarla, el hook destaca cada faltante. */}
        <Button onClick={handleGuardar} className="w-full sm:w-auto">
          {soloLectura ? "Continuar" : esUltimoPasoFicha ? "Enviar ficha" : "Guardar y continuar"}
        </Button>
      </div>
    </div>
  );
}
