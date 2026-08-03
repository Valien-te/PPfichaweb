import { CircleAlert, CircleHelp, ShieldCheck, TriangleAlert } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Badge } from "@/shared/components/base/Badge";
import { Button } from "@/shared/components/base/Button";
import { Checkbox } from "@/shared/components/base/Checkbox";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/base/Popover";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/base/Tooltip";

import {
  completarSegundoSocio,
  completarTercero,
  getClienteDatos,
  sincronizarMandatoFirma,
  useGestion,
  useGestiones,
} from "../gestiones-store";
import { resolverReglaTerceroCesionHereditaria } from "./cesion-hereditaria-tercero-rules";
import {
  obtenerCoincidenciaApoderado,
  requierenDefinirFirmaConjunta,
  type TipoMandatoFirma,
} from "./firma-mandato-rules";
import { correspondenALaMismaPersona } from "./persona-rut-rules";
import { evaluarLimiteTerceroInmobiliario } from "./tercero-inmobiliario-rules";
import {
  calcularEdad,
  debeEvaluarFacultadesMentales,
  evaluarRiesgoTercero,
  requiereCertificadoFacultadesMentales,
} from "./tercero-risk-rules";
import {
  debeSolicitarConyugeTercero,
  obtenerModoCapturaTercero,
  requiereDatosAdministradorSociedad,
} from "./tercero-rules";

interface PasoTerceroProps {
  esUltimoPasoFicha?: boolean;
  soloLectura?: boolean;
  gestionId: string;
  onVolver: () => void;
  onSiguiente: () => void;
}

interface AyudaCampoProps {
  label: string;
  children: ReactNode;
}

