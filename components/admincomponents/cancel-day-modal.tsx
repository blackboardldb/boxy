"use client";

import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useClassesByDate, useCancelDay } from "@/lib/react-query/hooks/useClasses";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface CancelDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date?: Date;
}

export function CancelDayModal({ isOpen, onClose, date }: CancelDayModalProps) {
  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  
  const { data: classes = [], isLoading } = useClassesByDate({ 
    date: dateStr 
  });

  const { currentUser } = useCurrentUser();
  const cancelDay = useCancelDay();

  const classesToCancel = useMemo(() => {
    return classes.filter(c => c.status !== "cancelled");
  }, [classes]);

  const generatedClasses = useMemo(() => {
    return classesToCancel.filter(c => c.id.startsWith("gen_"));
  }, [classesToCancel]);

  const totalEnrolled = useMemo(() => {
    return classesToCancel.reduce((total, c) => total + (c.enrolledCount || 0), 0);
  }, [classesToCancel]);

  const handleCancelDay = async () => {
    if (!dateStr) return;

    if (!currentUser?.organizationId) {
      toast.error("Error de sesión: No se pudo determinar la organización. Por favor, recarga la página.");
      return;
    }

    try {
      await cancelDay.mutateAsync({
        date: dateStr,
        organizationId: currentUser.organizationId,
        generatedClasses: generatedClasses,
      });
      
      toast.success("Día cancelado exitosamente");
      onClose();
    } catch (error) {
      console.error("Error cancelling day:", error);
      toast.error("Error al cancelar el día");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Cancelar día completo
          </DialogTitle>
          <DialogDescription>
            {date && format(date, "EEEE d 'de' MMMM", { locale: es })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500">Cargando clases del día...</p>
            </div>
          ) : classesToCancel.length === 0 ? (
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-center">
              <p className="text-sm text-zinc-500">
                No hay clases activas para cancelar este día.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm text-red-800 font-medium mb-1">
                  Atención: Esta acción es irreversible
                </p>
                <p className="text-xs text-red-700">
                  Se cancelarán {classesToCancel.length} clases en total. 
                  Los alumnos inscritos serán notificados y sus créditos serán devueltos automáticamente.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                  <p className="text-xl font-bold text-zinc-900">{classesToCancel.length}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Clases Afectadas</p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                  <p className="text-xl font-bold text-zinc-900">{totalEnrolled}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Alumnos Inscritos</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl flex-1 sm:flex-none"
            disabled={cancelDay.isPending}
          >
            Volver
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelDay}
            className="rounded-xl bg-red-600 hover:bg-red-700 flex-1 sm:flex-none"
            disabled={isLoading || classesToCancel.length === 0 || cancelDay.isPending}
          >
            {cancelDay.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              "Confirmar cancelación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
