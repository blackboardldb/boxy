"use client";

// Inert version of useToast to allow removing the component without breaking the build
import * as React from "react";

export function useToast() {
  return {
    toast: () => ({ id: "", dismiss: () => {}, update: () => {} }),
    dismiss: () => {},
    toasts: [],
  };
}

export const toast = () => ({ id: "", dismiss: () => {}, update: () => {} });
