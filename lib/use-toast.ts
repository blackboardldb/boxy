"use client";

// Inert version of useToast to allow removing the component without breaking the build
import * as React from "react";

export function useToast() {
  return {
    toast: (_opts?: unknown) => ({ id: "", dismiss: () => {}, update: () => {} }),
    dismiss: () => {},
    toasts: [],
  };
}

export const toast = (_opts?: unknown) => ({ id: "", dismiss: () => {}, update: () => {} });
