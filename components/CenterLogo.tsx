import React from "react";
import { LOGO_SVG_DEFAULT } from "./center-logo-default";

type CenterLogoProps =
  | { iconUrl: string | null; loading?: false }
  | { iconUrl?: undefined; loading: true };

export function CenterLogo(props: CenterLogoProps) {
  if (props.loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
    );
  }
  return props.iconUrl ? (
    <img
      src={props.iconUrl}
      alt="Logo Centro"
      className="w-10 h-10 object-contain bg-black rounded-full"
    />
  ) : (
    <div className="bg-black rounded-full flex items-center justify-center w-10 h-10">
      {LOGO_SVG_DEFAULT}
    </div>
  );
}
