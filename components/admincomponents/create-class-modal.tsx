"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDisciplines } from "@/lib/react-query/hooks/useDisciplines";
import { useInstructorsMinimal } from "@/lib/react-query/hooks/useInstructors";
import { useCreateClass } from "@/lib/react-query/hooks/useClasses";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, CalendarIcon, Clock } from "lucide-react";
import { CUSTOM_DISCIPLINE_ID } from "@/lib/constants";

// Tarea 3.4: Schema Zod con Discriminated Union
const formSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("existing"),
    disciplineId: z.string().min(1, "Selecciona una disciplina"),
    date: z.string().min(1, "Selecciona una fecha"),
    time: z.string().min(1, "Selecciona un horario"),
    instructorId: z.string().min(1, "Selecciona un instructor"),
    capacity: z.coerce.number().min(1).max(100),
  }),
  z.object({
    mode: z.literal("special"),
    customName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    disciplineId: z.literal(CUSTOM_DISCIPLINE_ID).optional(),
    date: z.string().min(1, "Selecciona una fecha"),
    time: z.string().min(1, "Selecciona un horario"),
    instructorId: z.string().min(1, "Selecciona un instructor"),
    capacity: z.coerce.number().min(1).max(100),
  }),
]);

type FormValues = z.infer<typeof formSchema>;

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

