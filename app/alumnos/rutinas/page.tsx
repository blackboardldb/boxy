'use client'

import { useState, useMemo, useCallback } from 'react'
import { format, startOfWeek, endOfWeek, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, Circle, MapPin, User } from 'lucide-react'
import WeeklyDatePicker from "@/components/weekly-date-picker"
import { useRoutines, useCompleteRoutine } from "@/lib/react-query/hooks/useRoutines"
import { RoutineAssignmentForMember, RoutineContent, RoutineBlock } from '@/lib/types/routine'

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE BLOQUE — renderiza un bloque individual de la rutina
// ─────────────────────────────────────────────────────────────────────────────

function RoutineBlockCard({ block }: { block: RoutineBlock }) {
  if (block.kind === 'text') {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm font-semibold text-foreground mb-1">{block.title}</p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{block.body}</p>
        {block.notes && (
          <p className="text-xs text-muted-foreground mt-2 italic">{block.notes}</p>
        )}
        {block.videoUrls && block.videoUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {block.videoUrls.map((v, i) => (
              <a
                key={i}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline"
              >
                {v.label}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  // kind === 'exercise'
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground mb-2">{block.title}</p>
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {block.sets && (
          <span className="rounded-md bg-muted px-2 py-0.5">
            {block.sets} series
          </span>
        )}
        {block.reps && (
          <span className="rounded-md bg-muted px-2 py-0.5">
            {block.reps} reps
          </span>
        )}
        {block.duration && (
          <span className="rounded-md bg-muted px-2 py-0.5">
            {block.duration}s
          </span>
        )}
        {block.rest && (
          <span className="rounded-md bg-muted px-2 py-0.5">
            Descanso {block.rest}s
          </span>
        )}
        {block.weight && (
          <span className="rounded-md bg-muted px-2 py-0.5">
            {block.weight}
          </span>
        )}
      </div>
      {block.notes && (
        <p className="text-xs text-muted-foreground mt-2 italic">{block.notes}</p>
      )}
      {block.videoUrls && block.videoUrls.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {block.videoUrls.map((v, i) => (
            <a
              key={i}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              {v.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE CARD DE RUTINA DEL DÍA
// ─────────────────────────────────────────────────────────────────────────────

function RoutineCard({
  routine,
  onComplete,
  isCompleting,
}: {
  routine: RoutineAssignmentForMember
  onComplete: (id: string) => void
  isCompleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const isCompleted = !!routine.myCompletion?.completedAt
  const content = routine.content as RoutineContent

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isCompleted ? 'border-green-500/40 bg-green-500/5' : 'border-border bg-card'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isCompleted
              ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            }
            <span className="text-sm font-medium text-foreground">
              {/* ⚠️ parseISO del slice(0,10) — NO new Date(): evita shift UTC→local en Chile */}
              {format(
                new Date((typeof routine.assignedDate === 'string'
                  ? routine.assignedDate
                  : (routine.assignedDate as Date).toISOString()
                ).slice(0, 10) + 'T12:00:00'),
                "EEEE d 'de' MMMM",
                { locale: es }
              )}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {routine.createdBy.firstName} {routine.createdBy.lastName}
            </span>
            {routine.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {routine.location}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary underline shrink-0"
        >
          {expanded ? 'Cerrar' : `Ver rutina (${content.blocks.length} bloques)`}
        </button>
      </div>

      {/* Nota general del día */}
      {routine.notes && (
        <p className="text-xs text-muted-foreground mt-2 italic">{routine.notes}</p>
      )}

      {/* Bloques expandidos */}
      {expanded && (
        <div className="mt-4 flex flex-col gap-3">
          {content.blocks.map((block, i) => (
            <RoutineBlockCard key={i} block={block} />
          ))}
        </div>
      )}

      {/* Completion */}
      {!isCompleted && (
        <button
          onClick={() => onComplete(routine.id)}
          disabled={isCompleting}
          className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isCompleting ? 'Guardando...' : 'Marcar como completada'}
        </button>
      )}

      {isCompleted && routine.myCompletion?.completedAt && (
        <p className="mt-3 text-center text-xs text-green-600">
          Completada el {format(new Date(routine.myCompletion.completedAt), "d MMM HH:mm", { locale: es })}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function RutinasPage() {
  const today = startOfDay(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(() => today)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const weekStart = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd")
  const weekEnd = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd")
  const dayStart = format(selectedDate, "yyyy-MM-dd")

  // React Query - fetch semana actual
  const { data: routines = [], isLoading } = useRoutines({ startDate: weekStart, endDate: weekEnd })
  const completeMutation = useCompleteRoutine()

  // Filtrar rutinas por día seleccionado
  const currentRoutines = useMemo(() => {
    return routines.filter((routine) => {
      const routineDateStr = (typeof routine.assignedDate === 'string'
          ? routine.assignedDate
          : (routine.assignedDate as Date).toISOString()
        ).slice(0, 10);
      return routineDateStr === dayStart;
    })
  }, [routines, dayStart])

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  return (
    <>
      <div className=" px-2 pt-2 rounded-xl  overflow-hidden sticky top-0 z-10 md:max-w-4xl mx-auto bg-black">
        <div className="max-w-full mx-auto px-4 sm:px-6 pt-4 bg-white rounded-t-xl">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 pb-3 hidden sm:block">
              Mis Rutinas
            </h1>
          </div>
        </div>
        <div className="max-w-full mx-auto px-4 sm:px-6 pt-1 bg-white rounded-b-xl">
          <WeeklyDatePicker
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            className=""
          />
        </div>
      </div>

      <div className="bg-black min-h-screen pb-28">
        <div className="max-w-4xl mx-auto px-4 pt-4 md:px-6">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col gap-3 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          )}

          {/* Lista de rutinas del día */}
          {!isLoading && currentRoutines.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              {currentRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onComplete={(id) => {
                    setCompletingId(id)
                    completeMutation.mutate({ id }, {
                      onSettled: () => setCompletingId(null)
                    })
                  }}
                  isCompleting={completingId === routine.id}
                />
              ))}
            </div>
          )}

          {/* Sin rutinas */}
          {!isLoading && currentRoutines.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm">
                No tienes rutinas asignadas para este día.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
