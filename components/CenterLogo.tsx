import React from "react";
import { LOGO_SVG_DEFAULT } from "./center-logo-default";

type CenterLogoProps =
  | { iconUrl: string | null; iconUpdatedAt?: Date | string | null; loading?: false }
  | { iconUrl?: undefined; iconUpdatedAt?: undefined; loading: true };

/**
 * Construye la URL del ícono con un query param de versión basado en `updatedAt`.
 * Así el navegador cachea la imagen eficientemente pero la invalida cuando cambia.
 * No guardamos el timestamp en la DB; lo derivamos del campo `updatedAt` de la org.
 */
function buildIconUrl(url: string, updatedAt?: Date | string | null): string {
  if (!updatedAt) return url;
  const ts =
    typeof updatedAt === "string"
      ? new Date(updatedAt).getTime()
      : updatedAt instanceof Date
      ? updatedAt.getTime()
      : 0;
  if (!ts) return url;
  // Eliminar cualquier v= previo que pudiera estar grabado en la DB (migración a este enfoque)
  const base = url.replace(/[?&]v=\d+/, "").replace(/[?&]t=\d+/, "");
  return base.includes("?") ? `${base}&v=${ts}` : `${base}?v=${ts}`;
}

export function CenterLogo(props: CenterLogoProps) {
  if (props.loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
    );
  }
  const src = props.iconUrl
    ? buildIconUrl(props.iconUrl, props.iconUpdatedAt)
    : null;

  return src ? (
    <img
      src={src}
      alt="Logo Centro"
      className="w-10 h-10 object-contain bg-black rounded-full"
    />
  ) : (
    <div className="bg-black rounded-full flex items-center justify-center w-10 h-10">
      {LOGO_SVG_DEFAULT}
    </div>
  );
}
