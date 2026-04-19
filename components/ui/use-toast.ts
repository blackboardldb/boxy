"use client";

// Inert version of useToast to allow removing the component without breaking the build
import * as React from "react";

// HAL-15: parámetro opcional agregado para que TypeScript acepte las
// llamadas existentes con objeto { title, description, variant }
export function useToast() {
  return {
    toast: (_opts?: unknown) => ({ id: "", dismiss: () => {}, update: () => {} }),
    dismiss: () => {},
    toasts: [],
  };
}

export const toast = (_opts?: unknown) => ({ id: "", dismiss: () => {}, update: () => {} });
