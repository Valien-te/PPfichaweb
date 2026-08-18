import { CircleHelp, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

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
import { Table } from "@/shared/components/base/Table";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/base/Tooltip";

import { esAdquisicionPorHerencia, type TipoTitularidadInmueble } from "../adquisicion-rules";
import {
  actualizarRutaContratoInmueble,
  actualizarRutaContratoLiquidacion,
  completarDatosEspecificos,
  type GestionState,
  guardarEstadoTransferenciaBloqueada,
  guardarGestionEnEsperaAlzamiento,
} from "../gestiones-store";
import { obtenerPresentacionBienesMuebles } from "./datos-especificos-copy";
import { debePedirAdministradorSociedad } from "./tercero-rules";
import { useValidacionCampos } from "./use-validacion-campos";
import {
  debeGuardarEstadoTransferenciaVehiculo,
  esContratoTransferenciaVehiculo,
  evaluacionPrendaCompleta,
  permisoCirculacionBloqueaTransferencia,
  puedeGuardarEsperaPrenda,
  resolverEstadoPrendaVehiculo,
} from "./vehiculo-prenda-rules";

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

const INMUEBLE_MANDATO_VACIO = { direccion: "", comuna: "", region: "" };
let correlativoBienMueble = 0;

interface BienMuebleFormulario {
  idBienMueble: string;
  cantidad: string | number;
  tipoBien: string;
  marca: string;
  color: string;
}

function crearIdBienMueble() {
  correlativoBienMueble += 1;
  return `bien-mueble-${Date.now()}-${correlativoBienMueble}`;
}

function crearBienMuebleVacio() {
  return {
    idBienMueble: crearIdBienMueble(),
    cantidad: 1,
    tipoBien: "",
    marca: "",
    color: "",
  };
}

function datosAccionesCompletos(valores: Record<string, unknown>): boolean {
  const tieneTexto = (valor: unknown) =>
    valor !== undefined && valor !== null && String(valor).trim() !== "";

  if (
    !tieneTexto(valores.razonSocial) ||
    !tieneTexto(valores.rutEmpresa) ||
    !tieneTexto(valores.tipoSocietarioAcciones)
  ) {
    return false;
  }

  if (valores.tipoSocietarioAcciones === "srl") {
    const porcentaje = Number(valores.participacion);
    return Number.isFinite(porcentaje) && porcentaje > 0 && porcentaje <= 100;
  }

  if (valores.tipoSocietarioAcciones === "spa" || valores.tipoSocietarioAcciones === "sa") {
    const numeroAcciones = Number(valores.numeroAcciones);
    return Number.isInteger(numeroAcciones) && numeroAcciones > 0;
  }

  return false;
}

function obtenerInmueblesMandato(valores: Record<string, any>) {
  if (
    Array.isArray(valores.mandatoInmueblesDetalle) &&
    valores.mandatoInmueblesDetalle.length > 0
  ) {
    return valores.mandatoInmueblesDetalle;
  }

  if (valores.direccion || valores.comuna || valores.region) {
    return [
      {
        direccion: valores.direccion ?? "",
        comuna: valores.comuna ?? "",
        region: valores.region ?? "",
      },
    ];
  }

  return [{ ...INMUEBLE_MANDATO_VACIO }];
}

function obtenerBienesMueblesMandato(valores: Record<string, unknown>): BienMuebleFormulario[] {
  if (Array.isArray(valores.bienesSingularizados)) {
    return valores.bienesSingularizados.map(
      (item: Partial<BienMuebleFormulario>, index: number) => {
        return {
          idBienMueble: item.idBienMueble ?? `bien-mueble-existente-${index}`,
          cantidad: item.cantidad ?? 1,
          tipoBien: item.tipoBien ?? "",
          marca: item.marca ?? "",
          color: item.color ?? "",
        };
      },
    );
  }

  return [
    {
      idBienMueble: "bien-mueble-inicial",
      cantidad:
        typeof valores.cantidad === "string" || typeof valores.cantidad === "number"
          ? valores.cantidad
          : 1,
      tipoBien: typeof valores.tipoBien === "string" ? valores.tipoBien : "",
      marca: typeof valores.marca === "string" ? valores.marca : "",
      color: typeof valores.color === "string" ? valores.color : "",
    },
  ];
}

interface PasoDatosEspecificosProps {
  esUltimoPasoFicha?: boolean;
  soloLectura?: boolean;
  gestion: GestionState;
  onVolver: () => void;
  onSiguiente: () => void;
  onVolverAlPortal: () => void;
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

function DescripcionInventarioBienes({ descripcion }: { descripcion: string }) {
  const [inicio, cierre] = descripcion.split("bienes de mayor valor");

  return (
    <>
      {inicio}
      <strong className="font-medium text-slate-600">bienes de mayor valor</strong>
      {cierre} Descríbelos con detalle e incluye el{" "}
      <strong className="font-medium text-slate-600">tamaño o número de serie</strong> cuando
      corresponda. Si alguno no tiene marca, escribe{" "}
      <strong className="font-medium text-slate-600">“Sin marca”</strong>.
    </>
  );
}

export function PasoDatosEspecificos({
  esUltimoPasoFicha = false,
  soloLectura = false,
  gestion,
  onVolver,
  onSiguiente,
  onVolverAlPortal,
}: PasoDatosEspecificosProps) {
  // Cargar valores iniciales desde el store si existen
  const [valores, setValores] = useState<Record<string, any>>(
    () => gestion.valoresEspecificos ?? {},
  );
  const {
    contenedorRef: contenedorFormularioRef,
    mensajesValidacion,
    validarCampos,
  } = useValidacionCampos();

  const normalizar = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const nombreContrato = gestion.nombre;

  // Funciones de control de datos
  const handleFieldChange = (key: string, value: any) => {
    setValores((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "comuna" && COMUNAS_REGIONES[value]) {
        next.region = COMUNAS_REGIONES[value];
      }
      if (key === "tipoSociedad") {
        delete next.cantidadAcciones;
        delete next.administradorSociedad;
      }
      if (key === "tipoSocietarioAcciones") {
        if (value === "srl") {
          delete next.numeroAcciones;
        } else {
          delete next.participacion;
        }
      }
      if (key === "prenda" && value === "no") {
        delete next.deudaPrendaAlDia;
        delete next.cuotasPendientesPrenda;
      }
      if (key === "cuotasPendientesPrenda" && value === "deudaPagada") {
        delete next.deudaPrendaAlDia;
      }
      return next;
    });
  };

  const handleTipoAdquisicionChange = (tipoAdquisicion: string) => {
    const tipoContratoOriginal =
      typeof valores.tipoContratoOriginal === "string"
        ? valores.tipoContratoOriginal
        : gestion.nombre;
    const valoresActualizados: Record<string, unknown> = {
      ...valores,
      tipoAdquisicion,
      tipoContratoOriginal,
    };

    delete valoresActualizados.tipoTitularidadInmueble;

    if (tipoAdquisicion !== "subsidio" && tipoAdquisicion !== "subsidio-hipotecario") {
      delete valoresActualizados.anioSubsidio;
    }

    if (esAdquisicionPorHerencia(tipoAdquisicion)) {
      valoresActualizados.inmueblesHeredados = valores.inmueblesHeredados ?? [
        {
          direccion: valores.direccion ?? "",
          comuna: valores.comuna ?? "",
          region: valores.region ?? "",
        },
      ];
    } else {
      delete valoresActualizados.cantidadHerederos;
      delete valoresActualizados.inmueblesHeredados;
    }

    setValores(valoresActualizados);
    actualizarRutaContratoInmueble(gestion.id, valoresActualizados);
  };

  const handleTipoTitularidadChange = (value: string) => {
    if (value !== "propiedadExclusiva" && value !== "copropiedad") return;

    const tipoTitularidad = value as TipoTitularidadInmueble;
    const tipoContratoOriginal = valores.tipoContratoOriginal ?? gestion.nombre;
    const valoresActualizados = {
      ...valores,
      tipoContratoOriginal,
      tipoTitularidadInmueble: tipoTitularidad,
    };

    setValores(valoresActualizados);
    actualizarRutaContratoInmueble(gestion.id, valoresActualizados);
  };

  const handleBienesLiquidacionChange = (
    key: "comproInmueble" | "comproVehiculo",
    value: string,
  ) => {
    const tipoContratoOriginal =
      typeof valores.tipoContratoOriginal === "string"
        ? valores.tipoContratoOriginal
        : gestion.nombre;
    const valoresActualizados: Record<string, unknown> = {
      ...valores,
      [key]: value,
      tipoContratoOriginal,
    };

    if (key === "comproInmueble" && value === "no") {
      delete valoresActualizados.liquidacionInmuebles;
    }
    if (key === "comproVehiculo" && value === "no") {
      delete valoresActualizados.liquidacionVehiculos;
    }

    setValores(valoresActualizados);
    actualizarRutaContratoLiquidacion(gestion.id, valoresActualizados);
  };

  const handleTipoBienMandatoChange = (
    key: "mandatoInmuebles" | "mandatoVehiculos" | "mandatoMuebles" | "mandatoAcciones",
    checked: boolean,
  ) => {
    setValores((prev) => {
      const next = { ...prev, [key]: checked };

      if (key === "mandatoInmuebles") {
        if (checked) {
          next.mandatoInmueblesDetalle = obtenerInmueblesMandato(prev);
        } else {
          delete next.mandatoInmueblesDetalle;
          delete next.direccion;
          delete next.comuna;
          delete next.region;
        }
      }

      return next;
    });
  };

  const handleListFieldChange = (listKey: string, index: number, fieldKey: string, value: any) => {
    setValores((prev) => {
      const list = [
        ...(listKey === "mandatoInmueblesDetalle"
          ? obtenerInmueblesMandato(prev)
          : listKey === "bienesSingularizados"
            ? obtenerBienesMueblesMandato(prev)
            : prev[listKey] || []),
      ];
      if (!list[index]) list[index] = {};
      list[index] = { ...list[index], [fieldKey]: value };

      if (fieldKey === "comuna" && COMUNAS_REGIONES[value]) {
        list[index].region = COMUNAS_REGIONES[value];
      }

      const next = { ...prev, [listKey]: list };
      if (listKey === "mandatoInmueblesDetalle" && index === 0) {
        next[fieldKey] = value;
        if (fieldKey === "comuna" && COMUNAS_REGIONES[value]) {
          next.region = COMUNAS_REGIONES[value];
        }
      }
      return next;
    });
  };

  const addListItem = (listKey: string, defaultObject: any) => {
    setValores((prev) => ({
      ...prev,
      [listKey]: [
        ...(listKey === "mandatoInmueblesDetalle"
          ? obtenerInmueblesMandato(prev)
          : listKey === "bienesSingularizados"
            ? obtenerBienesMueblesMandato(prev)
            : prev[listKey] || []),
        defaultObject,
      ],
    }));
  };

  const removeListItem = (listKey: string, index: number) => {
    setValores((prev) => {
      const list =
        listKey === "mandatoInmueblesDetalle"
          ? obtenerInmueblesMandato(prev)
          : listKey === "bienesSingularizados"
            ? obtenerBienesMueblesMandato(prev)
            : prev[listKey] || [];

      return {
        ...prev,
        [listKey]: list.filter((_: any, i: number) => i !== index),
      };
    });
  };

  const obtenerErrorDatosSociedad = (): string | null => {
    const tieneValor = (valor: unknown) =>
      valor !== undefined && valor !== null && String(valor).trim() !== "";
    const capital = Number(valores.capitalSociedad);

    if (
      !tieneValor(valores.nombreSociedad) ||
      !tieneValor(valores.tipoSociedad) ||
      !tieneValor(valores.actividadSociedad) ||
      !tieneValor(valores.capitalSociedad) ||
      !tieneValor(valores.duracionSociedad) ||
      !tieneValor(valores.domicilioSociedad)
    ) {
      return "Completa todos los datos de la sociedad antes de continuar.";
    }
    if (
      debePedirAdministradorSociedad(valores.tipoSociedad) &&
      !tieneValor(valores.administradorSociedad)
    ) {
      return "Indica quién administrará o representará a la sociedad.";
    }
    if (!Number.isFinite(capital) || capital <= 0) {
      return "Ingresa un capital mayor a $0.";
    }
    if (
      (valores.tipoSociedad === "spa" || valores.tipoSociedad === "sa") &&
      (!tieneValor(valores.cantidadAcciones) || Number(valores.cantidadAcciones) <= 0)
    ) {
      return "Ingresa una cantidad de acciones mayor a 0.";
    }
    return null;
  };

  const isFormValido = () => {
    const tieneValor = (val: any) => val !== undefined && val !== null && String(val).trim() !== "";

    if (isGroupInmueble()) {
      if (
        !tieneValor(valores.direccion) ||
        !tieneValor(valores.comuna) ||
        !tieneValor(valores.region) ||
        !tieneValor(valores.tipoAdquisicion) ||
        !tieneValor(valores.tipoTitularidadInmueble)
      ) {
        return false;
      }
      const tipo = valores.tipoAdquisicion || "";
      if (
        (tipo.includes("subsidio") || tipo.includes("Subsidio")) &&
        !tieneValor(valores.anioSubsidio)
      ) {
        return false;
      }
      if (
        (tipo.includes("herencia") || tipo.includes("Herencia")) &&
        !tieneValor(valores.cantidadHerederos)
      ) {
        return false;
      }
      return true;
    }

    if (isGroupHereditarios()) {
      if (!tieneValor(valores.cantidadHerederos)) return false;
      const lista = valores.inmueblesHeredados || [];
      if (lista.length === 0) return false;
      for (const item of lista) {
        if (!tieneValor(item.direccion) || !tieneValor(item.comuna) || !tieneValor(item.region)) {
          return false;
        }
      }
      return true;
    }

    if (isGroupVehiculo() || isGroupPrenda()) {
      const datosBaseCompletos =
        tieneValor(valores.patente) &&
        tieneValor(valores.permisoAlDia) &&
        tieneValor(valores.prenda);

      if (!datosBaseCompletos) return false;
      if (!esContratoTransferenciaVehiculo(nombreContrato)) return true;
      return evaluacionPrendaCompleta(valores);
    }

    if (esConstitucionSociedad()) {
      return obtenerErrorDatosSociedad() === null;
    }

    if (isGroupAcciones()) {
      return datosAccionesCompletos(valores);
    }

    if (isGroupLiquidacion()) {
      if (!tieneValor(valores.comproInmueble) || !tieneValor(valores.comproVehiculo)) {
        return false;
      }
      if (valores.comproInmueble === "si") {
        const lista = valores.liquidacionInmuebles || [];
        if (lista.length === 0) return false;
        for (const item of lista) {
          if (!tieneValor(item.direccion) || !tieneValor(item.comuna) || !tieneValor(item.region)) {
            return false;
          }
        }
      }
      if (valores.comproVehiculo === "si") {
        const lista = valores.liquidacionVehiculos || [];
        if (lista.length === 0) return false;
        for (const item of lista) {
          if (
            !tieneValor(item.patente) ||
            !tieneValor(item.permisoAlDia) ||
            !tieneValor(item.prenda)
          ) {
            return false;
          }
        }
      }
      return true;
    }

    if (isGroupBienesMuebles()) {
      const lista = obtenerBienesMueblesMandato(valores);
      if (lista.length === 0) return false;
      for (const item of lista) {
        if (
          !tieneValor(item.cantidad) ||
          Number(item.cantidad) <= 0 ||
          !tieneValor(item.tipoBien) ||
          !tieneValor(item.marca) ||
          !tieneValor(item.color)
        ) {
          return false;
        }
      }
      return true;
    }

    if (isGroupAllegado() || isGroupArriendo() || isGroupHipoteca()) {
      return (
        tieneValor(valores.direccion) && tieneValor(valores.comuna) && tieneValor(valores.region)
      );
    }

    if (esMandato()) {
      const hasInmuebles = valores.mandatoInmuebles === true;
      const hasVehiculos = valores.mandatoVehiculos === true;
      const hasMuebles = valores.mandatoMuebles === true;
      const hasAcciones = valores.mandatoAcciones === true;

      if (!hasInmuebles && !hasVehiculos && !hasMuebles && !hasAcciones) {
        return false;
      }
      if (hasInmuebles) {
        const inmuebles = obtenerInmueblesMandato(valores);
        for (const inmueble of inmuebles) {
          if (
            !tieneValor(inmueble.direccion) ||
            !tieneValor(inmueble.comuna) ||
            !tieneValor(inmueble.region)
          ) {
            return false;
          }
        }
      }
      if (hasVehiculos) {
        if (
          !tieneValor(valores.patente) ||
          !tieneValor(valores.permisoAlDia) ||
          !tieneValor(valores.prenda)
        ) {
          return false;
        }
      }
      if (hasMuebles) {
        for (const mueble of obtenerBienesMueblesMandato(valores)) {
          if (
            !tieneValor(mueble.cantidad) ||
            !tieneValor(mueble.tipoBien) ||
            !tieneValor(mueble.marca) ||
            !tieneValor(mueble.color)
          ) {
            return false;
          }
        }
      }
      if (hasAcciones && !datosAccionesCompletos(valores)) {
        return false;
      }
      return true;
    }

    if (isGroupPatente()) {
      return (
        tieneValor(valores.tipoPatente) &&
        tieneValor(valores.municipalidad) &&
        tieneValor(valores.formaConstitucionSociedadPatente)
      );
    }

    if (isGroupEstablecimiento()) {
      if (!tieneValor(valores.tieneArriendo) || !tieneValor(valores.tienePatente)) {
        return false;
      }
      if (valores.tieneArriendo === "si") {
        if (
          !tieneValor(valores.direccion) ||
          !tieneValor(valores.comuna) ||
          !tieneValor(valores.region)
        ) {
          return false;
        }
      }
      if (valores.tienePatente === "si") {
        if (!tieneValor(valores.tipoPatente) || !tieneValor(valores.municipalidad)) {
          return false;
        }
      }
      return true;
    }

    if (isGroupMatrimonial()) {
      return true;
    }

    // Fallback
    for (const campo of gestion.camposEspecificos) {
      if (!tieneValor(valores[campo.nombre])) {
        return false;
      }
    }
    return true;
  };

  function handleGuardar() {
    if (soloLectura) {
      onSiguiente();
      return;
    }

    if (!isFormValido() && !validarCampos()) {
      return;
    }

    let esValido = true;
    let mensajeError = "Por favor, completa todos los campos obligatorios antes de continuar.";

    const tieneValor = (val: any) => val !== undefined && val !== null && String(val).trim() !== "";

    if (isGroupInmueble()) {
      if (
        !tieneValor(valores.direccion) ||
        !tieneValor(valores.comuna) ||
        !tieneValor(valores.region) ||
        !tieneValor(valores.tipoAdquisicion) ||
        !tieneValor(valores.tipoTitularidadInmueble)
      ) {
        esValido = false;
      }
      const tipo = valores.tipoAdquisicion || "";
      if (
        (tipo.includes("subsidio") || tipo.includes("Subsidio")) &&
        !tieneValor(valores.anioSubsidio)
      ) {
        esValido = false;
        mensajeError = "Debes indicar el año de utilización del subsidio.";
      }
      if (
        (tipo.includes("herencia") || tipo.includes("Herencia")) &&
        !tieneValor(valores.cantidadHerederos)
      ) {
        esValido = false;
        mensajeError = "Debes indicar la cantidad de herederos.";
      }
    } else if (isGroupHereditarios()) {
      if (!tieneValor(valores.cantidadHerederos)) {
        esValido = false;
      }
      const lista = valores.inmueblesHeredados || [];
      if (lista.length === 0) {
        esValido = false;
        mensajeError = "Debes agregar al menos un inmueble heredado.";
      } else {
        for (const item of lista) {
          if (!tieneValor(item.direccion) || !tieneValor(item.comuna) || !tieneValor(item.region)) {
            esValido = false;
            mensajeError =
              "Por favor, completa la dirección, comuna y región de todos los inmuebles heredados.";
          }
        }
      }
    } else if (isGroupVehiculo() || isGroupPrenda()) {
      if (
        !tieneValor(valores.patente) ||
        !tieneValor(valores.permisoAlDia) ||
        !tieneValor(valores.prenda)
      ) {
        esValido = false;
      }
      if (
        esValido &&
        esContratoTransferenciaVehiculo(nombreContrato) &&
        !evaluacionPrendaCompleta(valores)
      ) {
        esValido = false;
        mensajeError = "Completa la información sobre la prenda antes de guardar.";
      }
    } else if (esConstitucionSociedad()) {
      const errorDatosSociedad = obtenerErrorDatosSociedad();
      if (errorDatosSociedad) {
        esValido = false;
        mensajeError = errorDatosSociedad;
      }
    } else if (isGroupAcciones()) {
      if (!datosAccionesCompletos(valores)) {
        esValido = false;
        mensajeError =
          "Completa la razón social, el RUT, el tipo societario y la participación que transferirás.";
      }
    } else if (isGroupLiquidacion()) {
      if (!tieneValor(valores.comproInmueble) || !tieneValor(valores.comproVehiculo)) {
        esValido = false;
      } else {
        if (valores.comproInmueble === "si") {
          const lista = valores.liquidacionInmuebles || [];
          if (lista.length === 0) {
            esValido = false;
            mensajeError = "Debes agregar al menos un inmueble a liquidar.";
          } else {
            for (const item of lista) {
              if (
                !tieneValor(item.direccion) ||
                !tieneValor(item.comuna) ||
                !tieneValor(item.region)
              ) {
                esValido = false;
                mensajeError =
                  "Por favor, completa la dirección, comuna y región de todos los inmuebles a liquidar.";
              }
            }
          }
        }
        if (valores.comproVehiculo === "si") {
          const lista = valores.liquidacionVehiculos || [];
          if (lista.length === 0) {
            esValido = false;
            mensajeError = "Debes agregar al menos un vehículo a liquidar.";
          } else {
            for (const item of lista) {
              if (
                !tieneValor(item.patente) ||
                !tieneValor(item.permisoAlDia) ||
                !tieneValor(item.prenda)
              ) {
                esValido = false;
                mensajeError =
                  "Por favor, completa la patente, permiso y prenda de todos los vehículos a liquidar.";
              }
            }
          }
        }
      }
    } else if (isGroupBienesMuebles()) {
      const lista = obtenerBienesMueblesMandato(valores);
      if (lista.length === 0) {
        esValido = false;
        mensajeError = "Debes agregar al menos un bien mueble.";
      } else {
        for (const item of lista) {
          if (
            !tieneValor(item.cantidad) ||
            Number(item.cantidad) <= 0 ||
            !tieneValor(item.tipoBien) ||
            !tieneValor(item.marca) ||
            !tieneValor(item.color)
          ) {
            esValido = false;
            mensajeError = "Por favor, completa todos los campos de los bienes muebles agregados.";
          }
        }
      }
    } else if (isGroupAllegado() || isGroupArriendo() || isGroupHipoteca()) {
      if (
        !tieneValor(valores.direccion) ||
        !tieneValor(valores.comuna) ||
        !tieneValor(valores.region)
      ) {
        esValido = false;
      }
    } else if (esMandato()) {
      const hasInmuebles = valores.mandatoInmuebles === true;
      const hasVehiculos = valores.mandatoVehiculos === true;
      const hasMuebles = valores.mandatoMuebles === true;
      const hasAcciones = valores.mandatoAcciones === true;

      if (!hasInmuebles && !hasVehiculos && !hasMuebles && !hasAcciones) {
        esValido = false;
        mensajeError = "Debes seleccionar al menos un tipo de bien para el mandato.";
      } else {
        if (hasInmuebles) {
          const inmuebles = obtenerInmueblesMandato(valores);
          for (const inmueble of inmuebles) {
            if (
              !tieneValor(inmueble.direccion) ||
              !tieneValor(inmueble.comuna) ||
              !tieneValor(inmueble.region)
            ) {
              esValido = false;
              mensajeError =
                "Por favor, completa la dirección, comuna y región de todos los inmuebles.";
              break;
            }
          }
        }
        if (hasVehiculos) {
          if (
            !tieneValor(valores.patente) ||
            !tieneValor(valores.permisoAlDia) ||
            !tieneValor(valores.prenda)
          ) {
            esValido = false;
            mensajeError =
              "Por favor, completa la patente, permiso y prenda del vehículo del mandato.";
          }
        }
        if (hasMuebles) {
          for (const mueble of obtenerBienesMueblesMandato(valores)) {
            if (
              !tieneValor(mueble.cantidad) ||
              !tieneValor(mueble.tipoBien) ||
              !tieneValor(mueble.marca) ||
              !tieneValor(mueble.color)
            ) {
              esValido = false;
              mensajeError =
                "Por favor, completa la cantidad, tipo, marca y color de todos los bienes muebles.";
              break;
            }
          }
        }
        if (hasAcciones && !datosAccionesCompletos(valores)) {
          esValido = false;
          mensajeError =
            "Completa la razón social, el RUT, el tipo societario y la participación que transferirás.";
        }
      }
    } else if (isGroupPatente()) {
      if (
        !tieneValor(valores.tipoPatente) ||
        !tieneValor(valores.municipalidad) ||
        !tieneValor(valores.formaConstitucionSociedadPatente)
      ) {
        esValido = false;
        mensajeError =
          "Completa los datos de la patente e indica cómo fue constituida la sociedad.";
      }
    } else if (isGroupEstablecimiento()) {
      if (!tieneValor(valores.tieneArriendo) || !tieneValor(valores.tienePatente)) {
        esValido = false;
      } else {
        if (valores.tieneArriendo === "si") {
          if (
            !tieneValor(valores.direccion) ||
            !tieneValor(valores.comuna) ||
            !tieneValor(valores.region)
          ) {
            esValido = false;
            mensajeError =
              "Por favor, completa la dirección, comuna y región del local de arriendo.";
          }
        }
        if (valores.tienePatente === "si") {
          if (!tieneValor(valores.tipoPatente) || !tieneValor(valores.municipalidad)) {
            esValido = false;
            mensajeError = "Por favor, completa el tipo de patente y la municipalidad.";
          }
        }
      }
    } else if (isGroupMatrimonial()) {
      esValido = true;
    } else {
      // Fallback
      for (const campo of gestion.camposEspecificos) {
        if (!tieneValor(valores[campo.nombre])) {
          esValido = false;
        }
      }
    }

    if (!esValido) {
      toast.warning(mensajeError);
      return;
    }

    const valoresParaGuardar = { ...valores };
    delete valoresParaGuardar.porcentajeDerechosSociales;

    if (
      debeGuardarEstadoTransferenciaVehiculo(
        nombreContrato,
        valoresParaGuardar.permisoAlDia,
        valoresParaGuardar,
      )
    ) {
      guardarEstadoTransferenciaBloqueada(gestion.id, valoresParaGuardar);
      toast.success("Estado guardado");
      onVolverAlPortal();
      return;
    }

    if (
      esContratoTransferenciaVehiculo(nombreContrato) &&
      puedeGuardarEsperaPrenda(valoresParaGuardar)
    ) {
      guardarGestionEnEsperaAlzamiento(gestion.id, valoresParaGuardar);
      toast.success("Gestión guardada en espera del alzamiento");
      onVolverAlPortal();
      return;
    }

    completarDatosEspecificos(gestion.id, valoresParaGuardar);
    toast.success("Datos específicos del bien guardados exitosamente");
    onSiguiente();
  }

  // --- Mapeos Lógicos de Contratos ---
  const isGroupInmueble = () => {
    const norm = normalizar(nombreContrato);
    return (
      (norm.includes("inmueble") ||
        norm.includes("cesion de derechos") ||
        norm.includes("nuda propiedad") ||
        norm.includes("aporte inmobiliario srl")) &&
      !norm.includes("hereditarios") &&
      !norm.includes("sociedad conyugal")
    );
  };

  const isGroupHereditarios = () => normalizar(nombreContrato).includes("hereditarios");

  const isGroupVehiculo = () => normalizar(nombreContrato).includes("vehiculo");

  const esConstitucionSociedad = () =>
    normalizar(nombreContrato).includes("constitucion de sociedad");

  const isGroupAcciones = () => {
    const norm = normalizar(nombreContrato);
    return norm.includes("acciones");
  };

  const isGroupLiquidacion = () =>
    normalizar(nombreContrato).includes("liquidacion de sociedad conyugal") ||
    (typeof valores.tipoContratoOriginal === "string" &&
      normalizar(valores.tipoContratoOriginal).includes("liquidacion de sociedad conyugal"));

  const isGroupBienesMuebles = () => normalizar(nombreContrato).includes("bienes muebles");

  const isGroupAllegado = () => normalizar(nombreContrato).includes("allegado");

  const isGroupArriendo = () => {
    const norm = normalizar(nombreContrato);
    return (
      norm.includes("arriendo") && !norm.includes("establecimiento") && !norm.includes("llaves")
    );
  };

  const esMandato = () => normalizar(nombreContrato).includes("mandato");

  const isGroupPatente = () => normalizar(nombreContrato).includes("patente comercial");

  const isGroupEstablecimiento = () => {
    const norm = normalizar(nombreContrato);
    return norm.includes("establecimiento") || norm.includes("derecho de llaves");
  };

  const isGroupHipoteca = () => normalizar(nombreContrato).includes("hipoteca");

  const isGroupPrenda = () => normalizar(nombreContrato).includes("prenda");

  const isGroupMatrimonial = () => {
    const norm = normalizar(nombreContrato);
    return norm.includes("regimen matrimonial") || norm.includes("pacto");
  };

  // Inicializadores de listas
  const inmueblesHeredados = valores.inmueblesHeredados || [
    { direccion: "", comuna: "", region: "" },
  ];
  const liquidacionInmuebles = valores.liquidacionInmuebles || [
    { direccion: "", comuna: "", region: "" },
  ];
  const liquidacionVehiculos = valores.liquidacionVehiculos || [
    { patente: "", permisoAlDia: "", prenda: "" },
  ];
  const bienesSingularizados = obtenerBienesMueblesMandato(valores);
  const presentacionBienesMuebles = obtenerPresentacionBienesMuebles(nombreContrato);
  const mandatoInmueblesDetalle = obtenerInmueblesMandato(valores);
  const tipoAdquisicion =
    typeof valores.tipoAdquisicion === "string" ? valores.tipoAdquisicion : "";
  const tipoContratoOriginal =
    typeof valores.tipoContratoOriginal === "string" ? valores.tipoContratoOriginal : "";
  const muestraRutaAdquisicion =
    isGroupInmueble() || (isGroupHereditarios() && Boolean(tipoContratoOriginal));
  const muestraDatosInmueble =
    isGroupInmueble() &&
    Boolean(tipoAdquisicion) &&
    !esAdquisicionPorHerencia(tipoAdquisicion) &&
    (valores.tipoTitularidadInmueble === "propiedadExclusiva" ||
      valores.tipoTitularidadInmueble === "copropiedad");

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={contenedorFormularioRef}
        className="rounded-xl border border-black/[0.04] bg-white p-6 sm:p-8 shadow-xs"
      >
        <div className="mb-6">
          <h2 id="titulo-datos-especificos" className="text-lg font-semibold text-slate-800">
            {presentacionBienesMuebles
              ? presentacionBienesMuebles.titulo
              : esConstitucionSociedad()
                ? "Datos de la sociedad"
                : esMandato()
                  ? "Bienes del mandato"
                  : "Datos del bien"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {presentacionBienesMuebles ? (
              <DescripcionInventarioBienes descripcion={presentacionBienesMuebles.descripcion} />
            ) : esConstitucionSociedad() ? (
              "Completa los datos que usaremos para definir la sociedad."
            ) : esMandato() ? (
              "Selecciona los bienes que quieres incluir y completa sus antecedentes."
            ) : (
              "Completa los antecedentes del bien o derecho asociado a este contrato."
            )}
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

          <div className="space-y-6">
            {muestraRutaAdquisicion && (
              <section className="space-y-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <div className="grid gap-1.5">
                  <Label htmlFor="tipoAdquisicion">¿Cómo adquiriste la propiedad?</Label>
                  <Select value={tipoAdquisicion} onValueChange={handleTipoAdquisicionChange}>
                    <SelectTrigger id="tipoAdquisicion">
                      <SelectValue placeholder="Selecciona el tipo de adquisición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin-credito">Comprada sin crédito hipotecario</SelectItem>
                      <SelectItem value="con-credito">Comprada con crédito hipotecario</SelectItem>
                      <SelectItem value="subsidio">Comprada con subsidio</SelectItem>
                      <SelectItem value="subsidio-hipotecario">
                        Comprada con subsidio e hipotecario
                      </SelectItem>
                      <SelectItem value="herencia-inscrita">
                        Herencia con posesión efectiva inscrita
                      </SelectItem>
                      <SelectItem value="herencia-no-inscrita">
                        Herencia sin posesión efectiva inscrita
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(tipoAdquisicion === "subsidio" || tipoAdquisicion === "subsidio-hipotecario") && (
                  <div className="grid gap-1.5 animate-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="anioSubsidio">Año de utilización del subsidio</Label>
                    <Input
                      id="anioSubsidio"
                      type="number"
                      placeholder="Ej: 2021"
                      value={valores.anioSubsidio ?? ""}
                      onChange={(e) => handleFieldChange("anioSubsidio", e.target.value)}
                    />
                  </div>
                )}

                {tipoAdquisicion && !esAdquisicionPorHerencia(tipoAdquisicion) && (
                  <fieldset className="animate-in slide-in-from-top-2 duration-200">
                    <legend className="text-sm font-medium text-slate-800">
                      ¿Eres la única persona propietaria del inmueble?
                    </legend>
                    <RadioGroup
                      value={valores.tipoTitularidadInmueble ?? ""}
                      onValueChange={handleTipoTitularidadChange}
                      className="mt-3 gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="propiedadExclusiva" id="propiedad-exclusiva" />
                        <Label
                          htmlFor="propiedad-exclusiva"
                          className="cursor-pointer font-normal text-slate-700"
                        >
                          Sí, soy la única persona propietaria
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="copropiedad" id="copropiedad" />
                        <Label
                          htmlFor="copropiedad"
                          className="cursor-pointer font-normal text-slate-700"
                        >
                          No, hay más propietarios
                        </Label>
                      </div>
                    </RadioGroup>
                  </fieldset>
                )}

                {tipoContratoOriginal && gestion.nombre !== tipoContratoOriginal && (
                  <p
                    role="status"
                    className="rounded-lg border border-info/20 bg-info/10 px-3 py-2.5 text-sm text-info"
                  >
                    {esAdquisicionPorHerencia(tipoAdquisicion) ? (
                      <>
                        Prepararemos una{" "}
                        <strong className="font-semibold">Cesión de derechos hereditarios</strong>,
                        el contrato que permite transferir tus derechos sobre una propiedad
                        heredada.
                      </>
                    ) : (
                      <>
                        Prepararemos una{" "}
                        <strong className="font-semibold">Cesión de derechos</strong>, el contrato
                        que permite transferir tu parte de la propiedad.
                      </>
                    )}
                  </p>
                )}
              </section>
            )}

            {/* ── GRUPO 1: Inmueble General ── */}
            {muestraDatosInmueble && (
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Ej: Av. Providencia 1234, Depto 501"
                    value={valores.direccion ?? ""}
                    onChange={(e) => handleFieldChange("direccion", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 items-start gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Input
                      id="comuna"
                      list="comunas-chile"
                      placeholder="Escribe para buscar..."
                      value={valores.comuna ?? ""}
                      onChange={(e) => handleFieldChange("comuna", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="region">Región</Label>
                    <Input
                      id="region"
                      placeholder="Región administrativa"
                      value={valores.region ?? ""}
                      onChange={(e) => handleFieldChange("region", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── GRUPO 2: Cesión de derechos hereditarios ── */}
            {isGroupHereditarios() && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="cantidadHerederos">Cantidad total de herederos</Label>
                    <Input
                      id="cantidadHerederos"
                      type="number"
                      placeholder="Ej: 4"
                      value={valores.cantidadHerederos ?? ""}
                      onChange={(e) => handleFieldChange("cantidadHerederos", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-800">
                    Inmuebles Heredados
                  </Label>
                  {inmueblesHeredados.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 relative space-y-3"
                    >
                      {idx > 0 && (
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-xs text-rose-500 font-medium hover:underline"
                          onClick={() => removeListItem("inmueblesHeredados", idx)}
                        >
                          Eliminar
                        </button>
                      )}
                      <div className="grid gap-1.5">
                        <Label>Dirección del Inmueble {idx + 1}</Label>
                        <Input
                          placeholder="Dirección completa"
                          value={item.direccion ?? ""}
                          onChange={(e) =>
                            handleListFieldChange(
                              "inmueblesHeredados",
                              idx,
                              "direccion",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 items-start gap-4">
                        <div className="grid gap-1.5">
                          <Label>Comuna</Label>
                          <Input
                            list="comunas-chile"
                            placeholder="Comuna"
                            value={item.comuna ?? ""}
                            onChange={(e) =>
                              handleListFieldChange(
                                "inmueblesHeredados",
                                idx,
                                "comuna",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Región</Label>
                          <Input
                            placeholder="Región"
                            value={item.region ?? ""}
                            onChange={(e) =>
                              handleListFieldChange(
                                "inmueblesHeredados",
                                idx,
                                "region",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-dashed"
                    onClick={() =>
                      addListItem("inmueblesHeredados", { direccion: "", comuna: "", region: "" })
                    }
                  >
                    + Agregar otro inmueble heredado
                  </Button>
                </div>
              </div>
            )}

            {/* ── GRUPO 3: Vehículos ── */}
            {(isGroupVehiculo() || isGroupPrenda()) && !isGroupLiquidacion() && (
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="patente">Placa patente</Label>
                  <Input
                    id="patente"
                    placeholder="Ej: AB CD 12"
                    value={valores.patente ?? ""}
                    onChange={(e) => handleFieldChange("patente", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="permisoAlDia">Permiso de circulación al día</Label>
                  <Select
                    value={valores.permisoAlDia ?? ""}
                    onValueChange={(val) => handleFieldChange("permisoAlDia", val)}
                  >
                    <SelectTrigger id="permisoAlDia">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="contents">
                  <div className="grid gap-1.5">
                    <Label htmlFor="prenda">
                      {isGroupVehiculo()
                        ? "¿El vehículo tiene una prenda vigente?"
                        : "Tiene prenda vigente"}
                    </Label>
                    <Select
                      value={valores.prenda ?? ""}
                      onValueChange={(val) => handleFieldChange("prenda", val)}
                    >
                      <SelectTrigger id="prenda">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {permisoCirculacionBloqueaTransferencia(nombreContrato, valores.permisoAlDia) && (
                    <div
                      role="alert"
                      className="order-last rounded-lg border border-warning/25 bg-warning/[0.02] p-4 sm:col-span-2"
                    >
                      <h3 className="text-sm font-semibold text-foreground">
                        El permiso de circulación debe estar al día
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        No se puede realizar la transferencia en el Registro Civil mientras el
                        permiso de circulación esté vencido.
                      </p>
                    </div>
                  )}

                  {isGroupVehiculo() && valores.prenda === "si" && (
                    <>
                      <div className="grid gap-1.5">
                        <Label htmlFor="cuotasPendientesPrenda">
                          ¿Cuántas cuotas faltan por pagar?
                        </Label>
                        <Select
                          value={valores.cuotasPendientesPrenda ?? ""}
                          onValueChange={(val) => handleFieldChange("cuotasPendientesPrenda", val)}
                        >
                          <SelectTrigger id="cuotasPendientesPrenda">
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 cuota</SelectItem>
                            <SelectItem value="2">2 cuotas</SelectItem>
                            <SelectItem value="3">3 cuotas</SelectItem>
                            <SelectItem value="masDe3">Más de 3 cuotas</SelectItem>
                            <SelectItem value="deudaPagada">La deuda ya está pagada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {valores.cuotasPendientesPrenda !== "deudaPagada" && (
                        <div className="grid gap-1.5">
                          <Label htmlFor="deudaPrendaAlDia">
                            ¿Las cuotas pendientes están al día?
                          </Label>
                          <Select
                            value={valores.deudaPrendaAlDia ?? ""}
                            onValueChange={(val) => handleFieldChange("deudaPrendaAlDia", val)}
                          >
                            <SelectTrigger id="deudaPrendaAlDia">
                              <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="si">Sí</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {resolverEstadoPrendaVehiculo(valores) === "esperaAlzamiento" && (
                        <div
                          role="status"
                          className="rounded-lg border border-primary/15 bg-primary/[0.02] p-4 sm:col-span-2"
                        >
                          <h3 className="text-sm font-semibold text-foreground">
                            Podemos esperar para continuar
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {`Como te quedan ${valores.cuotasPendientesPrenda} ${
                              valores.cuotasPendientesPrenda === "1" ? "cuota" : "cuotas"
                            } y todas están al día, guardaremos la gestión. Podremos continuar cuando termines de pagar y la prenda haya sido alzada.`}
                          </p>
                        </div>
                      )}

                      {resolverEstadoPrendaVehiculo(valores) === "bloqueadoPorMora" && (
                        <div
                          role="alert"
                          className="rounded-lg border border-warning/25 bg-warning/[0.02] p-4 sm:col-span-2"
                        >
                          <h3 className="text-sm font-semibold text-foreground">
                            Primero debes regularizar los pagos
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            No podemos avanzar con la transferencia mientras la deuda asociada a la
                            prenda tenga cuotas atrasadas.
                          </p>
                        </div>
                      )}

                      {resolverEstadoPrendaVehiculo(valores) === "bloqueadoPorPlazo" && (
                        <div
                          role="alert"
                          className="rounded-lg border border-warning/25 bg-warning/[0.02] p-4 sm:col-span-2"
                        >
                          <h3 className="text-sm font-semibold text-foreground">
                            Esta transferencia no se puede realizar
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            No se puede continuar con la transferencia porque el vehículo tiene más
                            de 3 cuotas pendientes.
                          </p>
                        </div>
                      )}

                      {resolverEstadoPrendaVehiculo(valores) === "bloqueadoPorPlazoYMora" && (
                        <div
                          role="alert"
                          className="rounded-lg border border-warning/25 bg-warning/[0.02] p-4 sm:col-span-2"
                        >
                          <h3 className="text-sm font-semibold text-foreground">
                            Esta transferencia no se puede realizar
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            No se puede continuar con la transferencia porque el vehículo tiene más
                            de 3 cuotas pendientes y, además, existen pagos atrasados.
                          </p>
                        </div>
                      )}

                      {resolverEstadoPrendaVehiculo(valores) === "bloqueadoPorAlzamiento" && (
                        <div
                          role="alert"
                          className="rounded-lg border border-warning/25 bg-warning/[0.02] p-4 sm:col-span-2"
                        >
                          <h3 className="text-sm font-semibold text-foreground">
                            La prenda todavía debe ser alzada
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            Aunque la deuda esté pagada, no podemos realizar la transferencia
                            mientras la prenda continúe vigente.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── GRUPO 4: Constitución de sociedad ── */}
            {esConstitucionSociedad() && (
              <div className="grid gap-5">
                <div className="grid gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="nombreSociedad">Nombre de la sociedad</Label>
                    <AyudaCampo label="el nombre de la sociedad">
                      Es la razón social. Debe terminar con el tipo elegido: E.I.R.L., SpA, S.A. o
                      Limitada.
                    </AyudaCampo>
                  </div>
                  <Input
                    id="nombreSociedad"
                    placeholder="Ej: Inversiones Los Andes SpA"
                    value={valores.nombreSociedad ?? ""}
                    onChange={(e) => handleFieldChange("nombreSociedad", e.target.value)}
                  />
                </div>

                <fieldset className="grid gap-3">
                  <legend className="text-sm font-medium text-slate-800">
                    <span className="inline-flex items-center gap-1.5">
                      Tipo de sociedad
                      <AyudaCampo label="los tipos de sociedad">
                        La diferencia principal está en quiénes serán dueños y cómo se dividirá su
                        participación.
                      </AyudaCampo>
                    </span>
                  </legend>
                  <RadioGroup
                    value={valores.tipoSociedad ?? ""}
                    onValueChange={(valor) => handleFieldChange("tipoSociedad", valor)}
                    className="grid items-start gap-3 sm:grid-cols-2"
                  >
                    {[
                      {
                        value: "eirl",
                        label: "E.I.R.L.",
                        description: "Para emprender tú solo, sin socios.",
                      },
                      {
                        value: "spa",
                        label: "SpA",
                        description:
                          "Para una o más personas, con participación mediante acciones.",
                      },
                      {
                        value: "sa",
                        label: "S.A.",
                        description: "Para accionistas, con administración mediante un directorio.",
                      },
                      {
                        value: "limitada",
                        label: "Limitada (SRL)",
                        description: "Para 2 a 50 socios, con participación mediante porcentajes.",
                      },
                    ].map((opcion) => (
                      <div
                        key={opcion.value}
                        className={`flex items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${
                          valores.tipoSociedad === opcion.value
                            ? "border-primary/40 bg-primary/[0.04]"
                            : "border-slate-200"
                        }`}
                      >
                        <RadioGroupItem
                          value={opcion.value}
                          id={`tipo-sociedad-${opcion.value}`}
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={`tipo-sociedad-${opcion.value}`}
                          className="min-w-0 flex-1 cursor-pointer font-normal"
                        >
                          <span className="block font-medium text-slate-800">{opcion.label}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                            {opcion.description}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </fieldset>

                <div className="grid gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="actividadSociedad">¿A qué se dedicará la sociedad?</Label>
                    <AyudaCampo label="la actividad de la sociedad">
                      Cuéntanos qué productos venderá o qué servicios prestará. Puedes escribirlo
                      con tus propias palabras.
                    </AyudaCampo>
                  </div>
                  <Input
                    id="actividadSociedad"
                    placeholder="Por ejemplo: Venta de zapatos y accesorios"
                    value={valores.actividadSociedad ?? ""}
                    onChange={(e) => handleFieldChange("actividadSociedad", e.target.value)}
                  />
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="capitalSociedad">Capital (CLP)</Label>
                    <AyudaCampo label="el capital de la sociedad">
                      Es el monto con que contará la sociedad para realizar sus actividades y
                      negocios. Por ejemplo, $1.000.000.
                    </AyudaCampo>
                  </div>
                  <Input
                    id="capitalSociedad"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    placeholder="Ej: 1000000"
                    value={valores.capitalSociedad ?? ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "capitalSociedad",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  />
                </div>

                {(valores.tipoSociedad === "spa" || valores.tipoSociedad === "sa") && (
                  <div className="grid gap-1.5 animate-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="cantidadAcciones">Cantidad de acciones</Label>
                    <Input
                      id="cantidadAcciones"
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      placeholder="Ej: 100"
                      value={valores.cantidadAcciones ?? ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "cantidadAcciones",
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                    <p className="text-xs leading-relaxed text-slate-500">
                      El capital de la sociedad se dividirá en esta cantidad de acciones.
                    </p>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="duracionSociedad">Duración de la sociedad</Label>
                    <AyudaCampo label="la duración de la sociedad">
                      Es el tiempo durante el cual existirá la sociedad. Puede ser indefinida o
                      tener un plazo determinado, por ejemplo, 5 años.
                    </AyudaCampo>
                  </div>
                  <Input
                    id="duracionSociedad"
                    placeholder="Ej: Indefinida"
                    value={valores.duracionSociedad ?? ""}
                    onChange={(e) => handleFieldChange("duracionSociedad", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="domicilioSociedad">Domicilio de la sociedad</Label>
                    <AyudaCampo label="el domicilio de la sociedad">
                      Es la ciudad o comuna que figurará como sede legal de la sociedad. No ingreses
                      tu domicilio particular.
                    </AyudaCampo>
                  </div>
                  <Input
                    id="domicilioSociedad"
                    placeholder="Ej: Santiago, Región Metropolitana"
                    value={valores.domicilioSociedad ?? ""}
                    onChange={(e) => handleFieldChange("domicilioSociedad", e.target.value)}
                  />
                </div>

                {debePedirAdministradorSociedad(valores.tipoSociedad) && (
                  <div className="grid gap-1.5 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="administradorSociedad">
                        {valores.tipoSociedad === "sa"
                          ? "Quién representará a la sociedad"
                          : "Quién administrará la sociedad"}
                      </Label>
                      <AyudaCampo
                        label={
                          valores.tipoSociedad === "sa"
                            ? "la representación de la sociedad"
                            : "la administración de la sociedad"
                        }
                      >
                        {valores.tipoSociedad === "sa"
                          ? "La S.A. será administrada por un directorio. Aquí necesitamos saber quién actuará como representante."
                          : "Es la persona encargada de llevar adelante los negocios de la sociedad."}
                      </AyudaCampo>
                    </div>
                    <Select
                      value={valores.administradorSociedad ?? ""}
                      onValueChange={(valor) => handleFieldChange("administradorSociedad", valor)}
                    >
                      <SelectTrigger id="administradorSociedad">
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yo">Yo</SelectItem>
                        <SelectItem value="socio">Mi socio</SelectItem>
                        <SelectItem value="otro">Otra persona</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* ── GRUPO 5: Compraventa de acciones ── */}
            {isGroupAcciones() && (
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <div className="flex min-h-6 items-center gap-1.5">
                    <Label htmlFor="razonSocial">Razón social de la empresa</Label>
                    <AyudaCampo label="la razón social de la empresa">
                      Es el nombre legal de la empresa.
                    </AyudaCampo>
                  </div>
                  <Input
                    id="razonSocial"
                    placeholder="Ej: Inversiones Los Andes SpA"
                    value={valores.razonSocial ?? ""}
                    onChange={(e) => handleFieldChange("razonSocial", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="rutEmpresa" className="flex min-h-6 items-center">
                    RUT de la empresa
                  </Label>
                  <Input
                    id="rutEmpresa"
                    placeholder="Ej: 76.123.456-7"
                    value={valores.rutEmpresa ?? ""}
                    onChange={(e) => handleFieldChange("rutEmpresa", e.target.value)}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="tipoSocietarioAcciones" className="flex min-h-6 items-center">
                    Tipo societario
                  </Label>
                  <Select
                    value={valores.tipoSocietarioAcciones ?? ""}
                    onValueChange={(value) => handleFieldChange("tipoSocietarioAcciones", value)}
                  >
                    <SelectTrigger id="tipoSocietarioAcciones">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="srl">SRL</SelectItem>
                      <SelectItem value="spa">SpA</SelectItem>
                      <SelectItem value="sa">S.A.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {valores.tipoSocietarioAcciones === "srl" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="participacion" className="flex min-h-6 items-center">
                      Participación (%)
                    </Label>
                    <Input
                      id="participacion"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Ej: 50"
                      value={valores.participacion ?? ""}
                      onChange={(e) => handleFieldChange("participacion", e.target.value)}
                    />
                  </div>
                )}

                {(valores.tipoSocietarioAcciones === "spa" ||
                  valores.tipoSocietarioAcciones === "sa") && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="numeroAcciones" className="flex min-h-6 items-center">
                      N.º de acciones
                    </Label>
                    <Input
                      id="numeroAcciones"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Ej: 1000"
                      value={valores.numeroAcciones ?? ""}
                      onChange={(e) => handleFieldChange("numeroAcciones", e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── GRUPO 6: Liquidación de Sociedad Conyugal ── */}
            {isGroupLiquidacion() && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 items-start gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="comproInmueble">¿Compró inmuebles durante el matrimonio?</Label>
                    <Select
                      value={valores.comproInmueble ?? ""}
                      onValueChange={(val) => handleBienesLiquidacionChange("comproInmueble", val)}
                    >
                      <SelectTrigger id="comproInmueble">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="comproVehiculo">¿Compró vehículos durante el matrimonio?</Label>
                    <Select
                      value={valores.comproVehiculo ?? ""}
                      onValueChange={(val) => handleBienesLiquidacionChange("comproVehiculo", val)}
                    >
                      <SelectTrigger id="comproVehiculo">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {tipoContratoOriginal &&
                  gestion.nombre !== tipoContratoOriginal &&
                  valores.comproInmueble === "no" &&
                  valores.comproVehiculo === "no" && (
                    <p
                      role="status"
                      className="rounded-lg border border-info/20 bg-info/10 px-3 py-2.5 text-sm text-info"
                    >
                      Como no hay inmuebles ni vehículos que liquidar, prepararemos un{" "}
                      <strong className="font-semibold">
                        Pacto de sustitución de régimen matrimonial
                      </strong>
                      . Con este pacto, tú y tu cónyuge pasarán a separación de bienes para ayudar a
                      proteger el patrimonio que cada uno adquiera en adelante.
                    </p>
                  )}

                {/* Listado dinámico de inmuebles en Liquidación */}
                {valores.comproInmueble === "si" && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <Label className="text-sm font-semibold text-slate-800">
                      Inmuebles a Liquidar
                    </Label>
                    {liquidacionInmuebles.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 relative space-y-3"
                      >
                        {idx > 0 && (
                          <button
                            type="button"
                            className="absolute top-2 right-2 text-xs text-rose-500 font-medium hover:underline"
                            onClick={() => removeListItem("liquidacionInmuebles", idx)}
                          >
                            Eliminar
                          </button>
                        )}
                        <div className="grid gap-1.5">
                          <Label>Dirección del Inmueble {idx + 1}</Label>
                          <Input
                            placeholder="Dirección completa"
                            value={item.direccion ?? ""}
                            onChange={(e) =>
                              handleListFieldChange(
                                "liquidacionInmuebles",
                                idx,
                                "direccion",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 items-start gap-4">
                          <div className="grid gap-1.5">
                            <Label>Comuna</Label>
                            <Input
                              list="comunas-chile"
                              placeholder="Comuna"
                              value={item.comuna ?? ""}
                              onChange={(e) =>
                                handleListFieldChange(
                                  "liquidacionInmuebles",
                                  idx,
                                  "comuna",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Región</Label>
                            <Input
                              placeholder="Región"
                              value={item.region ?? ""}
                              onChange={(e) =>
                                handleListFieldChange(
                                  "liquidacionInmuebles",
                                  idx,
                                  "region",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed"
                      onClick={() =>
                        addListItem("liquidacionInmuebles", {
                          direccion: "",
                          comuna: "",
                          region: "",
                        })
                      }
                    >
                      + Agregar inmueble
                    </Button>
                  </div>
                )}

                {/* Listado dinámico de vehículos en Liquidación */}
                {valores.comproVehiculo === "si" && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <Label className="text-sm font-semibold text-slate-800">
                      Vehículos a Liquidar
                    </Label>
                    {liquidacionVehiculos.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 relative space-y-3"
                      >
                        {idx > 0 && (
                          <button
                            type="button"
                            className="absolute top-2 right-2 text-xs text-rose-500 font-medium hover:underline"
                            onClick={() => removeListItem("liquidacionVehiculos", idx)}
                          >
                            Eliminar
                          </button>
                        )}
                        <div className="grid gap-1.5">
                          <Label>Placa Patente {idx + 1}</Label>
                          <Input
                            placeholder="Ej: AB CD 12"
                            value={item.patente ?? ""}
                            onChange={(e) =>
                              handleListFieldChange(
                                "liquidacionVehiculos",
                                idx,
                                "patente",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 items-start gap-4">
                          <div className="grid gap-1.5">
                            <Label>Permiso al día</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={item.permisoAlDia ?? ""}
                              onChange={(e) =>
                                handleListFieldChange(
                                  "liquidacionVehiculos",
                                  idx,
                                  "permisoAlDia",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Selecciona...</option>
                              <option value="si">Sí</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Prenda</Label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={item.prenda ?? ""}
                              onChange={(e) =>
                                handleListFieldChange(
                                  "liquidacionVehiculos",
                                  idx,
                                  "prenda",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Selecciona...</option>
                              <option value="si">Sí</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed"
                      onClick={() =>
                        addListItem("liquidacionVehiculos", {
                          patente: "",
                          permisoAlDia: "",
                          prenda: "",
                        })
                      }
                    >
                      + Agregar vehículo
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── GRUPO 6: Singularización de bienes muebles ── */}
            {isGroupBienesMuebles() && (
              <section
                className="space-y-4"
                aria-labelledby="titulo-datos-especificos"
                data-validation-group
                data-validation-group-message="Completa los datos faltantes para continuar."
                data-validation-group-message-id="bienes-muebles-mensaje-error"
              >
                {bienesSingularizados.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">Aún no has agregado bienes.</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => addListItem("bienesSingularizados", crearBienMuebleVacio())}
                    >
                      <Plus aria-hidden="true" />
                      Agregar el primer bien
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block">
                      <Table
                        aria-label={presentacionBienesMuebles?.titulo ?? "Bienes muebles"}
                        columns="minmax(200px,2fr) minmax(120px,1fr) minmax(100px,0.8fr) 88px 56px"
                      >
                        <Table.Header>
                          <Table.Cell className="font-semibold text-foreground">
                            Descripción del bien
                          </Table.Cell>
                          <Table.Cell className="font-semibold text-foreground">Marca</Table.Cell>
                          <Table.Cell className="font-semibold text-foreground">Color</Table.Cell>
                          <Table.Cell className="font-semibold text-foreground">
                            Cantidad
                          </Table.Cell>
                          <Table.Cell>
                            <span className="sr-only">Acciones</span>
                          </Table.Cell>
                        </Table.Header>
                        <Table.Content>
                          {bienesSingularizados.map((item: BienMuebleFormulario, idx: number) => (
                            <Table.Row key={item.idBienMueble} className="px-2 py-2">
                              <Table.Cell className="overflow-visible">
                                <Input
                                  aria-label={`Descripción del bien ${idx + 1}`}
                                  placeholder="Televisor 42 pulgadas"
                                  value={item.tipoBien ?? ""}
                                  onChange={(e) =>
                                    handleListFieldChange(
                                      "bienesSingularizados",
                                      idx,
                                      "tipoBien",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Table.Cell>
                              <Table.Cell className="overflow-visible">
                                <Input
                                  aria-label={`Marca del bien ${idx + 1}`}
                                  placeholder="Samsung o sin marca"
                                  value={item.marca ?? ""}
                                  onChange={(e) =>
                                    handleListFieldChange(
                                      "bienesSingularizados",
                                      idx,
                                      "marca",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Table.Cell>
                              <Table.Cell className="overflow-visible">
                                <Input
                                  aria-label={`Color del bien ${idx + 1}`}
                                  placeholder="Negro"
                                  value={item.color ?? ""}
                                  onChange={(e) =>
                                    handleListFieldChange(
                                      "bienesSingularizados",
                                      idx,
                                      "color",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Table.Cell>
                              <Table.Cell className="overflow-visible">
                                <Input
                                  aria-label={`Cantidad del bien ${idx + 1}`}
                                  type="number"
                                  min="1"
                                  inputMode="numeric"
                                  value={item.cantidad ?? 1}
                                  onChange={(e) =>
                                    handleListFieldChange(
                                      "bienesSingularizados",
                                      idx,
                                      "cantidad",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Table.Cell>
                              <Table.Cell className="flex justify-end gap-1 overflow-visible">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Eliminar bien"
                                  aria-label={`Eliminar bien ${idx + 1}`}
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeListItem("bienesSingularizados", idx)}
                                >
                                  <Trash2 aria-hidden="true" />
                                </Button>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Content>
                      </Table>
                    </div>

                    <div className="divide-y divide-border overflow-hidden rounded-md border border-border md:hidden">
                      {bienesSingularizados.map((item: BienMuebleFormulario, idx: number) => {
                        const idBien = String(item.idBienMueble);
                        return (
                          <div
                            key={idBien}
                            role="group"
                            aria-labelledby={`${idBien}-titulo`}
                            className="space-y-4 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <h4
                                id={`${idBien}-titulo`}
                                className="text-sm font-semibold text-foreground"
                              >
                                Bien {idx + 1}
                              </h4>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Eliminar bien ${idx + 1}`}
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeListItem("bienesSingularizados", idx)}
                                >
                                  <Trash2 aria-hidden="true" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid gap-1.5">
                              <Label htmlFor={`${idBien}-tipo`}>Descripción del bien</Label>
                              <Input
                                id={`${idBien}-tipo`}
                                placeholder="Televisor 42 pulgadas"
                                value={item.tipoBien ?? ""}
                                onChange={(e) =>
                                  handleListFieldChange(
                                    "bienesSingularizados",
                                    idx,
                                    "tipoBien",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="grid gap-1.5">
                              <Label htmlFor={`${idBien}-marca`}>Marca</Label>
                              <Input
                                id={`${idBien}-marca`}
                                placeholder="Samsung o sin marca"
                                value={item.marca ?? ""}
                                onChange={(e) =>
                                  handleListFieldChange(
                                    "bienesSingularizados",
                                    idx,
                                    "marca",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 items-start gap-3">
                              <div className="grid gap-1.5">
                                <Label htmlFor={`${idBien}-color`}>Color</Label>
                                <Input
                                  id={`${idBien}-color`}
                                  placeholder="Negro"
                                  value={item.color ?? ""}
                                  onChange={(e) =>
                                    handleListFieldChange(
                                      "bienesSingularizados",
                                      idx,
                                      "color",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label htmlFor={`${idBien}-cantidad`}>Cantidad</Label>
                                <Input
                                  id={`${idBien}-cantidad`}
                                  type="number"
                                  min="1"
                                  inputMode="numeric"
                                  value={item.cantidad ?? 1}
                                  onChange={(e) =>
                                    handleListFieldChange(
                                      "bienesSingularizados",
                                      idx,
                                      "cantidad",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {bienesSingularizados.length > 0 && (
                  <>
                    <div data-validation-group-message-target className="empty:hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed sm:w-auto"
                      onClick={() => addListItem("bienesSingularizados", crearBienMuebleVacio())}
                    >
                      <Plus aria-hidden="true" />
                      Agregar otro bien
                    </Button>
                  </>
                )}
              </section>
            )}

            {/* ── GRUPO 7, 8 y 12: Dirección Simple (Allegado, Arriendo, Hipoteca) ── */}
            {(isGroupAllegado() || isGroupArriendo() || isGroupHipoteca()) && (
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="direccion">Domicilio / Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Ej: Av. Providencia 1234"
                    value={valores.direccion ?? ""}
                    onChange={(e) => handleFieldChange("direccion", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 items-start gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Input
                      id="comuna"
                      list="comunas-chile"
                      placeholder="Buscar comuna..."
                      value={valores.comuna ?? ""}
                      onChange={(e) => handleFieldChange("comuna", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="region">Región</Label>
                    <Input
                      id="region"
                      placeholder="Región"
                      value={valores.region ?? ""}
                      onChange={(e) => handleFieldChange("region", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── GRUPO 9: Mandatos (Shared) ── */}
            {esMandato() && (
              <div className="space-y-8">
                {gestion.gestionOrigenId ? (
                  <section className="rounded-lg border border-info/20 bg-info/10 p-4">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Bien vinculado al contrato principal
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Estos datos vienen prerrellenados. Si los cambias aquí, también se
                      actualizarán en el contrato principal.
                    </p>
                  </section>
                ) : (
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-slate-800">
                      ¿Qué bienes incluirá el mandato?
                    </legend>
                    <p className="text-sm text-slate-500">
                      Selecciona uno o más tipos. Luego completa los datos de cada bien.
                    </p>
                    <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Label
                        htmlFor="m-inmuebles"
                        className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.04]"
                      >
                        <Checkbox
                          id="m-inmuebles"
                          checked={valores.mandatoInmuebles ?? false}
                          onCheckedChange={(val: any) =>
                            handleTipoBienMandatoChange("mandatoInmuebles", val === true)
                          }
                        />
                        <span>Inmuebles</span>
                      </Label>
                      <Label
                        htmlFor="m-vehiculos"
                        className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.04]"
                      >
                        <Checkbox
                          id="m-vehiculos"
                          checked={valores.mandatoVehiculos ?? false}
                          onCheckedChange={(val: any) =>
                            handleTipoBienMandatoChange("mandatoVehiculos", val === true)
                          }
                        />
                        <span>Vehículos</span>
                      </Label>
                      <Label
                        htmlFor="m-muebles"
                        className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.04]"
                      >
                        <Checkbox
                          id="m-muebles"
                          checked={valores.mandatoMuebles ?? false}
                          onCheckedChange={(val: any) =>
                            handleTipoBienMandatoChange("mandatoMuebles", val === true)
                          }
                        />
                        <span>Bienes muebles</span>
                      </Label>
                      <Label
                        htmlFor="m-acciones"
                        className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.04]"
                      >
                        <Checkbox
                          id="m-acciones"
                          checked={valores.mandatoAcciones ?? false}
                          onCheckedChange={(val: any) =>
                            handleTipoBienMandatoChange("mandatoAcciones", val === true)
                          }
                        />
                        <span>Acciones</span>
                      </Label>
                    </div>
                  </fieldset>
                )}

                {/* Sub-formulario Mandato Inmuebles */}
                {valores.mandatoInmuebles && (
                  <section
                    className="space-y-4 animate-in slide-in-from-top-2 duration-200"
                    aria-labelledby="mandato-inmuebles-titulo"
                  >
                    <div>
                      <h3
                        id="mandato-inmuebles-titulo"
                        className="text-base font-semibold text-slate-800"
                      >
                        Inmuebles
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Agrega todos los inmuebles que quedarán incluidos en el mandato.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {mandatoInmueblesDetalle.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5"
                        >
                          <div className="flex min-h-8 items-center justify-between gap-3">
                            <h4 className="font-semibold text-slate-800">Inmueble {idx + 1}</h4>
                            {idx > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-destructive"
                                onClick={() => removeListItem("mandatoInmueblesDetalle", idx)}
                              >
                                <Trash2 aria-hidden="true" />
                                Eliminar
                              </Button>
                            )}
                          </div>

                          <div className="grid gap-1.5">
                            <Label htmlFor={`mandato-inmueble-direccion-${idx}`}>Dirección</Label>
                            <Input
                              id={`mandato-inmueble-direccion-${idx}`}
                              placeholder="Ej: Av. Providencia 1234"
                              value={item.direccion ?? ""}
                              onChange={(e) =>
                                handleListFieldChange(
                                  "mandatoInmueblesDetalle",
                                  idx,
                                  "direccion",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="grid items-start gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                              <Label htmlFor={`mandato-inmueble-comuna-${idx}`}>Comuna</Label>
                              <Input
                                id={`mandato-inmueble-comuna-${idx}`}
                                list="comunas-chile"
                                placeholder="Busca una comuna"
                                value={item.comuna ?? ""}
                                onChange={(e) =>
                                  handleListFieldChange(
                                    "mandatoInmueblesDetalle",
                                    idx,
                                    "comuna",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <Label htmlFor={`mandato-inmueble-region-${idx}`}>Región</Label>
                              <Input
                                id={`mandato-inmueble-region-${idx}`}
                                placeholder="Región"
                                value={item.region ?? ""}
                                onChange={(e) =>
                                  handleListFieldChange(
                                    "mandatoInmueblesDetalle",
                                    idx,
                                    "region",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(!gestion.gestionOrigenId ||
                      normalizar(gestion.nombreContratoOrigen ?? "").includes("hereditarios")) && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed sm:w-auto"
                        onClick={() =>
                          addListItem("mandatoInmueblesDetalle", {
                            ...INMUEBLE_MANDATO_VACIO,
                          })
                        }
                      >
                        <Plus aria-hidden="true" />
                        Agregar otro inmueble
                      </Button>
                    )}
                  </section>
                )}

                {/* Sub-formulario Mandato Vehículos */}
                {valores.mandatoVehiculos && (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 animate-in slide-in-from-top-2 duration-200 sm:p-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Vehículo</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Completa los antecedentes del vehículo incluido en el mandato.
                      </p>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="mandato-patente">Placa patente</Label>
                      <Input
                        id="mandato-patente"
                        placeholder="Ej: AB CD 12"
                        value={valores.patente ?? ""}
                        onChange={(e) => handleFieldChange("patente", e.target.value)}
                      />
                    </div>
                    <div className="grid items-start gap-4 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="mandato-permiso">Permiso al día</Label>
                        <select
                          id="mandato-permiso"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={valores.permisoAlDia ?? ""}
                          onChange={(e) => handleFieldChange("permisoAlDia", e.target.value)}
                        >
                          <option value="">Selecciona...</option>
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="mandato-prenda">¿Tiene prenda?</Label>
                        <select
                          id="mandato-prenda"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={valores.prenda ?? ""}
                          onChange={(e) => handleFieldChange("prenda", e.target.value)}
                        >
                          <option value="">Selecciona...</option>
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-formulario Mandato Bienes Muebles */}
                {valores.mandatoMuebles && (
                  <section className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Bienes muebles</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Describe los bienes muebles que quedarán incluidos en el mandato.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {bienesSingularizados.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5"
                        >
                          <div className="flex min-h-8 items-center justify-between gap-3">
                            <h4 className="font-semibold text-slate-800">Bien {idx + 1}</h4>
                            {idx > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-destructive"
                                onClick={() => removeListItem("bienesSingularizados", idx)}
                              >
                                <Trash2 aria-hidden="true" />
                                Eliminar
                              </Button>
                            )}
                          </div>
                          <div className="grid items-start gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                              <Label htmlFor={`mandato-mueble-cantidad-${idx}`}>Cantidad</Label>
                              <Input
                                id={`mandato-mueble-cantidad-${idx}`}
                                type="number"
                                min="1"
                                value={item.cantidad ?? 1}
                                onChange={(e) =>
                                  handleListFieldChange(
                                    "bienesSingularizados",
                                    idx,
                                    "cantidad",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <Label htmlFor={`mandato-mueble-tipo-${idx}`}>Tipo de bien</Label>
                              <Input
                                id={`mandato-mueble-tipo-${idx}`}
                                placeholder="Ej: Televisor o computador"
                                value={item.tipoBien ?? ""}
                                onChange={(e) =>
                                  handleListFieldChange(
                                    "bienesSingularizados",
                                    idx,
                                    "tipoBien",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <Label htmlFor={`mandato-mueble-marca-${idx}`}>Marca</Label>
                              <Input
                                id={`mandato-mueble-marca-${idx}`}
                                placeholder="Ej: Samsung"
                                value={item.marca ?? ""}
                                onChange={(e) =>
                                  handleListFieldChange(
                                    "bienesSingularizados",
                                    idx,
                                    "marca",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <Label htmlFor={`mandato-mueble-color-${idx}`}>Color</Label>
                              <Input
                                id={`mandato-mueble-color-${idx}`}
                                placeholder="Ej: Negro"
                                value={item.color ?? ""}
                                onChange={(e) =>
                                  handleListFieldChange(
                                    "bienesSingularizados",
                                    idx,
                                    "color",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed sm:w-auto"
                      onClick={() =>
                        addListItem("bienesSingularizados", {
                          cantidad: 1,
                          tipoBien: "",
                          marca: "",
                          color: "",
                        })
                      }
                    >
                      <Plus aria-hidden="true" />
                      Agregar otro bien
                    </Button>
                  </section>
                )}

                {valores.mandatoAcciones && (
                  <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 animate-in slide-in-from-top-2 duration-200 sm:p-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Acciones</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Identifica la sociedad y la participación incluida en el mandato.
                      </p>
                    </div>
                    <div className="grid items-start gap-4 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <div className="flex min-h-6 items-center gap-1.5">
                          <Label htmlFor="mandato-razon-social">Razón social de la empresa</Label>
                          <AyudaCampo label="la razón social de la empresa">
                            Es el nombre legal de la empresa.
                          </AyudaCampo>
                        </div>
                        <Input
                          id="mandato-razon-social"
                          placeholder="Ej: Inversiones Los Andes SpA"
                          value={valores.razonSocial ?? ""}
                          onChange={(event) => handleFieldChange("razonSocial", event.target.value)}
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="mandato-rut-empresa" className="flex min-h-6 items-center">
                          RUT de la empresa
                        </Label>
                        <Input
                          id="mandato-rut-empresa"
                          placeholder="Ej: 76.123.456-7"
                          value={valores.rutEmpresa ?? ""}
                          onChange={(event) => handleFieldChange("rutEmpresa", event.target.value)}
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label
                          htmlFor="mandato-tipo-societario"
                          className="flex min-h-6 items-center"
                        >
                          Tipo societario
                        </Label>
                        <Select
                          value={valores.tipoSocietarioAcciones ?? ""}
                          onValueChange={(value) =>
                            handleFieldChange("tipoSocietarioAcciones", value)
                          }
                        >
                          <SelectTrigger id="mandato-tipo-societario">
                            <SelectValue placeholder="Selecciona..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="srl">SRL</SelectItem>
                            <SelectItem value="spa">SpA</SelectItem>
                            <SelectItem value="sa">S.A.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {valores.tipoSocietarioAcciones === "srl" && (
                        <div className="grid gap-1.5">
                          <Label
                            htmlFor="mandato-participacion"
                            className="flex min-h-6 items-center"
                          >
                            Participación (%)
                          </Label>
                          <Input
                            id="mandato-participacion"
                            type="number"
                            min="1"
                            max="100"
                            placeholder="Ej: 50"
                            value={valores.participacion ?? ""}
                            onChange={(event) =>
                              handleFieldChange("participacion", event.target.value)
                            }
                          />
                        </div>
                      )}

                      {(valores.tipoSocietarioAcciones === "spa" ||
                        valores.tipoSocietarioAcciones === "sa") && (
                        <div className="grid gap-1.5">
                          <Label
                            htmlFor="mandato-numero-acciones"
                            className="flex min-h-6 items-center"
                          >
                            N.º de acciones
                          </Label>
                          <Input
                            id="mandato-numero-acciones"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Ej: 1000"
                            value={valores.numeroAcciones ?? ""}
                            onChange={(event) =>
                              handleFieldChange("numeroAcciones", event.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* ── GRUPO 10: Patente Comercial ── */}
            {isGroupPatente() && (
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="tipoPatente">Tipo de patente</Label>
                  <Input
                    id="tipoPatente"
                    placeholder="Ej: Comercial, Industrial, de Alcoholes"
                    value={valores.tipoPatente ?? ""}
                    onChange={(e) => handleFieldChange("tipoPatente", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="municipalidad">Municipalidad</Label>
                  <Input
                    id="municipalidad"
                    list="comunas-chile"
                    placeholder="Municipalidad (comuna)"
                    value={valores.municipalidad ?? ""}
                    onChange={(e) => handleFieldChange("municipalidad", e.target.value)}
                  />
                </div>
                <fieldset>
                  <legend className="text-sm font-medium text-slate-800">
                    ¿Cómo fue constituida la sociedad?
                  </legend>
                  <RadioGroup
                    value={valores.formaConstitucionSociedadPatente ?? ""}
                    onValueChange={(value) =>
                      handleFieldChange("formaConstitucionSociedadPatente", value)
                    }
                    className="mt-3 grid items-start gap-3 sm:grid-cols-2"
                    aria-required="true"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="escrituraPublica"
                        id="constitucion-escritura-publica"
                      />
                      <Label
                        htmlFor="constitucion-escritura-publica"
                        className="cursor-pointer font-normal text-slate-700"
                      >
                        Escritura pública firmada en notaría
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="empresaEnUnDia" id="constitucion-empresa-en-un-dia" />
                      <Label
                        htmlFor="constitucion-empresa-en-un-dia"
                        className="cursor-pointer font-normal text-slate-700"
                      >
                        Empresa en un Día
                      </Label>
                    </div>
                  </RadioGroup>
                </fieldset>
              </div>
            )}

            {/* ── GRUPO 11: Establecimiento Comercial / Derecho de Llaves ── */}
            {isGroupEstablecimiento() && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 items-start gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="tieneArriendo">¿Tiene contrato de arriendo?</Label>
                    <Select
                      value={valores.tieneArriendo ?? ""}
                      onValueChange={(val) => handleFieldChange("tieneArriendo", val)}
                    >
                      <SelectTrigger id="tieneArriendo">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="tienePatente">¿Tiene patente comercial?</Label>
                    <Select
                      value={valores.tienePatente ?? ""}
                      onValueChange={(val) => handleFieldChange("tienePatente", val)}
                    >
                      <SelectTrigger id="tienePatente">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Condicional Arriendo */}
                {valores.tieneArriendo === "si" && (
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <Label className="text-sm font-semibold text-slate-800">
                      Dirección de funcionamiento
                    </Label>
                    <div className="grid gap-1.5">
                      <Label>Domicilio de funcionamiento</Label>
                      <Input
                        placeholder="Dirección del local"
                        value={valores.direccion ?? ""}
                        onChange={(e) => handleFieldChange("direccion", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 items-start gap-4">
                      <div className="grid gap-1.5">
                        <Label>Comuna</Label>
                        <Input
                          list="comunas-chile"
                          placeholder="Comuna"
                          value={valores.comuna ?? ""}
                          onChange={(e) => handleFieldChange("comuna", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Región</Label>
                        <Input
                          placeholder="Región"
                          value={valores.region ?? ""}
                          onChange={(e) => handleFieldChange("region", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Condicional Patente */}
                {valores.tienePatente === "si" && (
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <Label className="text-sm font-semibold text-slate-800">
                      Datos de la Patente
                    </Label>
                    <div className="grid gap-1.5">
                      <Label>Tipo de patente</Label>
                      <Input
                        placeholder="Ej: Comercial"
                        value={valores.tipoPatente ?? ""}
                        onChange={(e) => handleFieldChange("tipoPatente", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Municipalidad</Label>
                      <Input
                        list="comunas-chile"
                        placeholder="Buscar municipalidad..."
                        value={valores.municipalidad ?? ""}
                        onChange={(e) => handleFieldChange("municipalidad", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- Caso de Fallback (Si no coincide con nada) --- */}
            {!isGroupInmueble() &&
              !isGroupHereditarios() &&
              !isGroupVehiculo() &&
              !esConstitucionSociedad() &&
              !isGroupAcciones() &&
              !isGroupLiquidacion() &&
              !isGroupBienesMuebles() &&
              !isGroupAllegado() &&
              !isGroupArriendo() &&
              !esMandato() &&
              !isGroupPatente() &&
              !isGroupEstablecimiento() &&
              !isGroupHipoteca() &&
              !isGroupPrenda() &&
              !isGroupMatrimonial() && (
                <div className="grid gap-4">
                  {gestion.camposEspecificos.map((campo) => (
                    <div key={campo.nombre} className="grid gap-2">
                      <Label htmlFor={`campo-${campo.nombre}`}>{campo.nombre}</Label>
                      {campo.tipo === "text" && (
                        <Input
                          id={`campo-${campo.nombre}`}
                          placeholder={campo.placeholder}
                          value={valores[campo.nombre] ?? ""}
                          onChange={(e) => handleFieldChange(campo.nombre, e.target.value)}
                        />
                      )}
                      {campo.tipo === "select" && campo.opciones && (
                        <Select
                          value={valores[campo.nombre] ?? ""}
                          onValueChange={(val) => handleFieldChange(campo.nombre, val)}
                        >
                          <SelectTrigger id={`campo-${campo.nombre}`}>
                            <SelectValue placeholder="Selecciona una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {campo.opciones.map((opcion) => (
                              <SelectItem key={opcion} value={opcion}>
                                {opcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {campo.tipo === "textarea" && (
                        <Textarea
                          id={`campo-${campo.nombre}`}
                          placeholder={campo.placeholder}
                          value={valores[campo.nombre] ?? ""}
                          onChange={(e) => handleFieldChange(campo.nombre, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </fieldset>

        {mensajesValidacion}

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={onVolver}>
            Volver
          </Button>
          {/* La acción permanece habilitada: al presionarla, el hook destaca cada faltante. */}
          <Button onClick={handleGuardar}>
            {soloLectura
              ? "Continuar"
              : debeGuardarEstadoTransferenciaVehiculo(
                    nombreContrato,
                    valores.permisoAlDia,
                    valores,
                  )
                ? "Guardar estado"
                : isGroupVehiculo() &&
                    puedeGuardarEsperaPrenda(valores) &&
                    !permisoCirculacionBloqueaTransferencia(nombreContrato, valores.permisoAlDia)
                  ? "Guardar en espera"
                  : esUltimoPasoFicha
                    ? "Enviar ficha"
                    : "Guardar y continuar"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
