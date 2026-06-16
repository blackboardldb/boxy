'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle, Circle, MapPin, User } from 'lucide-react'
import { RoutineAssignmentForMember, RoutineContent, RoutineBlock } from '@/lib/types/routine'

// ─────────────────────────────────────────────────────────────────────────────
// FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchMyRoutines(from: string, to: string): Promise<RoutineAssignmentForMember[]> {
  const res = await fetch(`/api/routines?from=${from}&to=${to}`)
  if (!res.ok) throw new Error('Error al cargar rutinas')
  return res.json()
}

async function completeRoutine(assignmentId: string, memberNotes?: string) {
  const res = await fetch(`/api/routines/${assignmentId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberNotes }),
  })
  if (!res.ok) throw new Error('Error al marcar como completado')
  return res.json()
}

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
              {format(new Date(routine.assignedDate), "EEEE d 'de' MMMM", { locale: es })}
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
  const queryClient = useQueryClient()
  const [weekOffset, setWeekOffset] = useState(0)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const today = new Date()
  const weekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
  const weekEnd   = endOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })

  const from = format(weekStart, 'yyyy-MM-dd')
  const to   = format(weekEnd, 'yyyy-MM-dd')

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['my-routines', from, to],
    queryFn:  () => fetchMyRoutines(from, to),
  })

  const completeMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => completeRoutine(id),
    onMutate: ({ id }) => setCompletingId(id),
    onSettled: () => setCompletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-routines', from, to] })
    },
  })

  // Si no hay rutinas en ninguna semana, la sección no debería aparecer en el sidebar
  // Esta página solo es accesible si el centro tiene rutinas activas
  if (!isLoading && routines.length === 0 && weekOffset === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-sm">
          No tienes rutinas asignadas esta semana.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Navegación de semana */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="rounded-lg border border-border p-2 hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {weekOffset === 0
              ? 'Esta semana'
              : weekOffset === -1
              ? 'Semana pasada'
              : weekOffset === 1
              ? 'Próxima semana'
              : format(weekStart, "'Semana del' d MMM", { locale: es })
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {format(weekStart, 'd MMM', { locale: es })} — {format(weekEnd, 'd MMM yyyy', { locale: es })}
          </p>
        </div>

        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="rounded-lg border border-border p-2 hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Lista de rutinas */}
      {!isLoading && routines.length > 0 && (
        <div className="flex flex-col gap-4">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onComplete={(id) => completeMutation.mutate({ id })}
              isCompleting={completingId === routine.id}
            />
          ))}
        </div>
      )}

      {/* Semana sin rutinas — no es la semana actual */}
      {!isLoading && routines.length === 0 && weekOffset !== 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">
          Sin rutinas para esta semana.
        </p>
      )}
    </div>
  )
}
