// src/components/cancellation-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Clock, User, Clock3, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatTimeLocal } from "@/lib/utils";
import type { FormattedClassItem } from "@/lib/types";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: FormattedClassItem | null;
  onConfirm: () => void;
}

export default function CancellationModal({
  isOpen,
  onClose,
  classItem,
  onConfirm,
}: CancellationModalProps) {
  const [isCancelled, setIsCancelled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  if (!classItem || !isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    setBlockedMessage(null);
    try {
      await onConfirm();
      setIsCancelled(true);
    } catch (error: any) {
      // Mostrar el mensaje de error al usuario (restricción horaria u otro)
      const msg = error?.message || "No se pudo cancelar la clase. Intenta nuevamente.";
      setBlockedMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsCancelled(false);
    setIsProcessing(false);
    setBlockedMessage(null);
    onClose();
  };

  // Formatear la hora desde classItem.dateTime
  const formattedTime = classItem.dateTime
    ? formatTimeLocal(classItem.dateTime)
    : "Hora no disponible";

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(newOpenState) => {
        if (!newOpenState) handleClose();
      }}
    >
      <DrawerContent className="sm:max-w-xl w-full mx-auto text-center">
        <DrawerHeader>
          <DrawerTitle className="text-lg text-center">
            {isCancelled
              ? "Clase cancelada"
              : blockedMessage
                ? "No puedes cancelar esta clase"
                : "¿Estás seguro de cancelar la clase?"}
          </DrawerTitle>
          <DrawerDescription className={(isCancelled || blockedMessage) ? "sr-only" : "text-center"}>
            {isCancelled
              ? "Detalles de confirmación de reserva cancelada"
              : blockedMessage
                ? blockedMessage
                : "Verifica los detalles de la clase antes de cancelar"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4">
          {isCancelled ? (
            // Estado: cancelación exitosa
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <span className="text-7xl">💤</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                  La reserva ha sido cancelada.
                </h3>
                <p className="text-xl font-bold text-zinc-800 mt-2">
                  {classItem.name}
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  {formattedTime} con {classItem.instructor}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  Hemos liberado tu cupo y esta clase no será descontada de tu
                  plan.
                </p>
              </div>
            </div>
          ) : blockedMessage ? (
            // Estado: cancelación bloqueada por restricción
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <span className="text-6xl">🚫</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                  {classItem.name} · {formattedTime}
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm text-orange-800">{blockedMessage}</p>
                </div>
              </div>
            </div>
          ) : (
            // Estado: confirmación pendiente
            <>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex items-center justify-center gap-3 text-2xl font-semibold py-2">
                  <h3 className=" text-zinc-900">
                    {classItem.name}
                  </h3>
                  <span className="text-zinc-800">
                    {formattedTime}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-600">
                      Instructor: {classItem.instructor}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                    <div className="flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{classItem.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{classItem.alumnRegistred}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DrawerFooter>
          {isCancelled || blockedMessage ? (
            // Botón único de cierre para estado final (éxito o bloqueado)
            <DrawerClose asChild>
              <Button
                className="w-full rounded-xl bg-zinc-100 border-zinc-200"
                variant="outline"
                onClick={handleClose}
              >
                Volver
              </Button>
            </DrawerClose>
          ) : (
            // Botones de confirmación
            <>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : "Cancelar esta clase"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="rounded-xl bg-zinc-100 border-zinc-200">Conservar clase</Button>
              </DrawerClose>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
