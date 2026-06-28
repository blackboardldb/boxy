'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, Circle, MapPin } from 'lucide-react'
import { RoutineAssignmentFull, RoutineContent } from '@/lib/types/routine'
import { RoutineModal } from '@/components/routines/RoutineModal'

// ─────────────────────────────────────────────────────────────────────────────
// FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAssignments(from: string, to: string): Promise<RoutineAssignmentFull[]> {
  const res = await fetch(`/api/routines?from=${from}&to=${to}`)
  if (!res.ok) throw new Error('Error al cargar rutinas')
  return res.json()
}

async function deleteAssignment(id: string) {
  const res = await fetch(`/api/routines/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Error al eliminar rutina')
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE — CARD DE ASSIGNMENT EN EL CALENDARIO
// ─────────────────────────────────────────────────────────────────────────────

function AssignmentCard({
  assignment,
  onDelete,
  isDeleting,
}: {
  assignment: RoutineAssignmentFull
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const content = assignment.content as RoutineContent

  const totalMembers    = assignment.members.length
  const completedCount  = assignment.members.filter((m) => m.completedAt).length

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {content.blocks[0]?.title ?? 'Rutina'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Por {assignment.createdBy.firstName} {assignment.createdBy.lastName}
          </p>
          {assignment.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {assignment.location}
            </p>
          )}
        </div>

        <button
          onClick={() => onDelete(assignment.id)}
          disabled={isDeleting}
          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Completion summary */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalMembers} completaron
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary underline"
        >
          {expanded ? 'Cerrar' : 'Ver detalle'}
        </button>
      </div>

      {/* Detalle de miembros */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-1.5">
          {assignment.members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between text-xs">
              <span className="text-foreground">
                {m.user.firstName} {m.user.lastName}
              </span>
              {m.completedAt
                ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                : <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              }
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COLUMNA DE DÍA
// ─────────────────────────────────────────────────────────────────────────────

function DayColumn({
  date,
  assignments,
  onAdd,
  onDelete,
  deletingId,
}: {
  date: Date
  assignments: RoutineAssignmentFull[]
  onAdd: (date: Date) => void
  onDelete: (id: string) => void
  deletingId: string | null
}) {
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Header del día */}
      <div className={`text-center py-1.5 rounded-lg ${isToday ? 'bg-primary/10' : ''}`}>
        <p className="text-xs font-semibold text-foreground capitalize">
          {format(date, 'EEE', { locale: es })}
        </p>
        <p className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
          {format(date, 'd')}
        </p>
      </div>

      {/* Assignments del día */}
      <div className="flex flex-col gap-2">
        {assignments.map((a) => (
          <AssignmentCard
            key={a.id}
            assignment={a}
            onDelete={onDelete}
            isDeleting={deletingId === a.id}
          />
        ))}
      </div>

      {/* Botón agregar */}
      <button
        onClick={() => onAdd(date)}
        className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="h-3 w-3" />
        Agregar
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminRutinasPage() {
  const queryClient = useQueryClient()
  const [weekOffset, setWeekOffset]     = useState(0)
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  // selectedDate dispara apertura del modal — se implementa en Paso 16

  const today     = new Date()
  const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
  const weekEnd   = endOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
  const days      = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const from = format(weekStart, 'yyyy-MM-dd')
  const to   = format(weekEnd, 'yyyy-MM-dd')

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['admin-routines', from, to],
    queryFn:  () => fetchAssignments(from, to),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onMutate:   (id) => setDeletingId(id),
    onSettled:  () => setDeletingId(null),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['admin-routines', from, to] })
    },
  })

  // Agrupar assignments por fecha
  // ⚠️ NO usar new Date(a.assignedDate): la DB devuelve "2026-06-28T00:00:00.000Z" y al
  // instanciar un Date en Chile (UTC-4) se desplaza a "2026-06-27T20:00:00", rompiendo la clave.
  // Solución: extraer los primeros 10 chars del string ISO — siempre la fecha local correcta.
  const byDate = assignments.reduce<Record<string, RoutineAssignmentFull[]>>(
    (acc, a) => {
      const key = (typeof a.assignedDate === 'string'
        ? a.assignedDate
        : (a.assignedDate as Date).toISOString()
      ).slice(0, 10)
      if (!acc[key]) acc[key] = []
      acc[key].push(a)
      return acc
    },
    {}
  )

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Rutinas</h1>
          <p className="text-sm text-muted-foreground">
            {format(weekStart, "d MMM", { locale: es })} — {format(weekEnd, "d MMM yyyy", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="rounded-lg border border-border p-2 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
          >
            Hoy
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="rounded-lg border border-border p-2 hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-7 gap-3">
          {[1,2,3,4,5,6,7].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Calendario semanal */}
      {!isLoading && (
        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const key         = format(day, 'yyyy-MM-dd')
            const dayRoutines = byDate[key] ?? []

            return (
              <DayColumn
                key={key}
                date={day}
                assignments={dayRoutines}
                onAdd={(date) => setSelectedDate(date)}
                onDelete={(id) => deleteMutation.mutate(id)}
                deletingId={deletingId}
              />
            )
          })}
        </div>
      )}

      {/* Modal de creación */}
      {selectedDate && (
        <RoutineModal
          initialDate={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
