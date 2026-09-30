import { CircleAlert } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/base/Button";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/base/RadioGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/base/Select";
import { toast } from "@/shared/components/base/Toaster";

import {
  completarUsufructo,
  getClienteDatos,
  useGestion,
  type UsufructuarioDatos,
} from "../gestiones-store";
import { useValidacionCampos } from "./use-validacion-campos";
import {
  obtenerCoincidenciaRutUsufructuario,
  type TitularUsufructo,
  usufructuarioCumpleMayoriaEdad,
} from "./usufructo-rules";

interface PasoUsufructoProps {
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

const DATOS_USUFRUCTUARIO_VACIOS: UsufructuarioDatos = {
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  rut: "",
  email: "",
  fechaNacimiento: "",
  nacionalidad: "Chilena",
  profesion: "",
  estadoCivil: "",
  regimenMatrimonial: "",
  domicilio: "",
  comuna: "",
  region: "",
};

export function PasoUsufructo({
  esUltimoPasoFicha = false,
  soloLectura = false,
  gestionId,
  onVolver,
  onSiguiente,
}: PasoUsufructoProps) {
  const gestion = useGestion(gestionId);
  const cliente = getClienteDatos();
  const { contenedorRef, mensajesValidacion, validarCampos } = useValidacionCampos();
  const [titularUsufructo, setTitularUsufructo] = useState<TitularUsufructo | "">(
    gestion?.titularUsufructo ?? "",
  );
  const [datos, setDatos] = useState<UsufructuarioDatos>(() => ({
    ...DATOS_USUFRUCTUARIO_VACIOS,
    ...gestion?.datosUsufructuario,
  }));

  const coincidenciaRut = obtenerCoincidenciaRutUsufructuario(
    datos.rut,
    cliente.rut,
    gestion?.datosTercero?.rut ?? "",
  );
  const fechaInvalida =
    Boolean(datos.fechaNacimiento) && !usufructuarioCumpleMayoriaEdad(datos.fechaNacimiento);
  const requiereRegimen =
    datos.estadoCivil === "Casado/a" || datos.estadoCivil === "Acuerdo de Unión Civil";

  function handleChange(campo: keyof UsufructuarioDatos, valor: string) {
    setDatos((actuales) => {
      const siguientes = { ...actuales, [campo]: valor };
      if (campo === "estadoCivil" && valor !== "Casado/a" && valor !== "Acuerdo de Unión Civil") {
        siguientes.regimenMatrimonial = "";
      }
      if (campo === "comuna" && COMUNAS_REGIONES[valor]) {
        siguientes.region = COMUNAS_REGIONES[valor];
      }
      return siguientes;
    });
  }

  function enfocarCampo(id: string) {
    requestAnimationFrame(() => {
      const campo = document.getElementById(id);
      campo?.focus({ preventScroll: true });
      campo?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function handleGuardar() {
    if (soloLectura) {
      onSiguiente();
      return;
    }

    if (!validarCampos() || !titularUsufructo) return;

    if (titularUsufructo === "otraPersona") {
      if (fechaInvalida) {
        toast.error("La persona usufructuaria debe tener 18 años o más.");
        enfocarCampo("usufructuario-fechaNacimiento");
        return;
      }
      if (coincidenciaRut) {
        toast.error(
          coincidenciaRut === "cliente"
            ? "Si tú tendrás el usufructo, selecciona esa opción para continuar."
            : "La persona usufructuaria debe ser distinta de tu tercero de confianza.",
        );
        enfocarCampo("usufructuario-rut");
        return;
      }
    }

    const guardado = completarUsufructo(
      gestionId,
      titularUsufructo,
      titularUsufructo === "otraPersona" ? datos : undefined,
    );
    if (!guardado) {
      toast.error("Revisa los datos de la persona usufructuaria para continuar.");
      return;
    }

    toast.success("Datos del usufructo guardados");
    onSiguiente();
  }

  return (
    <div ref={contenedorRef} className="space-y-6">
      <datalist id="comunas-usufructuario">
        {Object.keys(COMUNAS_REGIONES).map((comuna) => (
          <option key={comuna} value={comuna} />
        ))}
      </datalist>

      <section className="rounded-xl border border-black/[0.04] bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Persona usufructuaria</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            La persona usufructuaria es quien podrá usar el inmueble y recibir sus beneficios,
            aunque la propiedad quede a nombre de otra persona.
          </p>
        </div>

        <fieldset
          disabled={soloLectura}
          className="contents [&_input:disabled]:opacity-100 [&_[role=combobox]:disabled]:opacity-100"
        >
          <fieldset>
            <legend className="text-sm font-medium text-slate-800">
              ¿Quién tendrá el usufructo?
            </legend>
            <RadioGroup
              id="titular-usufructo"
              value={titularUsufructo}
              onValueChange={(valor) => setTitularUsufructo(valor as TitularUsufructo)}
              className="mt-3 gap-3 sm:grid sm:grid-cols-2"
            >
              <Label
                htmlFor="usufructo-cliente"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors ${
                  titularUsufructo === "cliente"
                    ? "border-primary bg-primary/[0.04]"
                    : "border-slate-200 hover:border-primary/50"
                }`}
              >
                <RadioGroupItem id="usufructo-cliente" value="cliente" className="mt-0.5" />
                <span>
                  <span className="block font-medium text-slate-800">Yo tendré el usufructo</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                    El usufructo quedará a tu nombre.
                  </span>
                </span>
              </Label>
              <Label
                htmlFor="usufructo-otra-persona"
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors ${
                  titularUsufructo === "otraPersona"
                    ? "border-primary bg-primary/[0.04]"
                    : "border-slate-200 hover:border-primary/50"
                }`}
              >
                <RadioGroupItem
                  id="usufructo-otra-persona"
                  value="otraPersona"
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-medium text-slate-800">
                    Otra persona tendrá el usufructo
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                    Necesitaremos sus datos para incluirla en la escritura.
                  </span>
                </span>
              </Label>
            </RadioGroup>
          </fieldset>

          {titularUsufructo === "otraPersona" && (
            <section
              className="mt-8 border-t border-slate-100 pt-6"
              aria-labelledby="datos-usufructuario-titulo"
            >
              <div className="mb-5">
                <h3
                  id="datos-usufructuario-titulo"
                  className="text-base font-semibold text-slate-800"
                >
                  Datos de la persona usufructuaria
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Completa los datos de la persona que tendrá el derecho a usar el inmueble y
                  recibir sus beneficios.
                </p>
              </div>

              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-nombres">Nombres</Label>
                  <Input
                    id="usufructuario-nombres"
                    value={datos.nombres}
                    onChange={(e) => handleChange("nombres", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-apellidoPaterno">Apellido paterno</Label>
                  <Input
                    id="usufructuario-apellidoPaterno"
                    value={datos.apellidoPaterno}
                    onChange={(e) => handleChange("apellidoPaterno", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-apellidoMaterno">Apellido materno</Label>
                  <Input
                    id="usufructuario-apellidoMaterno"
                    value={datos.apellidoMaterno}
                    onChange={(e) => handleChange("apellidoMaterno", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-rut">RUT</Label>
                  <Input
                    id="usufructuario-rut"
                    data-validation-preserve-aria-invalid="true"
                    placeholder="Ej: 11.222.333-4"
                    value={datos.rut}
                    onChange={(e) => handleChange("rut", e.target.value)}
                    aria-invalid={Boolean(coincidenciaRut)}
                    aria-describedby={coincidenciaRut ? "usufructuario-rut-error" : undefined}
                  />
                  {coincidenciaRut && (
                    <p
                      id="usufructuario-rut-error"
                      role="alert"
                      className="flex items-start gap-2 text-sm leading-relaxed text-red-700 sm:col-span-2"
                    >
                      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span>
                        {coincidenciaRut === "cliente"
                          ? "Este RUT corresponde a tus datos. Si tú tendrás el usufructo, selecciona “Yo tendré el usufructo”."
                          : "La persona usufructuaria debe ser distinta de tu tercero de confianza. Ingresa el RUT de otra persona."}
                      </span>
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-fechaNacimiento">Fecha de nacimiento</Label>
                  <Input
                    id="usufructuario-fechaNacimiento"
                    data-validation-preserve-aria-invalid="true"
                    type="date"
                    value={datos.fechaNacimiento}
                    onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
                    aria-invalid={fechaInvalida}
                    aria-describedby={fechaInvalida ? "usufructuario-edad-error" : undefined}
                  />
                  {fechaInvalida && (
                    <p
                      id="usufructuario-edad-error"
                      role="alert"
                      className="text-sm leading-relaxed text-red-700"
                    >
                      La persona usufructuaria debe tener 18 años o más.
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-nacionalidad">Nacionalidad</Label>
                  <Input
                    id="usufructuario-nacionalidad"
                    value={datos.nacionalidad}
                    onChange={(e) => handleChange("nacionalidad", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-profesion">Profesión u oficio</Label>
                  <Input
                    id="usufructuario-profesion"
                    value={datos.profesion}
                    onChange={(e) => handleChange("profesion", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-email">Correo electrónico</Label>
                  <Input
                    id="usufructuario-email"
                    type="email"
                    placeholder="nombre@example.com"
                    value={datos.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-estadoCivil">Estado civil</Label>
                  <Select
                    value={datos.estadoCivil}
                    onValueChange={(valor) => handleChange("estadoCivil", valor)}
                  >
                    <SelectTrigger id="usufructuario-estadoCivil">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                      <SelectItem value="Casado/a">Casado/a</SelectItem>
                      <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                      <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                      <SelectItem value="Acuerdo de Unión Civil">Acuerdo de Unión Civil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {requiereRegimen && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="usufructuario-regimenMatrimonial">Régimen patrimonial</Label>
                    <Select
                      value={datos.regimenMatrimonial}
                      onValueChange={(valor) => handleChange("regimenMatrimonial", valor)}
                    >
                      <SelectTrigger id="usufructuario-regimenMatrimonial">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {datos.estadoCivil === "Casado/a" ? (
                          <>
                            <SelectItem value="Sociedad conyugal (comunidad de bienes)">
                              Sociedad conyugal (comunidad de bienes)
                            </SelectItem>
                            <SelectItem value="Participación en los gananciales">
                              Participación en los gananciales
                            </SelectItem>
                            <SelectItem value="Separación de bienes">
                              Separación de bienes
                            </SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Comunidad de bienes">Comunidad de bienes</SelectItem>
                            <SelectItem value="Separación de bienes">
                              Separación de bienes
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="usufructuario-domicilio">Domicilio</Label>
                  <Input
                    id="usufructuario-domicilio"
                    placeholder="Calle, número y departamento"
                    value={datos.domicilio}
                    onChange={(e) => handleChange("domicilio", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-comuna">Comuna</Label>
                  <Input
                    id="usufructuario-comuna"
                    list="comunas-usufructuario"
                    placeholder="Escribe para buscar..."
                    value={datos.comuna}
                    onChange={(e) => handleChange("comuna", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="usufructuario-region">Región</Label>
                  <Input
                    id="usufructuario-region"
                    value={datos.region}
                    onChange={(e) => handleChange("region", e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}
        </fieldset>
      </section>

      {mensajesValidacion}

      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={onVolver} className="w-full sm:w-auto">
          Volver
        </Button>
        <Button onClick={handleGuardar} className="w-full sm:w-auto">
          {soloLectura ? "Continuar" : esUltimoPasoFicha ? "Enviar ficha" : "Guardar y continuar"}
        </Button>
      </div>
    </div>
  );
}