export function CreateClassModal({ isOpen, onClose, selectedDate }: CreateClassModalProps) {
  // Hooks de datos
  const { data: disciplines = [], isLoading: isLoadingDisciplines } = useDisciplines();
  const { data: instructors = [], isLoading: isLoadingInstructors } = useInstructorsMinimal();
  const createClass = useCreateClass();

  const activeDisciplines = disciplines.filter((d) => d.isActive);

  // Estados de UI
  const [apiError, setApiError] = useState<string | null>(null);

  // Configuración del formulario
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "existing",
      disciplineId: "",
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      time: "07:00",
      capacity: 15,
      instructorId: "",
    },
  });

  const mode = useWatch({ control, name: "mode" });
  const disciplineIdWatch = useWatch({ control, name: "disciplineId" });
  const instructorIdWatch = useWatch({ control, name: "instructorId" });

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      reset({
        mode: "existing",
        disciplineId: "",
        date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        time: "07:00",
        capacity: 15,
        instructorId: "",
      });
    }
  }, [isOpen, selectedDate, reset]);

  // Limpiar campos al cambiar de modo y forzar disciplineId si es "special"
  const setMode = (newMode: "existing" | "special") => {
    if (newMode === "special") {
      reset((prev) => ({
        ...prev,
        mode: "special",
        disciplineId: CUSTOM_DISCIPLINE_ID,
        customName: "",
      }));
    } else {
      reset((prev) => ({
        ...prev,
        mode: "existing",
        disciplineId: "",
        customName: undefined,
      }));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setApiError(null);

    try {
      // Combinar fecha y hora en un ISOString válido
      const [hours, minutes] = data.time.split(":").map(Number);

      // Parsear la fecha manualmente para evitar problemas de zona horaria con new Date('YYYY-MM-DD')
      const [year, month, day] = data.date.split("-").map(Number);
      const dateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

      const disciplineName = data.mode === "existing"
        ? activeDisciplines.find((d) => d.id === data.disciplineId)?.name || "Clase"
        : data.customName;

      const payload = {
        disciplineId: data.mode === "special"
          ? CUSTOM_DISCIPLINE_ID
          : data.disciplineId,
        name: disciplineName,
        dateTime: dateTime.toISOString(),
        durationMinutes: 60,
        instructorId: data.instructorId,
        capacity: data.capacity,
      };

      const response = await createClass.mutateAsync(payload);

      if (!response.success) {
        setApiError("Error al crear la clase. Revisa los datos.");
        return;
      }

      // Si fue exitoso
      toast.success("Clase creada exitosamente");
      onClose();
    } catch (error: any) {
      setApiError(error.message || "Error de red al crear la clase");
    }
  };

  // Helper para errores dependiendo del modo
  const currentErrors = errors as any;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        {/* Cabecera Premium */}
        <DialogHeader className="p-6 bg-zinc-50 border-b border-zinc-100">
          <DialogTitle className="text-xl font-bold text-zinc-900">Crear Nueva Clase</DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-600">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 bg-white">

          {/* Tarea 3.4: Toggle primitivo de Modo */}
          <div className="flex rounded-xl overflow-hidden border border-zinc-200">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors
                ${mode === "existing"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-50"}`}
            >
              Disciplina existente
            </button>
            <button
              type="button"
              onClick={() => setMode("special")}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors
                ${mode === "special"
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-50"}`}
            >
              Clase especial
            </button>
          </div>

          {/* Campo Condicional: Select de Disciplina vs Input de Nombre */}
          {mode === "existing" ? (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700">Disciplina</Label>
              <Select
                value={disciplineIdWatch || ""}
                onValueChange={(value) => setValue("disciplineId", value, { shouldValidate: true })}
              >
                <SelectTrigger className="rounded-xl h-11 border-zinc-200 focus:ring-2 focus:ring-lime-500 transition-all">
                  <SelectValue placeholder="Selecciona una disciplina" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-zinc-100">
                  {isLoadingDisciplines ? (
                    <div className="p-4 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    </div>
                  ) : (
                    activeDisciplines.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="rounded-xl cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="font-medium text-zinc-800">{d.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {currentErrors.disciplineId && (
                <p className="text-xs text-red-500 font-medium pl-1">{currentErrors.disciplineId.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700">Nombre del Evento</Label>
              <Input
                type="text"
                {...register("customName")}
                className="rounded-xl h-11 border-zinc-200 focus:ring-2 focus:ring-lime-500 transition-all"
                placeholder="Ej: Masterclass de Yoga, Taller Intensivo..."
              />
              {currentErrors.customName && (
                <p className="text-xs text-red-500 font-medium pl-1">{currentErrors.customName.message}</p>
              )}
            </div>
          )}

          {/* Fecha y Hora en Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700">Fecha</Label>
              <div className="relative">
                <Input
                  type="date"
                  {...register("date")}
                  className="rounded-xl h-11 border-zinc-200 pl-10 focus:ring-2 focus:ring-lime-500 transition-all"
                />
                <CalendarIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {currentErrors.date && (
                <p className="text-xs text-red-500 font-medium pl-1">{currentErrors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700">Hora</Label>
              <div className="relative">
                <Input
                  type="time"
                  {...register("time")}
                  className="rounded-xl h-11 border-zinc-200 pl-10 focus:ring-2 focus:ring-lime-500 transition-all"
                />
                <Clock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {currentErrors.time && (
                <p className="text-xs text-red-500 font-medium pl-1">{currentErrors.time.message}</p>
              )}
            </div>
          </div>

          {/* Instructor - Select Controlado */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-zinc-700">Instructor</Label>
            <Select
              value={instructorIdWatch || ""}
              onValueChange={(value) => setValue("instructorId", value, { shouldValidate: true })}
            >
              <SelectTrigger className="rounded-xl h-11 border-zinc-200 focus:ring-2 focus:ring-lime-500 transition-all">
                <SelectValue placeholder="Selecciona un instructor" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-zinc-100">
                {isLoadingInstructors ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  </div>
                ) : (
                  instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id} className="rounded-xl cursor-pointer">
                      <span className="font-medium text-zinc-800">{i.firstName} {i.lastName}</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {currentErrors.instructorId && (
              <p className="text-xs text-red-500 font-medium pl-1">{currentErrors.instructorId.message}</p>
            )}
          </div>

          {/* Cupo Máximo */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-zinc-700">Cupo Máximo</Label>
            <Input
              type="number"
              {...register("capacity")}
              className="rounded-xl h-11 border-zinc-200 focus:ring-2 focus:ring-lime-500 transition-all"
              placeholder="Ej: 15"
            />
            {currentErrors.capacity && (
              <p className="text-xs text-red-500 font-medium pl-1">{currentErrors.capacity.message}</p>
            )}
          </div>

          {/* Footer con Botones Premium */}
          <DialogFooter className="pt-4 flex flex-row gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-xl h-12 font-bold text-zinc-500 hover:bg-zinc-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createClass.isPending}
              className="flex-1 rounded-xl h-12 bg-zinc-950 text-white font-bold hover:bg-zinc-800 shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {createClass.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Clase"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