function AyudaCampo({ label, children }: AyudaCampoProps) {
  return (
    <>
      <span className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Ayuda sobre ${label}`}
              className="relative inline-flex size-6 items-center justify-center rounded-full text-slate-500 transition-colors before:absolute before:-inset-2.5 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <CircleHelp className="size-4" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[min(18rem,calc(100vw-2rem))] p-3 text-sm leading-relaxed"
          >
            {children}
          </PopoverContent>
        </Popover>
      </span>
      <span className="hidden sm:inline-flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`Ayuda sobre ${label}`}
              className="relative inline-flex size-6 items-center justify-center rounded-full text-slate-500 transition-colors before:absolute before:-inset-2.5 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <CircleHelp className="size-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8} className="max-w-72 px-3 py-2 text-sm leading-relaxed">
            {children}
          </TooltipContent>
        </Tooltip>
      </span>
    </>
  );
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

const OPCIONES_RELACION = [
  { value: "hijo", label: "Hijo/a" },
  { value: "padreMadre", label: "Padre o madre" },
  { value: "hermano", label: "Hermano/a" },
  { value: "amigo", label: "Amigo/a" },
  { value: "pareja", label: "Pareja" },
  { value: "socio", label: "Socio/a" },
  { value: "otro", label: "Otro" },
];

interface PersonaMandatoFormulario {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  email: string;
  fechaNacimiento: string;
  nacionalidad: string;
  profesion: string;
  estadoCivil: string;
  regimenMatrimonial: string;
  domicilio: string;
  comuna: string;
  region: string;
}

interface CamposPersonaMandatoProps {
  idPrefix: string;
  persona: PersonaMandatoFormulario;
  onChange: (campo: string, valor: string) => void;
}

function CamposPersonaMandato({ idPrefix, persona, onChange }: CamposPersonaMandatoProps) {
  const camposTexto = [
    { key: "nombres", label: "Nombres", placeholder: "Nombres" },
    { key: "apellidoPaterno", label: "Apellido paterno", placeholder: "Apellido paterno" },
    { key: "apellidoMaterno", label: "Apellido materno", placeholder: "Apellido materno" },
    { key: "rut", label: "RUT", placeholder: "Ej: 11.222.333-4" },
    { key: "fechaNacimiento", label: "Fecha de nacimiento", placeholder: "", type: "date" },
    { key: "nacionalidad", label: "Nacionalidad", placeholder: "Ej: Chilena" },
    { key: "profesion", label: "Profesión u oficio", placeholder: "Ej: Abogado" },
    { key: "email", label: "Email", placeholder: "persona@ejemplo.com", type: "email" },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {camposTexto.map((campo) => (
        <div key={campo.key} className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-${campo.key}`}>{campo.label}</Label>
          <Input
            id={`${idPrefix}-${campo.key}`}
            type={"type" in campo ? campo.type : "text"}
            placeholder={campo.placeholder}
            value={persona[campo.key]}
            onChange={(event) => onChange(campo.key, event.target.value)}
          />
        </div>
      ))}

      <div className="grid gap-1.5">
        <Label htmlFor={`${idPrefix}-estadoCivil`}>Estado civil</Label>
        <Select
          value={persona.estadoCivil}
          onValueChange={(valor) => onChange("estadoCivil", valor)}
        >
          <SelectTrigger id={`${idPrefix}-estadoCivil`}>
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

      {(persona.estadoCivil === "Casado/a" || persona.estadoCivil === "Acuerdo de Unión Civil") && (
        <div className="grid gap-1.5">
          <Label htmlFor={`${idPrefix}-regimenMatrimonial`}>Régimen patrimonial</Label>
          <Select
            value={persona.regimenMatrimonial}
            onValueChange={(valor) => onChange("regimenMatrimonial", valor)}
          >
            <SelectTrigger id={`${idPrefix}-regimenMatrimonial`}>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {persona.estadoCivil === "Casado/a" ? (
                <>
                  <SelectItem value="Sociedad conyugal (comunidad de bienes)">
                    Sociedad conyugal (comunidad de bienes)
                  </SelectItem>
                  <SelectItem value="Participación en los gananciales">
                    Participación en los gananciales
                  </SelectItem>
                  <SelectItem value="Separación de bienes">Separación de bienes</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="Comunidad de bienes">Comunidad de bienes</SelectItem>
                  <SelectItem value="Separación de bienes">Separación de bienes</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-domicilio`}>Domicilio</Label>
        <Input
          id={`${idPrefix}-domicilio`}
          placeholder="Calle, número, depto."
          value={persona.domicilio}
          onChange={(event) => onChange("domicilio", event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${idPrefix}-comuna`}>Comuna</Label>
        <Input
          id={`${idPrefix}-comuna`}
          list="comunas-chile"
          placeholder="Escribe para buscar..."
          value={persona.comuna}
          onChange={(event) => onChange("comuna", event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${idPrefix}-region`}>Región</Label>
        <Input
          id={`${idPrefix}-region`}
          placeholder="Región"
          value={persona.region}
          onChange={(event) => onChange("region", event.target.value)}
        />
      </div>
    </div>
  );
}

export function PasoTercero({
  esUltimoPasoFicha = false,
  soloLectura = false,
  gestionId,
  onVolver,
  onSiguiente,
}: PasoTerceroProps) {
  const gestion = useGestion(gestionId);
  const gestiones = useGestiones();
  const gestionOrigen = useGestion(gestion?.gestionOrigenId ?? "__sin-gestion-origen__");
  const clienteDatos = getClienteDatos();
  const nombreContrato = gestion?.nombre || "";
  const tipoSociedad =
    typeof gestion?.valoresEspecificos?.tipoSociedad === "string"
      ? gestion.valoresEspecificos.tipoSociedad
      : "";

  // Leer estado civil y régimen desde localStorage (la fuente más confiable entre navegaciones)
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

  const normalizar = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const esCesionDerechosHereditarios = normalizar(nombreContrato).includes(
    "cesion de derechos hereditarios",
  );
  // La regla se deriva de todas las comunas y aplica la restricción más estricta.
  const reglaTerceroCesionHereditaria = resolverReglaTerceroCesionHereditaria(
    gestion?.valoresEspecificos?.inmueblesHeredados,
  );
  const comunasCesionHereditaria = reglaTerceroCesionHereditaria.detalles.map(
    (detalle) => detalle.comuna,
  );
  const comunasCesionHereditariaTexto = new Intl.ListFormat("es-CL", {
    style: "long",
    type: "conjunction",
  }).format(comunasCesionHereditaria);
  const referenciaComunasCesion = comunasCesionHereditariaTexto
    ? `${comunasCesionHereditaria.length > 1 ? "en las comunas de" : "en la comuna de"} ${comunasCesionHereditariaTexto}`
    : "en la comuna del inmueble";

  const modoCapturaTercero = obtenerModoCapturaTercero(nombreContrato);
  const esConyugeContrato = () => modoCapturaTercero === "soloConyuge";
  const esSegundoSocio = modoCapturaTercero === "segundoSocio";
  const esMandatoGeneral = normalizar(nombreContrato).trim() === "mandato";
  const esMandatoAutocontrato = normalizar(nombreContrato).trim() === "mandato con autocontrato";
  const datosTerceroOrigen = gestionOrigen?.datosTercero;
  const datosParteAutocontrato = gestion?.datosTercero ?? datosTerceroOrigen;
  const autocontratoPrecargado =
    esMandatoAutocontrato &&
    Boolean(
      datosParteAutocontrato?.nombres &&
      datosParteAutocontrato.apellidoPaterno &&
      datosParteAutocontrato.rut,
    );
  const administradorSociedad =
    typeof gestion?.valoresEspecificos?.administradorSociedad === "string"
      ? gestion.valoresEspecificos.administradorSociedad
      : "";
  const requiereDatosAdministrador =
    esSegundoSocio && requiereDatosAdministradorSociedad(tipoSociedad, administradorSociedad);
  const esRepresentanteSociedadAnonima = tipoSociedad === "sa";
  const esResciliacion = () => normalizar(nombreContrato).includes("resciliacion");

  const esCompraventaOCesionOAcciones = () => {
    const norm = normalizar(nombreContrato);
    return (
      norm.includes("compraventa") ||
      norm.includes("cesion") ||
      norm.includes("aporte srl") ||
      norm.includes("acciones") ||
      norm.includes("hereditarios") ||
      norm.includes("transferencia")
    );
  };

  // State del Tercero
  const [tercero, setTercero] = useState(() => {
    const datosGuardados =
      gestion?.datosTercero ?? (esMandatoAutocontrato ? datosTerceroOrigen : undefined);
    return {
      nombres: datosGuardados?.nombres ?? "",
      apellidoPaterno: datosGuardados?.apellidoPaterno ?? "",
      apellidoMaterno: datosGuardados?.apellidoMaterno ?? "",
      rut: datosGuardados?.rut ?? "",
      email: datosGuardados?.email ?? "",
      fechaNacimiento: datosGuardados?.fechaNacimiento ?? "",
      nacionalidad: datosGuardados?.nacionalidad ?? "Chilena",
      profesion: datosGuardados?.profesion ?? "",
      estadoCivil: datosGuardados?.estadoCivil ?? "Soltero/a",
      regimenMatrimonial: datosGuardados?.regimenMatrimonial ?? "",
      domicilio: datosGuardados?.domicilio ?? "",
      comuna: datosGuardados?.comuna ?? "",
      region: datosGuardados?.region ?? "",
      relacion: datosGuardados?.relacion ?? "",
      vinculoComunidadHereditaria: datosGuardados?.vinculoComunidadHereditaria ?? "",
      plenamenteCapaz: datosGuardados?.plenamenteCapaz ?? "",
      ingresosEstables: datosGuardados?.ingresosEstables ?? "",
      disponibilidadFirmaConjunta: datosGuardados?.disponibilidadFirmaConjunta ?? "",
      tipoMandatoFirma: datosGuardados?.tipoMandatoFirma ?? "",
      otorganteMandato: datosGuardados?.otorganteMandato ?? "",
      sentidoAutocontrato: datosGuardados?.sentidoAutocontrato ?? "",
      cantidadAccionesSocio: "",
      porcentajeDerechosSociales: "",
    };
  });

  const [otorganteMandato, setOtorganteMandato] = useState(() => ({
    nombres: gestion?.datosOtorganteMandato?.nombres ?? "",
    apellidoPaterno: gestion?.datosOtorganteMandato?.apellidoPaterno ?? "",
    apellidoMaterno: gestion?.datosOtorganteMandato?.apellidoMaterno ?? "",
    rut: gestion?.datosOtorganteMandato?.rut ?? "",
    email: gestion?.datosOtorganteMandato?.email ?? "",
    fechaNacimiento: gestion?.datosOtorganteMandato?.fechaNacimiento ?? "",
    nacionalidad: gestion?.datosOtorganteMandato?.nacionalidad ?? "Chilena",
    profesion: gestion?.datosOtorganteMandato?.profesion ?? "",
    estadoCivil: gestion?.datosOtorganteMandato?.estadoCivil ?? "Soltero/a",
    regimenMatrimonial: gestion?.datosOtorganteMandato?.regimenMatrimonial ?? "",
    domicilio: gestion?.datosOtorganteMandato?.domicilio ?? "",
    comuna: gestion?.datosOtorganteMandato?.comuna ?? "",
    region: gestion?.datosOtorganteMandato?.region ?? "",
  }));
  const rutOtraParteMandato =
    datosTerceroOrigen?.rut ?? (tercero.otorganteMandato === "tercero" ? otorganteMandato.rut : "");
  const coincidenciaApoderado = esMandatoGeneral
    ? obtenerCoincidenciaApoderado(tercero.rut, clienteDatos.rut, rutOtraParteMandato)
    : undefined;
  // Esta prohibición es transversal: cambiar el formato del RUT no puede hacer
  // que la persona contratante aparezca como tercero, contraparte o apoderado.
  const terceroEsCliente = correspondenALaMismaPersona(tercero.rut, clienteDatos.rut);

  const [administrador, setAdministrador] = useState(() => ({
    nombres: gestion?.datosAdministradorSociedad?.nombres ?? "",
    apellidoPaterno: gestion?.datosAdministradorSociedad?.apellidoPaterno ?? "",
    apellidoMaterno: gestion?.datosAdministradorSociedad?.apellidoMaterno ?? "",
    rut: gestion?.datosAdministradorSociedad?.rut ?? "",
    email: gestion?.datosAdministradorSociedad?.email ?? "",
    fechaNacimiento: gestion?.datosAdministradorSociedad?.fechaNacimiento ?? "",
    nacionalidad: gestion?.datosAdministradorSociedad?.nacionalidad ?? "Chilena",
    profesion: gestion?.datosAdministradorSociedad?.profesion ?? "",
    estadoCivil: gestion?.datosAdministradorSociedad?.estadoCivil ?? "Soltero/a",
    regimenMatrimonial: gestion?.datosAdministradorSociedad?.regimenMatrimonial ?? "",
    domicilio: gestion?.datosAdministradorSociedad?.domicilio ?? "",
    comuna: gestion?.datosAdministradorSociedad?.comuna ?? "",
    region: gestion?.datosAdministradorSociedad?.region ?? "",
  }));

  // State del Cónyuge (si corresponde)
  const [conyuge, setConyuge] = useState(() => {
    const datosGuardados = esConyugeContrato()
      ? gestion?.datosConyuge
      : gestion?.datosConyugeTercero;
    const ec = esConyugeContrato() ? estadoCivilCliente : tercero.estadoCivil;
    const defaultEstadoCivil =
      ec === "Casado/a" || ec === "Acuerdo de Unión Civil" ? ec : "Casado/a";
    const defaultRegimen = esConyugeContrato()
      ? regimenCliente || "Sociedad conyugal (comunidad de bienes)"
      : tercero.regimenMatrimonial;
    return {
      nombres: datosGuardados?.nombres ?? "",
      apellidoPaterno: datosGuardados?.apellidoPaterno ?? "",
      apellidoMaterno: datosGuardados?.apellidoMaterno ?? "",
      rut: datosGuardados?.rut ?? "",
      email: datosGuardados?.email ?? "",
      fechaNacimiento: datosGuardados?.fechaNacimiento ?? "",
      nacionalidad: datosGuardados?.nacionalidad ?? "Chilena",
      profesion: datosGuardados?.profesion ?? "",
      estadoCivil: datosGuardados?.estadoCivil ?? defaultEstadoCivil,
      regimenMatrimonial: datosGuardados?.regimenMatrimonial ?? defaultRegimen,
      domicilio: datosGuardados?.domicilio ?? "",
      comuna: datosGuardados?.comuna ?? "",
      region: datosGuardados?.region ?? "",
    };
  });

  const [aceptaRiesgos, setAceptaRiesgos] = useState(false);

  // La regla se calcula con todas las escrituras del cliente y excluye la gestión
  // actual. Los mandatos y la liquidación de sociedad conyugal no entran al conteo.
  const limiteTerceroInmobiliario = evaluarLimiteTerceroInmobiliario(
    gestiones,
    gestionId,
    nombreContrato,
    tercero.rut,
  );

  const edadSegundoSocio = esSegundoSocio ? calcularEdad(tercero.fechaNacimiento) : null;
  const segundoSocioMenorEdad = edadSegundoSocio !== null && edadSegundoSocio < 18;
  const edadAdministrador = requiereDatosAdministrador
    ? calcularEdad(administrador.fechaNacimiento)
    : null;
  const administradorMenorEdad = edadAdministrador !== null && edadAdministrador < 18;
  const participacionSegundoSocioValida =
    !esSegundoSocio ||
    ((tipoSociedad === "spa" || tipoSociedad === "sa") &&
      Number(tercero.cantidadAccionesSocio) > 0) ||
    (tipoSociedad === "limitada" &&
      Number(tercero.porcentajeDerechosSociales) > 0 &&
      Number(tercero.porcentajeDerechosSociales) <= 100);
  const debePreguntarFacultadesMentales = debeEvaluarFacultadesMentales(tercero.fechaNacimiento);
  const requiereCertificadoMedico = requiereCertificadoFacultadesMentales(tercero.fechaNacimiento);
  const evaluacionRiesgo = evaluarRiesgoTercero(tercero);
  const evaluacionCompleta =
    esCompraventaOCesionOAcciones() &&
    Boolean(
      tercero.fechaNacimiento &&
      tercero.relacion &&
      tercero.ingresosEstables &&
      (!debePreguntarFacultadesMentales || tercero.plenamenteCapaz),
    );
  const transferenciaBloqueada = evaluacionRiesgo.impedimentos.length > 0;
  const requiereAceptarRiesgos = evaluacionCompleta && evaluacionRiesgo.senales.length > 0;
  const requiereDefinirFirmaConjunta = requierenDefinirFirmaConjunta(
    clienteDatos.region,
    tercero.region,
    nombreContrato,
  );
  const debePedirConyuge = () =>
    debeSolicitarConyugeTercero(nombreContrato, tercero.estadoCivil, tercero.regimenMatrimonial);

  const handleTerceroChange = (campo: string, valor: string) => {
    if (["fechaNacimiento", "relacion", "plenamenteCapaz", "ingresosEstables"].includes(campo)) {
      setAceptaRiesgos(false);
    }
    if (campo === "estadoCivil") {
      setConyuge((prev) => ({
        ...prev,
        estadoCivil: valor,
        regimenMatrimonial:
          valor === "Casado/a" || valor === "Acuerdo de Unión Civil" ? prev.regimenMatrimonial : "",
      }));
    }
    if (campo === "regimenMatrimonial") {
      setConyuge((prev) => ({ ...prev, regimenMatrimonial: valor }));
    }
    setTercero((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === "fechaNacimiento" && !debeEvaluarFacultadesMentales(valor)) {
        next.plenamenteCapaz = "";
      }
      if (campo === "estadoCivil" && valor !== "Casado/a" && valor !== "Acuerdo de Unión Civil") {
        next.regimenMatrimonial = "";
      }
      if (campo === "comuna" && COMUNAS_REGIONES[valor]) {
        next.region = COMUNAS_REGIONES[valor];
      }
      if (campo === "comuna" || campo === "region") {
        next.disponibilidadFirmaConjunta = "";
        next.tipoMandatoFirma = "";
      }
      if (campo === "disponibilidadFirmaConjunta" && valor === "si") {
        next.tipoMandatoFirma = "";
      }
      return next;
    });
  };

  const handleConyugeChange = (campo: string, valor: string) => {
    setConyuge((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === "estadoCivil" && valor !== "Casado/a" && valor !== "Acuerdo de Unión Civil") {
        next.regimenMatrimonial = "";
      }
      if (campo === "comuna" && COMUNAS_REGIONES[valor]) {
        next.region = COMUNAS_REGIONES[valor];
      }
      return next;
    });
  };

  const handleOtorganteMandatoChange = (campo: string, valor: string) => {
    setOtorganteMandato((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === "estadoCivil" && valor !== "Casado/a" && valor !== "Acuerdo de Unión Civil") {
        next.regimenMatrimonial = "";
      }
      if (campo === "comuna" && COMUNAS_REGIONES[valor]) {
        next.region = COMUNAS_REGIONES[valor];
      }
      return next;
    });
  };

  const handleAdministradorChange = (campo: string, valor: string) => {
    setAdministrador((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === "estadoCivil" && valor !== "Casado/a" && valor !== "Acuerdo de Unión Civil") {
        next.regimenMatrimonial = "";
      }
      if (campo === "comuna" && COMUNAS_REGIONES[valor]) {
        next.region = COMUNAS_REGIONES[valor];
      }
      return next;
    });
  };

  const isFormValido = () => {
    const tieneValor = (val: unknown) =>
      val !== undefined && val !== null && String(val).trim() !== "";
    const personaCompleta = (persona: typeof otorganteMandato) => {
      const datosCompletos =
        tieneValor(persona.nombres) &&
        tieneValor(persona.apellidoPaterno) &&
        tieneValor(persona.apellidoMaterno) &&
        tieneValor(persona.rut) &&
        tieneValor(persona.email) &&
        tieneValor(persona.fechaNacimiento) &&
        tieneValor(persona.nacionalidad) &&
        tieneValor(persona.profesion) &&
        tieneValor(persona.estadoCivil) &&
        tieneValor(persona.domicilio) &&
        tieneValor(persona.comuna) &&
        tieneValor(persona.region);
      const regimenRequerido =
        persona.estadoCivil === "Casado/a" || persona.estadoCivil === "Acuerdo de Unión Civil";

      return datosCompletos && (!regimenRequerido || tieneValor(persona.regimenMatrimonial));
    };

    if (esMandatoAutocontrato) {
      return (
        !terceroEsCliente &&
        personaCompleta(tercero) &&
        tieneValor(tercero.sentidoAutocontrato)
      );
    }

    if (esMandatoGeneral) {
      if (
        !personaCompleta(tercero) ||
        !tieneValor(tercero.otorganteMandato) ||
        coincidenciaApoderado
      ) {
        return false;
      }
      if (
        tercero.otorganteMandato === "tercero" &&
        !datosTerceroOrigen &&
        !personaCompleta(otorganteMandato)
      ) {
        return false;
      }
      return true;
    }

    if (esConyugeContrato()) {
      const cValido =
        tieneValor(conyuge.nombres) &&
        tieneValor(conyuge.apellidoPaterno) &&
        tieneValor(conyuge.apellidoMaterno) &&
        tieneValor(conyuge.rut) &&
        tieneValor(conyuge.email) &&
        tieneValor(conyuge.fechaNacimiento) &&
        tieneValor(conyuge.nacionalidad) &&
        tieneValor(conyuge.profesion) &&
        tieneValor(conyuge.estadoCivil) &&
        tieneValor(conyuge.domicilio) &&
        tieneValor(conyuge.comuna) &&
        tieneValor(conyuge.region);

      const cRegimenRequerido =
        conyuge.estadoCivil === "Casado/a" || conyuge.estadoCivil === "Acuerdo de Unión Civil";
      const cRegimenValido = !cRegimenRequerido || tieneValor(conyuge.regimenMatrimonial);

      return cValido && cRegimenValido;
    }

    const tValido =
      tieneValor(tercero.nombres) &&
      tieneValor(tercero.apellidoPaterno) &&
      tieneValor(tercero.apellidoMaterno) &&
      tieneValor(tercero.rut) &&
      tieneValor(tercero.email) &&
      tieneValor(tercero.fechaNacimiento) &&
      tieneValor(tercero.nacionalidad) &&
      tieneValor(tercero.profesion) &&
      tieneValor(tercero.estadoCivil) &&
      tieneValor(tercero.domicilio) &&
      tieneValor(tercero.comuna) &&
      tieneValor(tercero.region);

    const tRegimenRequerido =
      tercero.estadoCivil === "Casado/a" || tercero.estadoCivil === "Acuerdo de Unión Civil";
    const tRegimenValido = !tRegimenRequerido || tieneValor(tercero.regimenMatrimonial);

    if (!tValido || !tRegimenValido) return false;
    if (terceroEsCliente) return false;
    if (limiteTerceroInmobiliario.estado === "limiteAlcanzado") return false;
    if (esCesionDerechosHereditarios) {
      // La relación con la herencia siempre debe declararse; una comuna restrictiva
      // impide continuar si la persona elegida no es también heredera.
      if (!tieneValor(tercero.vinculoComunidadHereditaria)) return false;
      if (
        reglaTerceroCesionHereditaria.regla === "soloComunero" &&
        tercero.vinculoComunidadHereditaria !== "comunero"
      ) {
        return false;
      }
    }
    if (segundoSocioMenorEdad) return false;
    if (!participacionSegundoSocioValida) return false;

    if (requiereDatosAdministrador) {
      const administradorValido =
        tieneValor(administrador.nombres) &&
        tieneValor(administrador.apellidoPaterno) &&
        tieneValor(administrador.apellidoMaterno) &&
        tieneValor(administrador.rut) &&
        tieneValor(administrador.email) &&
        tieneValor(administrador.fechaNacimiento) &&
        tieneValor(administrador.nacionalidad) &&
        tieneValor(administrador.profesion) &&
        tieneValor(administrador.estadoCivil) &&
        tieneValor(administrador.domicilio) &&
        tieneValor(administrador.comuna) &&
        tieneValor(administrador.region);
      const regimenAdministradorRequerido =
        administrador.estadoCivil === "Casado/a" ||
        administrador.estadoCivil === "Acuerdo de Unión Civil";
      const regimenAdministradorValido =
        !regimenAdministradorRequerido || tieneValor(administrador.regimenMatrimonial);

      if (!administradorValido || !regimenAdministradorValido || administradorMenorEdad) {
        return false;
      }
    }

    if (requiereDefinirFirmaConjunta) {
      if (!tieneValor(tercero.disponibilidadFirmaConjunta)) return false;
      if (tercero.disponibilidadFirmaConjunta === "no" && !tieneValor(tercero.tipoMandatoFirma)) {
        return false;
      }
    }

    if (esCompraventaOCesionOAcciones()) {
      if (
        !tieneValor(tercero.relacion) ||
        !tieneValor(tercero.ingresosEstables) ||
        (debePreguntarFacultadesMentales && !tieneValor(tercero.plenamenteCapaz))
      ) {
        return false;
      }
      if (transferenciaBloqueada) return false;
      if (requiereAceptarRiesgos && !aceptaRiesgos) return false;
    }

    if (debePedirConyuge()) {
      const cValido =
        tieneValor(conyuge.nombres) &&
        tieneValor(conyuge.apellidoPaterno) &&
        tieneValor(conyuge.apellidoMaterno) &&
        tieneValor(conyuge.rut) &&
        tieneValor(conyuge.email) &&
        tieneValor(conyuge.fechaNacimiento) &&
        tieneValor(conyuge.nacionalidad) &&
        tieneValor(conyuge.profesion) &&
        tieneValor(conyuge.estadoCivil) &&
        tieneValor(conyuge.domicilio) &&
        tieneValor(conyuge.comuna) &&
        tieneValor(conyuge.region);

      const cRegimenRequerido =
        conyuge.estadoCivil === "Casado/a" || conyuge.estadoCivil === "Acuerdo de Unión Civil";
      const cRegimenValido = !cRegimenRequerido || tieneValor(conyuge.regimenMatrimonial);

      if (!cValido || !cRegimenValido) return false;
    }

    return true;
  };

  function handleGuardar() {
    if (soloLectura) {
      onSiguiente();
      return;
    }

    if (terceroEsCliente) {
      toast.error("Debes ingresar los datos de una persona distinta de ti.");
      return;
    }

    if (segundoSocioMenorEdad) {
      toast.warning("El segundo socio debe tener 18 años o más.");
      return;
    }
    if (administradorMenorEdad) {
      toast.warning(
        esRepresentanteSociedadAnonima
          ? "El representante debe tener 18 años o más."
          : "El administrador debe tener 18 años o más.",
      );
      return;
    }
    if (!participacionSegundoSocioValida) {
      toast.warning(
        tipoSociedad === "limitada"
          ? "Ingresa un porcentaje de derechos sociales entre 1 y 100."
          : "Ingresa la cantidad de acciones del segundo socio.",
      );
      return;
    }
    if (limiteTerceroInmobiliario.estado === "limiteAlcanzado") {
      toast.error(
        "Esta persona ya participa como tercero de confianza en dos escrituras inmobiliarias. Elige a otra persona.",
      );
      return;
    }
    if (!isFormValido()) {
      toast.warning("Por favor, completa todos los campos obligatorios antes de continuar.");
      return;
    }
    if (esSegundoSocio) {
      const segundoSocioGuardado = completarSegundoSocio(
        gestionId,
        {
          nombres: tercero.nombres,
          apellidoPaterno: tercero.apellidoPaterno,
          apellidoMaterno: tercero.apellidoMaterno,
          rut: tercero.rut,
          email: tercero.email,
          fechaNacimiento: tercero.fechaNacimiento,
          nacionalidad: tercero.nacionalidad,
          profesion: tercero.profesion,
          estadoCivil: tercero.estadoCivil,
          regimenMatrimonial: tercero.regimenMatrimonial,
          domicilio: tercero.domicilio,
          comuna: tercero.comuna,
          region: tercero.region,
          ...((tipoSociedad === "spa" || tipoSociedad === "sa") && {
            cantidadAccionesSocio: Number(tercero.cantidadAccionesSocio),
          }),
          ...(tipoSociedad === "limitada" && {
            porcentajeDerechosSociales: Number(tercero.porcentajeDerechosSociales),
          }),
        },
        requiereDatosAdministrador ? administrador : undefined,
      );
      if (!segundoSocioGuardado) {
        toast.error("El segundo socio debe ser una persona distinta de ti.");
        return;
      }
    } else {
      const terceroGuardado = completarTercero(
        gestionId,
        {
          ...tercero,
          cantidadSenalesRiesgo: evaluacionRiesgo.senales.length,
          aceptaRiesgosTransferencia: requiereAceptarRiesgos ? aceptaRiesgos : false,
        },
        debePedirConyuge() ? conyuge : undefined,
        esMandatoGeneral
          ? tercero.otorganteMandato === "tercero"
            ? (datosTerceroOrigen ?? otorganteMandato)
            : null
          : undefined,
      );
      if (!terceroGuardado) {
        toast.error(
          "Esta persona ya participa como tercero de confianza en dos escrituras inmobiliarias. Elige a otra persona.",
        );
        return;
      }
    }
    const tipoMandato =
      requiereDefinirFirmaConjunta &&
      tercero.disponibilidadFirmaConjunta === "no" &&
      (tercero.tipoMandatoFirma === "autocontrato" || tercero.tipoMandatoFirma === "mandatoGeneral")
        ? (tercero.tipoMandatoFirma as TipoMandatoFirma)
        : undefined;
    if (!esMandatoGeneral && !esMandatoAutocontrato) {
      sincronizarMandatoFirma(gestionId, tipoMandato);
    }
    toast.success(
      esMandatoAutocontrato
        ? "Forma de firma guardada"
        : esMandatoGeneral
          ? "Datos del mandato guardados"
          : esSegundoSocio
            ? requiereDatosAdministrador
              ? `Datos del segundo socio y del ${
                  esRepresentanteSociedadAnonima ? "representante" : "administrador"
                } guardados`
              : "Datos del segundo socio guardados"
            : debePedirConyuge()
              ? "Datos del tercero y de quien comparece a autorizar guardados"
              : "Datos guardados exitosamente",
    );
    onSiguiente();
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* Datalist global para autocompletar comunas */}
        <datalist id="comunas-chile">
          {COMUNAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <fieldset
          disabled={soloLectura}
          className="contents [&_input:disabled]:opacity-100 [&_select:disabled]:opacity-100 [&_textarea:disabled]:opacity-100 [&_[role=combobox]:disabled]:opacity-100"
        >
          {/* ESCENARIO A: Liquidación de sociedad conyugal o Pacto de sustitución (Sólo datos del Cónyuge) */}
          {esConyugeContrato() && (
            <div className="rounded-xl border border-black/[0.04] bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Datos de tu cónyuge</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Completa la información personal de tu cónyuge para la redacción de los
                  documentos.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-nombres">Nombres</Label>
                  <Input
                    id="conyuge-nombres"
                    placeholder="Nombres"
                    value={conyuge.nombres}
                    onChange={(e) => handleConyugeChange("nombres", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-paterno">Apellido paterno</Label>
                  <Input
                    id="conyuge-paterno"
                    placeholder="Apellido paterno"
                    value={conyuge.apellidoPaterno}
                    onChange={(e) => handleConyugeChange("apellidoPaterno", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-materno">Apellido materno</Label>
                  <Input
                    id="conyuge-materno"
                    placeholder="Apellido materno"
                    value={conyuge.apellidoMaterno}
                    onChange={(e) => handleConyugeChange("apellidoMaterno", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-rut">RUT</Label>
                  <Input
                    id="conyuge-rut"
                    placeholder="Ej: 11.222.333-4"
                    value={conyuge.rut}
                    onChange={(e) => handleConyugeChange("rut", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-fecha">Fecha de nacimiento</Label>
                  <Input
                    id="conyuge-fecha"
                    type="date"
                    value={conyuge.fechaNacimiento}
                    onChange={(e) => handleConyugeChange("fechaNacimiento", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-nacionalidad">Nacionalidad</Label>
                  <Input
                    id="conyuge-nacionalidad"
                    value={conyuge.nacionalidad}
                    onChange={(e) => handleConyugeChange("nacionalidad", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-profesion">Profesión u oficio</Label>
                  <Input
                    id="conyuge-profesion"
                    placeholder="Ej: Abogado, Profesor, etc."
                    value={conyuge.profesion}
                    onChange={(e) => handleConyugeChange("profesion", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-email">Email</Label>
                  <Input
                    id="conyuge-email"
                    type="email"
                    placeholder="conyuge@ejemplo.com"
                    value={conyuge.email}
                    onChange={(e) => handleConyugeChange("email", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-estado-civil">Estado civil</Label>
                  <Input
                    id="conyuge-estado-civil"
                    value={conyuge.estadoCivil}
                    disabled
                    className="bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-regimen">Régimen patrimonial</Label>
                  <Input
                    id="conyuge-regimen"
                    value={conyuge.regimenMatrimonial}
                    disabled
                    className="bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="conyuge-domicilio">Domicilio</Label>
                  <Input
                    id="conyuge-domicilio"
                    placeholder="Calle, número, depto."
                    value={conyuge.domicilio}
                    onChange={(e) => handleConyugeChange("domicilio", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-comuna">Comuna</Label>
                  <Input
                    id="conyuge-comuna"
                    list="comunas-chile"
                    placeholder="Escribe para buscar..."
                    value={conyuge.comuna}
                    onChange={(e) => handleConyugeChange("comuna", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="conyuge-region">Región</Label>
                  <Input
                    id="conyuge-region"
                    placeholder="Región"
                    value={conyuge.region}
                    onChange={(e) => handleConyugeChange("region", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ESCENARIO B: Contratos regulares (Datos del Tercero de Confianza + Datos del Cónyuge si corresponde) */}
          {!esConyugeContrato() && (
            <>
              {/* Card 1: Persona relacionada con el contrato */}
              <div className="rounded-xl border border-black/[0.04] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {esSegundoSocio
                      ? "Datos del segundo socio"
                      : esMandatoGeneral
                        ? "Persona apoderada"
                        : esMandatoAutocontrato
                          ? "Firma con autocontrato"
                          : esResciliacion()
                            ? "Datos de la otra parte del contrato"
                            : "Datos de tu tercero de confianza"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {esSegundoSocio
                      ? "Ingresa los mismos datos personales que usamos para los demás comparecientes."
                      : esMandatoGeneral
                        ? "Primero indica quién otorgará el poder y luego completa los datos de quien firmará en su nombre."
                        : esMandatoAutocontrato
                          ? "Indica cuál de las dos partes firmará también en representación de la otra."
                          : esResciliacion()
                            ? "Ingresa los datos de la persona con quien celebraste el contrato que quieres resciliar."
                            : "Ingresa los datos de la persona que elegiste para transferirle tus bienes."}
                  </p>
                </div>

                {esCesionDerechosHereditarios && (
                  <section
                    aria-labelledby="regla-tercero-herencia-titulo"
                    className="rounded-lg border border-primary/20 bg-primary/[0.04] p-4"
                  >
                    <h3
                      id="regla-tercero-herencia-titulo"
                      className="text-sm font-semibold text-slate-800"
                    >
                      ¿A quién puedes elegir?
                    </h3>
                    <p
                      id="regla-tercero-herencia-ayuda"
                      className="mt-2 text-sm leading-relaxed text-slate-600"
                    >
                      {reglaTerceroCesionHereditaria.regla === "soloComunero"
                        ? `Según la regla aplicable ${referenciaComunasCesion}, la persona que elijas debe ser una de las personas herederas de esta herencia.`
                        : `Según la regla aplicable ${referenciaComunasCesion}, puedes elegir a otra persona heredera o a alguien que no forme parte de la herencia.`}
                    </p>

                    {reglaTerceroCesionHereditaria.regla === "soloComunero" ? (
                      <div className="mt-4 flex items-start gap-3">
                        <Checkbox
                          id="confirmar-tercero-heredero"
                          checked={tercero.vinculoComunidadHereditaria === "comunero"}
                          onCheckedChange={(checked) =>
                            handleTerceroChange(
                              "vinculoComunidadHereditaria",
                              checked === true ? "comunero" : "",
                            )
                          }
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor="confirmar-tercero-heredero"
                          className="cursor-pointer font-normal leading-relaxed text-slate-700"
                        >
                          Confirmo que esta persona también es heredera en esta herencia.
                        </Label>
                      </div>
                    ) : (
                      <fieldset className="mt-4">
                        <legend className="text-sm font-medium text-slate-800">
                          ¿La persona que elegiste forma parte de esta herencia?
                        </legend>
                        <RadioGroup
                          aria-describedby="regla-tercero-herencia-ayuda"
                          value={tercero.vinculoComunidadHereditaria}
                          onValueChange={(value) =>
                            handleTerceroChange("vinculoComunidadHereditaria", value)
                          }
                          className="mt-3 gap-3 sm:grid sm:grid-cols-2"
                        >
                          <Label
                            htmlFor="tercero-herencia-comunero"
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 font-normal transition-colors ${
                              tercero.vinculoComunidadHereditaria === "comunero"
                                ? "border-primary bg-primary/[0.03]"
                                : "border-slate-200 hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem
                              id="tercero-herencia-comunero"
                              value="comunero"
                              className="mt-0.5"
                            />
                            <span className="leading-relaxed text-slate-700">
                              Sí, es una de las personas herederas.
                            </span>
                          </Label>
                          <Label
                            htmlFor="tercero-herencia-ajeno"
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 font-normal transition-colors ${
                              tercero.vinculoComunidadHereditaria === "terceroAjeno"
                                ? "border-primary bg-primary/[0.03]"
                                : "border-slate-200 hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem
                              id="tercero-herencia-ajeno"
                              value="terceroAjeno"
                              className="mt-0.5"
                            />
                            <span className="leading-relaxed text-slate-700">
                              No, es una persona que no forma parte de la herencia.
                            </span>
                          </Label>
                        </RadioGroup>
                      </fieldset>
                    )}
                  </section>
                )}

                {esMandatoGeneral && (
                  <section className="space-y-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                    <fieldset>
                      <legend className="text-sm font-semibold text-slate-800">
                        ¿Quién otorgará el poder?
                      </legend>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        Esa persona autorizará a la persona apoderada para firmar en su nombre.
                      </p>
                      <RadioGroup
                        value={tercero.otorganteMandato}
                        onValueChange={(valor) => handleTerceroChange("otorganteMandato", valor)}
                        className="mt-4 gap-3"
                      >
                        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                          <RadioGroupItem value="cliente" id="otorgante-mandato-cliente" />
                          <div>
                            <Label
                              htmlFor="otorgante-mandato-cliente"
                              className="cursor-pointer font-medium text-slate-800"
                            >
                              Tú
                            </Label>
                            <p className="mt-1 text-sm text-slate-600">
                              Otorgarás poder para que otra persona firme en tu nombre.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                          <RadioGroupItem value="tercero" id="otorgante-mandato-tercero" />
                          <div>
                            <Label
                              htmlFor="otorgante-mandato-tercero"
                              className="cursor-pointer font-medium text-slate-800"
                            >
                              {datosTerceroOrigen
                                ? `${datosTerceroOrigen.nombres} ${datosTerceroOrigen.apellidoPaterno}`
                                : "La otra parte del contrato"}
                            </Label>
                            <p className="mt-1 text-sm text-slate-600">
                              La otra persona otorgará poder para que alguien firme en su nombre.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </fieldset>

                    {tercero.otorganteMandato === "tercero" && !datosTerceroOrigen && (
                      <div className="space-y-4 border-t border-slate-200 pt-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            Datos de quien otorgará el poder
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            No tenemos estos datos todavía. Complétalos para preparar el mandato.
                          </p>
                        </div>
                        <CamposPersonaMandato
                          idPrefix="otorgante-mandato"
                          persona={otorganteMandato}
                          onChange={handleOtorganteMandatoChange}
                        />
                      </div>
                    )}
                  </section>
                )}

                {esMandatoAutocontrato && (
                  <section className="space-y-5">
                    {autocontratoPrecargado && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                          <p className="text-xs font-medium text-slate-500">Tus datos</p>
                          <p className="mt-1 font-medium text-slate-800">
                            {clienteDatos.nombres} {clienteDatos.apellidoPaterno}{" "}
                            {clienteDatos.apellidoMaterno}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{clienteDatos.rut}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                          <p className="text-xs font-medium text-slate-500">
                            Datos de la otra persona
                          </p>
                          <p className="mt-1 font-medium text-slate-800">
                            {tercero.nombres} {tercero.apellidoPaterno} {tercero.apellidoMaterno}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{tercero.rut}</p>
                        </div>
                      </div>
                    )}

                    <fieldset>
                      <legend className="text-sm font-semibold text-slate-800">
                        ¿Quién firmará también en nombre de la otra persona?
                      </legend>
                      <RadioGroup
                        value={tercero.sentidoAutocontrato}
                        onValueChange={(valor) => handleTerceroChange("sentidoAutocontrato", valor)}
                        className="mt-3 gap-3"
                      >
                        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                          <RadioGroupItem
                            value="clientePorTercero"
                            id="autocontrato-cliente-por-tercero"
                          />
                          <Label
                            htmlFor="autocontrato-cliente-por-tercero"
                            className="cursor-pointer font-normal leading-relaxed text-slate-700"
                          >
                            Tú firmarás por ti y también a nombre de la otra persona.
                          </Label>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                          <RadioGroupItem
                            value="terceroPorCliente"
                            id="autocontrato-tercero-por-cliente"
                          />
                          <Label
                            htmlFor="autocontrato-tercero-por-cliente"
                            className="cursor-pointer font-normal leading-relaxed text-slate-700"
                          >
                            La otra persona firmará por sí misma y también en tu nombre.
                          </Label>
                        </div>
                      </RadioGroup>
                    </fieldset>

                    {!autocontratoPrecargado && (
                      <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed text-slate-700">
                        Completa abajo los datos de la otra persona. Tus datos ya están precargados.
                      </div>
                    )}
                  </section>
                )}

                {(!esMandatoAutocontrato || !autocontratoPrecargado) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-nombres">Nombres</Label>
                      <Input
                        id="tercero-nombres"
                        placeholder="Nombres"
                        value={tercero.nombres}
                        onChange={(e) => handleTerceroChange("nombres", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-paterno">Apellido paterno</Label>
                      <Input
                        id="tercero-paterno"
                        placeholder="Apellido paterno"
                        value={tercero.apellidoPaterno}
                        onChange={(e) => handleTerceroChange("apellidoPaterno", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-materno">Apellido materno</Label>
                      <Input
                        id="tercero-materno"
                        placeholder="Apellido materno"
                        value={tercero.apellidoMaterno}
                        onChange={(e) => handleTerceroChange("apellidoMaterno", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-rut">RUT</Label>
                      <Input
                        id="tercero-rut"
                        placeholder="Ej: 11.222.333-4"
                        value={tercero.rut}
                        onChange={(e) => handleTerceroChange("rut", e.target.value)}
                        aria-invalid={Boolean(
                          terceroEsCliente ||
                            coincidenciaApoderado ||
                            limiteTerceroInmobiliario.estado === "limiteAlcanzado",
                        )}
                        aria-describedby={
                          terceroEsCliente || coincidenciaApoderado
                            ? "tercero-rut-coincidencia-persona"
                            : limiteTerceroInmobiliario.estado !== "disponible"
                              ? "tercero-rut-limite-inmobiliario"
                              : undefined
                        }
                      />
                    </div>
                    {(terceroEsCliente || coincidenciaApoderado === "otraParte") && (
                      <p
                        id="tercero-rut-coincidencia-persona"
                        role="alert"
                        className="flex items-start gap-2 text-sm leading-relaxed text-red-700 sm:col-span-2"
                      >
                        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <span>
                          {terceroEsCliente
                            ? esMandatoGeneral
                              ? "La persona apoderada debe ser distinta de ti. Ingresa el RUT de otra persona."
                              : esSegundoSocio
                                ? "El segundo socio debe ser una persona distinta de ti. Ingresa el RUT de otra persona."
                                : esResciliacion()
                                  ? "La otra parte del contrato debe ser una persona distinta de ti. Ingresa el RUT de otra persona."
                                  : "El tercero de confianza debe ser una persona distinta de ti. Ingresa el RUT de otra persona."
                            : "La persona apoderada debe ser distinta de la otra parte del contrato. Ingresa el RUT de otra persona."}
                        </span>
                      </p>
                    )}
                    {!terceroEsCliente &&
                      coincidenciaApoderado !== "otraParte" &&
                      limiteTerceroInmobiliario.estado !== "disponible" && (
                      <p
                        id="tercero-rut-limite-inmobiliario"
                        role={
                          limiteTerceroInmobiliario.estado === "limiteAlcanzado"
                            ? "alert"
                            : "status"
                        }
                        className={`flex items-start gap-2 text-sm leading-relaxed sm:col-span-2 ${
                          limiteTerceroInmobiliario.estado === "limiteAlcanzado"
                            ? "text-red-700"
                            : "text-primary"
                        }`}
                      >
                        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <span>
                          {limiteTerceroInmobiliario.estado === "limiteAlcanzado"
                            ? "Esta persona ya fue elegida como tercero de confianza en dos escrituras inmobiliarias. Para continuar, debes elegir a otra persona."
                            : "Esta persona ya está asociada a otra escritura inmobiliaria. Puedes elegirla en esta gestión, pero no podrá participar como tercero de confianza en una tercera."}
                        </span>
                      </p>
                      )}
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-fecha">Fecha de nacimiento</Label>
                      <Input
                        id="tercero-fecha"
                        type="date"
                        value={tercero.fechaNacimiento}
                        onChange={(e) => handleTerceroChange("fechaNacimiento", e.target.value)}
                        aria-invalid={segundoSocioMenorEdad}
                        aria-describedby={esSegundoSocio ? "segundo-socio-edad-ayuda" : undefined}
                      />
                      {esSegundoSocio && (
                        <p
                          id="segundo-socio-edad-ayuda"
                          className={`text-xs leading-relaxed ${
                            segundoSocioMenorEdad ? "text-red-700" : "text-slate-500"
                          }`}
                        >
                          {segundoSocioMenorEdad
                            ? "El segundo socio debe tener 18 años o más."
                            : "Debe tener 18 años o más."}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-nacionalidad">Nacionalidad</Label>
                      <Input
                        id="tercero-nacionalidad"
                        value={tercero.nacionalidad}
                        onChange={(e) => handleTerceroChange("nacionalidad", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-profesion">Profesión u oficio</Label>
                      <Input
                        id="tercero-profesion"
                        placeholder="Ej: Abogado, Profesor, etc."
                        value={tercero.profesion}
                        onChange={(e) => handleTerceroChange("profesion", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-email">Email</Label>
                      <Input
                        id="tercero-email"
                        type="email"
                        placeholder="tercero@ejemplo.com"
                        value={tercero.email}
                        onChange={(e) => handleTerceroChange("email", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-estado-civil">Estado civil</Label>
                      <Select
                        value={tercero.estadoCivil}
                        onValueChange={(val) => handleTerceroChange("estadoCivil", val)}
                      >
                        <SelectTrigger id="tercero-estado-civil">
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                          <SelectItem value="Casado/a">Casado/a</SelectItem>
                          <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                          <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                          <SelectItem value="Acuerdo de Unión Civil">
                            Acuerdo de Unión Civil
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(tercero.estadoCivil === "Casado/a" ||
                      tercero.estadoCivil === "Acuerdo de Unión Civil") && (
                      <div className="grid gap-1.5">
                        <Label htmlFor="tercero-regimen">Régimen patrimonial</Label>
                        <Select
                          value={tercero.regimenMatrimonial}
                          onValueChange={(val) => handleTerceroChange("regimenMatrimonial", val)}
                        >
                          <SelectTrigger id="tercero-regimen">
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            {tercero.estadoCivil === "Casado/a" ? (
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
                                <SelectItem value="Comunidad de bienes">
                                  Comunidad de bienes
                                </SelectItem>
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
                      <Label htmlFor="tercero-domicilio">Domicilio</Label>
                      <Input
                        id="tercero-domicilio"
                        placeholder="Calle, número, depto."
                        value={tercero.domicilio}
                        onChange={(e) => handleTerceroChange("domicilio", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-comuna">Comuna</Label>
                      <Input
                        id="tercero-comuna"
                        list="comunas-chile"
                        placeholder="Escribe para buscar..."
                        value={tercero.comuna}
                        onChange={(e) => handleTerceroChange("comuna", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="tercero-region">Región</Label>
                      <Input
                        id="tercero-region"
                        placeholder="Región"
                        value={tercero.region}
                        onChange={(e) => handleTerceroChange("region", e.target.value)}
                      />
                    </div>

                    {esSegundoSocio && (tipoSociedad === "spa" || tipoSociedad === "sa") && (
                      <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="segundo-socio-acciones">
                          Cantidad de acciones del segundo socio
                        </Label>
                        <Input
                          id="segundo-socio-acciones"
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          placeholder="Ej: 50"
                          value={tercero.cantidadAccionesSocio}
                          onChange={(e) =>
                            handleTerceroChange("cantidadAccionesSocio", e.target.value)
                          }
                        />
                      </div>
                    )}

                    {esSegundoSocio && tipoSociedad === "limitada" && (
                      <div className="grid gap-1.5 sm:col-span-2">
                        <Label htmlFor="segundo-socio-porcentaje">
                          Porcentaje de derechos sociales del segundo socio
                        </Label>
                        <Input
                          id="segundo-socio-porcentaje"
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          inputMode="numeric"
                          placeholder="Ej: 50"
                          value={tercero.porcentajeDerechosSociales}
                          onChange={(e) =>
                            handleTerceroChange("porcentajeDerechosSociales", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                )}

                {requiereDatosAdministrador && (
                  <section
                    aria-labelledby="datos-administrador-title"
                    className="space-y-5 border-t border-slate-100 pt-6"
                  >
                    <div>
                      <h3
                        id="datos-administrador-title"
                        className="text-base font-semibold text-slate-800"
                      >
                        {esRepresentanteSociedadAnonima
                          ? "Datos del representante"
                          : "Datos del administrador"}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Completa los datos de la otra persona que{" "}
                        {esRepresentanteSociedadAnonima
                          ? "representará a la sociedad."
                          : "administrará la sociedad."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-nombres">Nombres</Label>
                        <Input
                          id="administrador-nombres"
                          placeholder="Nombres"
                          value={administrador.nombres}
                          onChange={(e) => handleAdministradorChange("nombres", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-paterno">Apellido paterno</Label>
                        <Input
                          id="administrador-paterno"
                          placeholder="Apellido paterno"
                          value={administrador.apellidoPaterno}
                          onChange={(e) =>
                            handleAdministradorChange("apellidoPaterno", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-materno">Apellido materno</Label>
                        <Input
                          id="administrador-materno"
                          placeholder="Apellido materno"
                          value={administrador.apellidoMaterno}
                          onChange={(e) =>
                            handleAdministradorChange("apellidoMaterno", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-rut">RUT</Label>
                        <Input
                          id="administrador-rut"
                          placeholder="Ej: 11.222.333-4"
                          value={administrador.rut}
                          onChange={(e) => handleAdministradorChange("rut", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-fecha">Fecha de nacimiento</Label>
                        <Input
                          id="administrador-fecha"
                          type="date"
                          value={administrador.fechaNacimiento}
                          onChange={(e) =>
                            handleAdministradorChange("fechaNacimiento", e.target.value)
                          }
                          aria-invalid={administradorMenorEdad}
                          aria-describedby="administrador-edad-ayuda"
                        />
                        <p
                          id="administrador-edad-ayuda"
                          className={`text-xs leading-relaxed ${
                            administradorMenorEdad ? "text-red-700" : "text-slate-500"
                          }`}
                        >
                          {administradorMenorEdad
                            ? `${
                                esRepresentanteSociedadAnonima
                                  ? "El representante"
                                  : "El administrador"
                              } debe tener 18 años o más.`
                            : "Debe tener 18 años o más."}
                        </p>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-nacionalidad">Nacionalidad</Label>
                        <Input
                          id="administrador-nacionalidad"
                          value={administrador.nacionalidad}
                          onChange={(e) =>
                            handleAdministradorChange("nacionalidad", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-profesion">Profesión u oficio</Label>
                        <Input
                          id="administrador-profesion"
                          placeholder="Ej: Abogado, Profesor, etc."
                          value={administrador.profesion}
                          onChange={(e) => handleAdministradorChange("profesion", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-email">Email</Label>
                        <Input
                          id="administrador-email"
                          type="email"
                          placeholder="persona@ejemplo.com"
                          value={administrador.email}
                          onChange={(e) => handleAdministradorChange("email", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-estado-civil">Estado civil</Label>
                        <Select
                          value={administrador.estadoCivil}
                          onValueChange={(valor) => handleAdministradorChange("estadoCivil", valor)}
                        >
                          <SelectTrigger id="administrador-estado-civil">
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                            <SelectItem value="Casado/a">Casado/a</SelectItem>
                            <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                            <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                            <SelectItem value="Acuerdo de Unión Civil">
                              Acuerdo de Unión Civil
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(administrador.estadoCivil === "Casado/a" ||
                        administrador.estadoCivil === "Acuerdo de Unión Civil") && (
                        <div className="grid gap-1.5">
                          <Label htmlFor="administrador-regimen">Régimen patrimonial</Label>
                          <Select
                            value={administrador.regimenMatrimonial}
                            onValueChange={(valor) =>
                              handleAdministradorChange("regimenMatrimonial", valor)
                            }
                          >
                            <SelectTrigger id="administrador-regimen">
                              <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                              {administrador.estadoCivil === "Casado/a" ? (
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
                                  <SelectItem value="Comunidad de bienes">
                                    Comunidad de bienes
                                  </SelectItem>
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
                        <Label htmlFor="administrador-domicilio">Domicilio</Label>
                        <Input
                          id="administrador-domicilio"
                          placeholder="Calle, número, depto."
                          value={administrador.domicilio}
                          onChange={(e) => handleAdministradorChange("domicilio", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-comuna">Comuna</Label>
                        <Input
                          id="administrador-comuna"
                          list="comunas-chile"
                          placeholder="Escribe para buscar..."
                          value={administrador.comuna}
                          onChange={(e) => handleAdministradorChange("comuna", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="administrador-region">Región</Label>
                        <Input
                          id="administrador-region"
                          placeholder="Región"
                          value={administrador.region}
                          onChange={(e) => handleAdministradorChange("region", e.target.value)}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {requiereDefinirFirmaConjunta && (
                  <section
                    aria-labelledby="firma-conjunta-title"
                    className="space-y-5 rounded-lg border border-primary/20 bg-primary/[0.04] p-4"
                  >
                    <div>
                      <h3
                        id="firma-conjunta-title"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Firma del contrato
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        Como tú y la otra persona viven en regiones distintas, necesitamos saber
                        cómo podrán firmar.
                      </p>
                    </div>

                    <fieldset>
                      <legend className="text-sm font-medium text-slate-800">
                        ¿Tienen disponibilidad para firmar el contrato juntos?
                      </legend>
                      <RadioGroup
                        value={tercero.disponibilidadFirmaConjunta}
                        onValueChange={(valor) =>
                          handleTerceroChange("disponibilidadFirmaConjunta", valor)
                        }
                        className="mt-3 gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="si" id="firma-conjunta-si" />
                          <Label
                            htmlFor="firma-conjunta-si"
                            className="cursor-pointer font-normal text-slate-700"
                          >
                            Sí, podemos firmar juntos
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="firma-conjunta-no" />
                          <Label
                            htmlFor="firma-conjunta-no"
                            className="cursor-pointer font-normal text-slate-700"
                          >
                            No, necesitamos otra alternativa
                          </Label>
                        </div>
                      </RadioGroup>
                    </fieldset>

                    {tercero.disponibilidadFirmaConjunta === "no" && (
                      <fieldset className="space-y-3 border-t border-primary/20 pt-4">
                        <legend className="text-sm font-medium text-slate-800">
                          ¿Quién firmará en representación?
                        </legend>
                        <p className="text-sm leading-relaxed text-slate-600">
                          Agregaremos el mandato que elijas a tus gestiones.
                        </p>
                        <RadioGroup
                          value={tercero.tipoMandatoFirma}
                          onValueChange={(valor) => handleTerceroChange("tipoMandatoFirma", valor)}
                          className="gap-3"
                        >
                          <Label
                            htmlFor="mandato-autocontrato"
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 font-normal transition-colors ${
                              tercero.tipoMandatoFirma === "autocontrato"
                                ? "border-primary bg-primary/[0.04]"
                                : "border-slate-200 hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem
                              value="autocontrato"
                              id="mandato-autocontrato"
                              className="mt-0.5"
                            />
                            <div>
                              <span className="font-medium text-slate-800">
                                Una de las partes del contrato
                              </span>
                              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                Firmará por sí misma y también en nombre de la otra parte.
                                Agregaremos un Mandato con autocontrato.
                              </p>
                            </div>
                          </Label>
                          <Label
                            htmlFor="mandato-general"
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 font-normal transition-colors ${
                              tercero.tipoMandatoFirma === "mandatoGeneral"
                                ? "border-primary bg-primary/[0.04]"
                                : "border-slate-200 hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem
                              value="mandatoGeneral"
                              id="mandato-general"
                              className="mt-0.5"
                            />
                            <div>
                              <span className="font-medium text-slate-800">
                                Una persona externa a la transferencia
                              </span>
                              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                Firmará en nombre de una de las partes. Agregaremos un Mandato
                                general.
                              </p>
                            </div>
                          </Label>
                        </RadioGroup>
                        {tercero.tipoMandatoFirma && (
                          <p className="text-sm font-medium text-primary" role="status">
                            Agregaremos:{" "}
                            {tercero.tipoMandatoFirma === "autocontrato"
                              ? "Mandato con autocontrato"
                              : "Mandato"}
                            .
                          </p>
                        )}
                      </fieldset>
                    )}
                  </section>
                )}

                {/* Campos condicionales para compraventas, cesiones, etc. */}
                {esCompraventaOCesionOAcciones() && (
                  <div className="mt-2 space-y-6 border-t border-slate-100 pt-6">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">
                        Evaluación de la transferencia
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        Estas respuestas nos ayudan a advertirte si conviene elegir a otra persona.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="tercero-relacion">Relación contigo</Label>
                          <AyudaCampo label="relación contigo">
                            Indica qué vínculo tiene esta persona contigo. Nos ayuda a identificar
                            posibles conflictos o señales de riesgo.
                          </AyudaCampo>
                        </div>
                        <Select
                          value={tercero.relacion}
                          onValueChange={(val) => handleTerceroChange("relacion", val)}
                        >
                          <SelectTrigger
                            id="tercero-relacion"
                            aria-describedby="tercero-relacion-ayuda"
                          >
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            {OPCIONES_RELACION.map((opc) => (
                              <SelectItem key={opc.value} value={opc.value}>
                                {opc.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p
                          id="tercero-relacion-ayuda"
                          className="text-xs leading-relaxed text-slate-500"
                        >
                          Tu cónyuge no puede ser el tercero de confianza.
                        </p>
                      </div>
                      {debePreguntarFacultadesMentales && (
                        <div className="grid gap-1.5">
                          <div className="flex h-6 items-center gap-1">
                            <Label htmlFor="tercero-capaz">
                              ¿Se encuentra en plenas facultades mentales?
                            </Label>
                            <AyudaCampo label="plenas facultades mentales">
                              Selecciona “No” si una condición como el alzhéimer o una demencia
                              avanzada le impide tomar decisiones por sí misma.
                            </AyudaCampo>
                          </div>
                          <Select
                            value={tercero.plenamenteCapaz}
                            onValueChange={(val) => handleTerceroChange("plenamenteCapaz", val)}
                          >
                            <SelectTrigger
                              id="tercero-capaz"
                              aria-describedby="tercero-capaz-ayuda"
                            >
                              <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="si">Sí</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          {requiereCertificadoMedico && (
                            <p
                              id="tercero-capaz-ayuda"
                              role="status"
                              className="text-xs leading-relaxed text-slate-500"
                            >
                              Por tener más de 60 años, la notaría solicitará un certificado emitido
                              por un psiquiatra o neurólogo que acredite sus plenas facultades
                              mentales.
                            </p>
                          )}
                        </div>
                      )}
                      <div className="grid gap-1.5">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="tercero-ingresos">
                            ¿Esta persona percibe ingresos estables?
                          </Label>
                          <AyudaCampo label="ingresos estables">
                            Es importante que esta persona pueda acreditar ingresos, como sueldo,
                            pensión, arriendos u otras entradas regulares. De lo contrario, el SII
                            podría cuestionar la transferencia.
                          </AyudaCampo>
                        </div>
                        <Select
                          value={tercero.ingresosEstables}
                          onValueChange={(val) => handleTerceroChange("ingresosEstables", val)}
                        >
                          <SelectTrigger
                            id="tercero-ingresos"
                            aria-describedby={
                              tercero.ingresosEstables === "no"
                                ? "tercero-ingresos-advertencia"
                                : undefined
                            }
                          >
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="si">Sí</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        {tercero.ingresosEstables === "no" && (
                          <p
                            id="tercero-ingresos-advertencia"
                            role="status"
                            className="text-xs leading-relaxed text-slate-500"
                          >
                            Si no puede acreditar ingresos, el SII podría cuestionar la
                            transferencia.
                          </p>
                        )}
                      </div>
                    </div>

                    {transferenciaBloqueada && (
                      <div
                        role="alert"
                        className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4"
                      >
                        <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
                        <div>
                          <p className="text-sm font-semibold">Necesitas elegir a otra persona</p>
                          {evaluacionRiesgo.impedimentos.map((impedimento) => (
                            <p
                              key={impedimento}
                              className="mt-1 text-sm leading-relaxed text-destructive"
                            >
                              {impedimento}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {evaluacionCompleta && !transferenciaBloqueada && (
                      <section
                        aria-live="polite"
                        aria-labelledby="resultado-riesgo-tercero"
                        className={`rounded-lg border p-4 ${
                          evaluacionRiesgo.senales.length === 0
                            ? "border-success/20 bg-success/10"
                            : "border-warning/30 bg-warning/[0.02]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {evaluacionRiesgo.senales.length === 0 ? (
                            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
                          ) : (
                            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 id="resultado-riesgo-tercero" className="text-sm font-semibold">
                                {evaluacionRiesgo.senales.length === 0
                                  ? "Resultado de la evaluación"
                                  : "Te recomendamos elegir a otra persona"}
                              </h4>
                              <Badge
                                variant="secondary"
                                className={
                                  evaluacionRiesgo.senales.length === 0
                                    ? "bg-success/15 text-success"
                                    : "border border-warning/20 bg-warning/10 text-foreground"
                                }
                              >
                                {evaluacionRiesgo.senales.length === 0
                                  ? "Sin señales"
                                  : `${evaluacionRiesgo.senales.length} ${
                                      evaluacionRiesgo.senales.length === 1 ? "señal" : "señales"
                                    }`}
                              </Badge>
                            </div>

                            {evaluacionRiesgo.senales.length === 0 ? (
                              <p className="mt-2 text-sm leading-relaxed text-success">
                                No detectamos señales adicionales con estas respuestas. El equipo
                                legal revisará igualmente los antecedentes.
                              </p>
                            ) : (
                              <>
                                <p className="mt-2 text-sm leading-relaxed">
                                  El SII o un tribunal podrían cuestionar esta transferencia y dejar
                                  el contrato sin efecto.
                                </p>
                                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-warning">
                                  {evaluacionRiesgo.senales.map((senal) => (
                                    <li key={senal.id}>{senal.descripcion}</li>
                                  ))}
                                </ul>
                                <p className="mt-3 text-sm leading-relaxed">
                                  <span className="font-medium">Para reducir el riesgo, </span>
                                  {esCesionDerechosHereditarios &&
                                  reglaTerceroCesionHereditaria.regla === "soloComunero"
                                    ? "elige, entre las personas herederas, a alguien que tenga ingresos estables."
                                    : "elige a alguien que no sea tu pariente y tenga ingresos estables."}
                                </p>
                                <div className="mt-4 flex items-start gap-3 border-t border-border pt-4">
                                  <Checkbox
                                    id="aceptar-riesgos-tercero"
                                    checked={aceptaRiesgos}
                                    onCheckedChange={(checked) =>
                                      setAceptaRiesgos(checked === true)
                                    }
                                    className="mt-1"
                                  />
                                  <Label
                                    htmlFor="aceptar-riesgos-tercero"
                                    className="cursor-pointer font-normal leading-relaxed"
                                  >
                                    Entiendo que esta transferencia puede ser cuestionada y quedar
                                    sin efecto. Aun así, quiero continuar con esta persona.
                                  </Label>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>

              {/* Card 2: Cónyuge/conviviente del tercero que comparece a autorizar */}
              {debePedirConyuge() && (
                <div className="rounded-xl border border-black/[0.04] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      Datos del cónyuge o conviviente civil del tercero
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Debido al régimen de {tercero.regimenMatrimonial}, esta persona debe
                      comparecer a autorizar la operación.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-nombres">Nombres</Label>
                      <Input
                        id="c-conyuge-nombres"
                        placeholder="Nombres"
                        value={conyuge.nombres}
                        onChange={(e) => handleConyugeChange("nombres", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-paterno">Apellido paterno</Label>
                      <Input
                        id="c-conyuge-paterno"
                        placeholder="Apellido paterno"
                        value={conyuge.apellidoPaterno}
                        onChange={(e) => handleConyugeChange("apellidoPaterno", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-materno">Apellido materno</Label>
                      <Input
                        id="c-conyuge-materno"
                        placeholder="Apellido materno"
                        value={conyuge.apellidoMaterno}
                        onChange={(e) => handleConyugeChange("apellidoMaterno", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-rut">RUT</Label>
                      <Input
                        id="c-conyuge-rut"
                        placeholder="Ej: 11.222.333-4"
                        value={conyuge.rut}
                        onChange={(e) => handleConyugeChange("rut", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-fecha">Fecha de nacimiento</Label>
                      <Input
                        id="c-conyuge-fecha"
                        type="date"
                        value={conyuge.fechaNacimiento}
                        onChange={(e) => handleConyugeChange("fechaNacimiento", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-nacionalidad">Nacionalidad</Label>
                      <Input
                        id="c-conyuge-nacionalidad"
                        value={conyuge.nacionalidad}
                        onChange={(e) => handleConyugeChange("nacionalidad", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-profesion">Profesión u oficio</Label>
                      <Input
                        id="c-conyuge-profesion"
                        placeholder="Ej: Abogado, Profesor, etc."
                        value={conyuge.profesion}
                        onChange={(e) => handleConyugeChange("profesion", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-email">Email</Label>
                      <Input
                        id="c-conyuge-email"
                        type="email"
                        placeholder="conyuge@ejemplo.com"
                        value={conyuge.email}
                        onChange={(e) => handleConyugeChange("email", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-estado-civil">Estado civil</Label>
                      <Input
                        id="c-conyuge-estado-civil"
                        value={conyuge.estadoCivil}
                        disabled
                        className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-regimen">Régimen patrimonial</Label>
                      <Input
                        id="c-conyuge-regimen"
                        value={conyuge.regimenMatrimonial}
                        disabled
                        className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="grid gap-1.5 sm:col-span-2">
                      <Label htmlFor="c-conyuge-domicilio">Domicilio</Label>
                      <Input
                        id="c-conyuge-domicilio"
                        placeholder="Calle, número, depto."
                        value={conyuge.domicilio}
                        onChange={(e) => handleConyugeChange("domicilio", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-comuna">Comuna</Label>
                      <Input
                        id="c-conyuge-comuna"
                        list="comunas-chile"
                        placeholder="Escribe para buscar..."
                        value={conyuge.comuna}
                        onChange={(e) => handleConyugeChange("comuna", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-conyuge-region">Región</Label>
                      <Input
                        id="c-conyuge-region"
                        placeholder="Región"
                        value={conyuge.region}
                        onChange={(e) => handleConyugeChange("region", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </fieldset>

        {/* Acciones inferiores */}
        <div className="mt-8 flex justify-between gap-4">
          <Button variant="outline" onClick={onVolver} className="w-full sm:w-auto">
            Volver
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={!soloLectura && !isFormValido()}
            className="w-full sm:w-auto"
          >
            {soloLectura ? "Continuar" : esUltimoPasoFicha ? "Enviar ficha" : "Enviar y continuar"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
