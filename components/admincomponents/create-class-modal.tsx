"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

export function CreateClassModal({ isOpen, onClose, selectedDate }: CreateClassModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Nueva clase</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-zinc-500">
            Contenedor placeholder para el formulario de creación de clase.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
