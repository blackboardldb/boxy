"use client";

// Inert version of useToast to allow removing the component without breaking the build
import * as React from "react";

export function useToast() {
  return {
    toast: (_opts?: unknown) => ({ id: "", dismiss: () => {}, update: () => {} }),
    dismiss: () => {},
    toasts: [] as Array<{ id: string; title?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; [key: string]: unknown }>,
  };
}

export const toast = (_opts?: unknown) => ({ id: "", dismiss: () => {}, update: () => {} });
