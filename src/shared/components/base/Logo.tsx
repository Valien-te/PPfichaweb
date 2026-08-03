import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

import lexyDarkHorizontal from "./assets/logo/lexy-dark-horizontal.svg";
import lexyDarkHorizontalSlogan from "./assets/logo/lexy-dark-horizontal-slogan.svg";
import lexyDarkIsotipe from "./assets/logo/lexy-dark-isotipe.svg";
import lexyDarkVertical from "./assets/logo/lexy-dark-vertical.svg";
import lexyDarkVerticalSlogan from "./assets/logo/lexy-dark-vertical-slogan.svg";
import lexyLightHorizontal from "./assets/logo/lexy-light-horizontal.svg";
import lexyLightHorizontalSlogan from "./assets/logo/lexy-light-horizontal-slogan.svg";
import lexyLightIsotipe from "./assets/logo/lexy-light-isotipe.svg";
import lexyLightVertical from "./assets/logo/lexy-light-vertical.svg";
import lexyLightVerticalSlogan from "./assets/logo/lexy-light-vertical-slogan.svg";
import deudorDarkV1 from "./assets/logo/lexydeudor-dark-v1.svg";
import deudorDarkV2 from "./assets/logo/lexydeudor-dark-v2.svg";
import deudorLightV1 from "./assets/logo/lexydeudor-light-v1.svg";
import deudorLightV2 from "./assets/logo/lexydeudor-light-v2.svg";
import saludDarkV1 from "./assets/logo/lexysalud-dark-v1.svg";
import saludDarkV2 from "./assets/logo/lexysalud-dark-v2.svg";
import saludLightV1 from "./assets/logo/lexysalud-light-v1.svg";
import saludLightV2 from "./assets/logo/lexysalud-light-v2.svg";

export type LogoBrand = "lexy" | "salud" | "deudor";
/**
 * Color del fondo sobre el que va el logo:
 *  - `light` (fondo claro)  → logo OSCURO (navy).  ← por defecto
 *  - `dark`  (fondo oscuro) → logo CLARO (blanco).
 */
export type LogoSurface = "light" | "dark";
export type LogoLayout = "horizontal" | "vertical" | "isotipe";
export type LogoVersion = "v1" | "v2";

// Clave del mapa = el `surface` (fondo). El archivo `*-light-*` trae arte oscuro
// (para fondo claro) y `*-dark-*` trae arte claro (para fondo oscuro).
const lexyMap = {
  light: {
    horizontal: { false: lexyLightHorizontal, true: lexyLightHorizontalSlogan },
    vertical: { false: lexyLightVertical, true: lexyLightVerticalSlogan },
    isotipe: { false: lexyLightIsotipe, true: lexyLightIsotipe },
  },
  dark: {
    horizontal: { false: lexyDarkHorizontal, true: lexyDarkHorizontalSlogan },
    vertical: { false: lexyDarkVertical, true: lexyDarkVerticalSlogan },
    isotipe: { false: lexyDarkIsotipe, true: lexyDarkIsotipe },
  },
} as const;

const subBrandMap = {
  salud: {
    light: { v1: saludLightV1, v2: saludLightV2 },
    dark: { v1: saludDarkV1, v2: saludDarkV2 },
  },
  deudor: {
    light: { v1: deudorLightV1, v2: deudorLightV2 },
    dark: { v1: deudorDarkV1, v2: deudorDarkV2 },
  },
} as const;

export interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  brand?: LogoBrand;
  /** Fondo sobre el que va el logo. `light` (def.) = logo oscuro; `dark` = logo claro. */
  surface?: LogoSurface;
  /** Solo Lexy. */
  layout?: LogoLayout;
  /** Solo Lexy. */
  slogan?: boolean;
  /** Solo sub-marcas (salud / deudor). */
  version?: LogoVersion;
}

export const Logo = React.forwardRef<HTMLImageElement, LogoProps>(function Logo(
  {
    brand = "lexy",
    surface = "light",
    layout = "horizontal",
    slogan = false,
    version = "v1",
    alt,
    className,
    draggable = false,
    ...props
  },
  ref,
) {
  let src: string;
  let label: string;

  if (brand === "lexy") {
    src = lexyMap[surface][layout][slogan ? "true" : "false"];
    label = "Lexy";
  } else {
    src = subBrandMap[brand][surface][version];
    label = brand === "salud" ? "Lexy Salud" : "Lexy Deudor";
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt ?? label}
      draggable={draggable}
      className={cn("block h-8 w-auto max-w-full select-none", className)}
      {...props}
    />
  );
});

Logo.displayName = "Logo";
