// src/components/ClassCard.tsx
"use client";

import { useState } from "react";
import { parseISO, isToday } from "date-fns";
import { formatTimeLocal, formatWeekday, formatDayMonth } from "@/lib/utils";
import { Clock, User, Users } from "lucide-react";
import type { FormattedClassItem } from "@/lib/types";
import { CUSTOM_DISCIPLINE_ID } from "@/lib/constants";

interface ClassCardProps {
  classItem: FormattedClassItem;
  onRegister: () => void;
  onCancel: () => void;
  canRegister?: boolean;
  planStatus?:
    | "active"
    | "expired"
    | "pending"
    | "exhausted"
    | "scheduled"
    | "inactive";
}



export function ClassCard({
  classItem,
  onRegister,
  onCancel,
  canRegister = true,
  planStatus = "active",
}: ClassCardProps) {
  // Validación de datos de entrada
  if (!classItem || !classItem.dateTime) {
    console.error("ClassCard: Datos de clase inválidos", classItem);
    return null;
  }

  const isRegistered = classItem.isRegistered;
  const isCancelled = classItem.status === "cancelled";
  const isCompleted = classItem.status === "completed";
  const isInProgress = classItem.status === "in_progress";
  const classDateTime = parseISO(classItem.dateTime);
  const formattedTime = formatTimeLocal(classItem.dateTime);
  const isClassToday = isToday(classDateTime);

  // Determinar si se puede realizar acción
  const canPerformAction = !isCancelled && !isCompleted && !isInProgress;

  // Determinar si se puede registrar basado en el estado del plan
  const canRegisterForClass =
    canRegister && (planStatus === "active" || planStatus === "scheduled");

  // Para usuarios registrados, siempre pueden cancelar (si la clase lo permite)
  const canCancelRegistration = isRegistered && canPerformAction;

  // Para usuarios no registrados, solo pueden registrarse si el plan está activo y la clase está dentro de la vigencia
  const canRegisterForNewClass =
    !isRegistered && canPerformAction && canRegisterForClass && classItem.isWithinPlanDates;

  const handleAction = () => {
    if (isRegistered) {
      onCancel();
    } else {
      onRegister();
    }
  };

  // Simplificación: ¿Es una clase con la que el usuario puede interactuar (inscribirse o cancelar)?
  const isActionable = canCancelRegistration || canRegisterForNewClass;

  // Lógica de estado simplificada para el span
  const statusInfo = isCancelled 
    ? { label: "Cancelada", className: "text-red-500" }
    : isCompleted 
    ? { label: "Finalizada", className: "text-gray-400" }
    : isInProgress 
    ? { label: "En curso", className: "text-green-600 font-bold" }
    : null;

  return (
    <div
      className={`
        border rounded-xl p-3 transition-all duration-200 relative
        ${
          !isActionable
            ? "opacity-50 bg-white"
            : "border-gray-100 hover:shadow-md hover:border-gray-300 bg-white"
        }
      `}
    >
      {/* Estado de la clase como span 
      {statusInfo && (
        <span className={`absolute top-3 right-3 text-[10px] uppercase font-bold tracking-tight ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      )}
*/}
 

      {/* Información principal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xl text-gray-900">{classItem.name}</h3>
            {classItem.disciplineId === CUSTOM_DISCIPLINE_ID && (
              <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Especial
              </span>
            )}
          </div>
          <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-2 py-1 rounded-full flex items-center">
             {/* Estado de la clase como span */}
      {statusInfo && (
        <>
          {isInProgress ? (
            <span className="flex items-center gap-1.5 mr-2 text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="font-bold uppercase tracking-wide text-xs">{statusInfo.label}</span>
            </span>
          ) : (
            <span className={`${statusInfo.className} mr-2 font-bold uppercase tracking-wide text-xs`}>{statusInfo.label}</span>
          )}
        </>
      )}
          {formattedTime}</span>
        </div>
      </div>
      
      {/* Metadata - Se oculta si no es accionable (clase pasada, plan pendiente, etc.) */}
      <div className={`flex items-center gap-4 w-full mt-2 mb-4 text-sm text-gray-600 ${!isActionable ? "hidden" : ""}`}>
         
      
              <div className=" inline-flex items-center gap-1">
                <User className="w-4 h-4" />
              <span>{classItem.instructor}</span>
              </div>
         
      <div className=" inline-flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{classItem.duration}</span>
          </div>
           <div className=" inline-flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{classItem.alumnRegistred}</span>
          </div>
                 {/* Indicador de clase de hoy
          <div className=" inline-flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
        {isClassToday && (
          <>
            Hoy {""}
          </>
        )}
           
            {formatDayMonth(classItem.dateTime)}</span>
            </div>
             */}
        </div>

      {/* Botones de acción - Ocultos si no hay acción posible (en lugar de deshabilitados) */}
      {isActionable && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAction}
            className={`
              flex-1 p-2.5 rounded-lg text-base font-bold transition-colors duration-200
              ${
                isRegistered
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-lime-400 text-black hover:bg-lime-500"
              }
            `}
          >
            {isRegistered ? "Cancelar clase" : "Inscribir clase"}
          </button>
        </div>
      )}

      {/* Mensaje informativo cuando no se puede registrar */}
      {!canRegisterForNewClass && !isRegistered && canPerformAction && (
        <div className="mt-2 text-sm text-center w-full border-t border-t-2 border-gray-100 pt-3">
          {planStatus === "pending" ? (
            <span className="text-yellow-600">
              Plan pendiente de validación
            </span>
          ) : planStatus === "inactive" ? (
            <span className="text-orange-600">
              Renueva tu plan o verifica tus clases
            </span>
          ) : !classItem.isWithinPlanDates ? (
            <span className="text-sky-600">
              Clase fuera de rango de tu plan actual
            </span>
          ) : (
            <span className="text-gray-500">No disponible</span>
          )}
        </div>
      )}
    </div>
  );
}
