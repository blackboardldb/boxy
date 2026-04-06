// src/components/registration-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { User, Clock3, Users } from "lucide-react";
import { formatTimeLocal } from "@/lib/utils";

interface FormattedClassItem {
  id: string;
  dateTime: string;
  name: string;
  disciplineId: string;
  instructor: string;
  duration: string;
  alumnRegistred: string;
  isRegistered: boolean;
  formattedDayLabel: string;
  formattedTime: string;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: FormattedClassItem | null;
  onConfirm: () => void;
  isLimitReached?: boolean;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  classItem,
  onConfirm,
  isLimitReached = false,
}: RegistrationModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  if (!classItem || !isOpen) return null;

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onConfirm();
      setIsConfirmed(true);
    } catch (err: any) {
      setError(err.message || "Error al procesar la reserva");
      console.error("Error en confirmación:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsConfirmed(false);
    setIsProcessing(false);
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
          <DrawerTitle className="text-lg font-medium text-center text-black">
            {isConfirmed ? "Clase reservada" : "Vas a reservar la siguiente clase"}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
             Detalles de confirmación de reserva
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4">
          {!isConfirmed ? (
            <>
              <div className="bg-zinc-100 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3 text-2xl font-semibold py-2">
                <h3 className=" text-zinc-900">
                  {classItem.name}
                </h3>
    
                    <span className="text-blue-600">
                      {formattedTime}
                    </span>
                  
                </div>
                <div className="flex items-center justify-center gap-2">
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-600">
                      Coach: {classItem.instructor}
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
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <span className="text-7xl">💪</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                    ¡Clase reservada!
                  </h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {classItem.name}
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {formattedTime} con {classItem.instructor}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    Llega con 10 minutos de anticipación. Puedes cancelar hasta
                    45 minutos antes del inicio.
                  </p>
                </div>
              </div>
            </>
          )}

          {!isConfirmed && (
            <div className="px-4 mt-2">
              {isLimitReached && !error && (
                <p className="text-sm text-zinc-500 text-center mb-2 font-bold">
                  Ya tienes 2 clases reservadas hoy
                </p>
              )}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-2">
                  <p className="text-sm font-medium text-red-600 text-center">
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter>
          {!isConfirmed ? (
            <>
              <Button 
                onClick={handleConfirm} 
                disabled={isProcessing || (isLimitReached && !isConfirmed)}
              >
                {isProcessing ? "Procesando..." : "Confirmar reserva"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>
            </>
          ) : (
            <DrawerClose asChild>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleClose}
              >
                Cerrar
              </Button>
            </DrawerClose>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
