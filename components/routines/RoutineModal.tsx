'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Plus, Trash2, Search } from 'lucide-react'
import { RoutineBlock } from '@/lib/types/routine'

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

type ModalMode = 'day' | 'week'

interface DayContent {
  assignedDate: string
  blocks: RoutineBlock[]
  location?: string
  notes?: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface ExerciseOption {
  id: string
  name: string
  category: string | null
  muscleGroup: string | null
  isCustom: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchMembers(): Promise<Member[]> {
  const res = await fetch('/api/users?role=ALUMNO&status=active&limit=200')
  if (!res.ok) throw new Error('Error al cargar alumnos')
  const body = await res.json()
  // GET /api/users devuelve PaginatedApiResponse { success: true, data: [...], pagination: {...} }
  return Array.isArray(body) ? body : (body.data ?? [])
}

async function searchExercises(q: string): Promise<ExerciseOption[]> {
  const res = await fetch(`/api/exercises?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error('Error al buscar ejercicios')
  return res.json()
}

async function submitAssignment(payload: unknown) {
  const res = await fetch('/api/routines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    let errorMessage = err.error ?? 'Error al guardar rutina'
    if (typeof errorMessage === 'object') {
      if (errorMessage.fieldErrors) {
        errorMessage = Object.values(errorMessage.fieldErrors).flat().join(', ')
      } else if (errorMessage.formErrors && errorMessage.formErrors.length > 0) {
        errorMessage = errorMessage.formErrors.join(', ')
      } else {
        errorMessage = JSON.stringify(errorMessage)
      }
    }
    throw new Error(errorMessage)
  }
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK EDITOR — un bloque individual editable
// ─────────────────────────────────────────────────────────────────────────────

function BlockEditor({
  block,
  index,
  onChange,
  onRemove,
}: {
  block: RoutineBlock
  index: number
  onChange: (index: number, block: RoutineBlock) => void
  onRemove: (index: number) => void
}) {
  const [exerciseQuery, setExerciseQuery] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const { data: exerciseResults = [] } = useQuery({
    queryKey: ['exercises-search', exerciseQuery],
    queryFn: () => searchExercises(exerciseQuery),
    enabled: exerciseQuery.length >= 2,
  })

  if (block.kind === 'text') {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Texto libre
          </span>
          <button
            onClick={() => onRemove(index)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Título (ej: Calentamiento)"
          value={block.title}
          onChange={(e) => onChange(index, { ...block, title: e.target.value })}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
        <textarea
          placeholder="Descripción, instrucciones, notas..."
          value={block.body}
          onChange={(e) => onChange(index, { ...block, body: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm resize-none"
        />
      </div>
    )
  }

  // kind === 'exercise'
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ejercicio
        </span>
        <button
          onClick={() => onRemove(index)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Buscador de ejercicio */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar ejercicio o escribir nombre libre..."
          value={block.exerciseName}
          onChange={(e) => {
            onChange(index, { ...block, exerciseName: e.target.value, exerciseId: undefined })
            setExerciseQuery(e.target.value)
            setShowPicker(true)
          }}
          onBlur={() => setTimeout(() => setShowPicker(false), 150)}
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
        {showPicker && exerciseResults.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-md border border-border bg-background shadow-lg max-h-40 overflow-y-auto">
            {exerciseResults.map((ex) => (
              <button
                key={ex.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(index, {
                    ...block,
                    exerciseId: ex.id,
                    exerciseName: ex.name,
                    title: block.title || ex.name,
                  })
                  setExerciseQuery('')
                  setShowPicker(false)
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
              >
                <span>{ex.name}</span>
                {ex.category && (
                  <span className="text-xs text-muted-foreground">{ex.category}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Título del bloque */}
      <input
        type="text"
        placeholder="Título del bloque (por defecto: nombre del ejercicio)"
        value={block.title}
        onChange={(e) => onChange(index, { ...block, title: e.target.value })}
        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
      />

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            { label: 'Series', key: 'sets', type: 'number', placeholder: '4' },
            { label: 'Reps', key: 'reps', type: 'text', placeholder: '10 o 8-12' },
            { label: 'Peso', key: 'weight', type: 'text', placeholder: '70kg' },
            { label: 'Descanso (s)', key: 'rest', type: 'number', placeholder: '90' },
          ] as const
        ).map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="text-[10px] text-muted-foreground font-medium">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={(block as unknown as Record<string, unknown>)[key] as string ?? ''}
              onChange={(e) => {
                const val = e.target.value
                const parsed =
                  type === 'number' && val ? Number(val) : val || undefined
                onChange(index, { ...block, [key]: parsed })
              }}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm mt-0.5"
            />
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Notas técnicas (opcional)"
        value={block.notes ?? ''}
        onChange={(e) =>
          onChange(index, { ...block, notes: e.target.value || undefined })
        }
        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DAY EDITOR — editor de bloques de un día
// ─────────────────────────────────────────────────────────────────────────────

function DayEditor({
  day,
  onChange,
}: {
  day: DayContent
  onChange: (day: DayContent) => void
}) {
  function addBlock(kind: 'text' | 'exercise') {
    const newBlock: RoutineBlock =
      kind === 'text'
        ? { kind: 'text', title: '', body: '' }
        : { kind: 'exercise', title: '', exerciseName: '' }
    onChange({ ...day, blocks: [...day.blocks, newBlock] })
  }

  function updateBlock(index: number, block: RoutineBlock) {
    const blocks = [...day.blocks]
    blocks[index] = block
    onChange({ ...day, blocks })
  }

  function removeBlock(index: number) {
    onChange({ ...day, blocks: day.blocks.filter((_, i) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Locación (opcional)"
          value={day.location ?? ''}
          onChange={(e) => onChange({ ...day, location: e.target.value || undefined })}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
        <input
          type="text"
          placeholder="Nota general (opcional)"
          value={day.notes ?? ''}
          onChange={(e) => onChange({ ...day, notes: e.target.value || undefined })}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
      </div>

      {day.blocks.map((block, i) => (
        <BlockEditor
          key={i}
          block={block}
          index={i}
          onChange={updateBlock}
          onRemove={removeBlock}
        />
      ))}

      <div className="flex gap-2">
        <button
          onClick={() => addBlock('exercise')}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-3 w-3" />
          Ejercicio
        </button>
        <button
          onClick={() => addBlock('text')}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-3 w-3" />
          Texto libre
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTINE MODAL — componente principal exportado
// ─────────────────────────────────────────────────────────────────────────────

export function RoutineModal({
  initialDate,
  onClose,
}: {
  initialDate: Date
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<ModalMode>('day')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Modo día
  const [dayContent, setDayContent] = useState<DayContent>({
    assignedDate: format(initialDate, 'yyyy-MM-dd'),
    blocks: [],
  })

  // Modo semana (Lun–Dom de la semana del initialDate)
  const weekStart = startOfWeek(initialDate, { weekStartsOn: 1 })
  const [weekDays, setWeekDays] = useState<DayContent[]>(
    Array.from({ length: 7 }, (_, i) => ({
      assignedDate: format(addDays(weekStart, i), 'yyyy-MM-dd'),
      blocks: [],
    }))
  )
  const [activeDayIndex, setActiveDayIndex] = useState(0)

  const { data: members = [] } = useQuery({
    queryKey: ['members-for-routine'],
    queryFn: fetchMembers,
  })

  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
  )

  function toggleMember(id: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const submitMutation = useMutation({
    mutationFn: submitAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-routines'] })
      queryClient.invalidateQueries({ queryKey: ['routine-templates'] })
      queryClient.invalidateQueries({ queryKey: ['has-routines'] })
      onClose()
    },
    onError: (e: Error) => setError(e.message),
  })

  function handleSubmit() {
    setError(null)

    if (selectedMemberIds.length === 0) {
      setError('Debes seleccionar al menos un alumno.')
      return
    }

    if (saveAsTemplate && !templateName.trim()) {
      setError('Escribe un nombre para el template.')
      return
    }

    const sanitizeBlocks = (blocks: RoutineBlock[]) => blocks.map(b => ({
      ...b,
      title: b.title?.trim() ? b.title : (b.kind === 'exercise' ? (b.exerciseName || 'Ejercicio') : 'Texto')
    }))

    if (mode === 'day') {
      if (dayContent.blocks.length === 0) {
        setError('Agrega al menos un bloque a la rutina.')
        return
      }
      submitMutation.mutate({
        mode: 'day',
        assignedDate: dayContent.assignedDate,
        content: { blocks: sanitizeBlocks(dayContent.blocks) },
        location: dayContent.location,
        notes: dayContent.notes,
        memberUserIds: selectedMemberIds,
        saveAsTemplate,
        templateName: saveAsTemplate ? templateName.trim() : undefined,
      })
      return
    }

    // Modo semana
    const daysWithContent = weekDays.filter((d) => d.blocks.length > 0)
    if (daysWithContent.length === 0) {
      setError('Agrega bloques en al menos un día.')
      return
    }
    submitMutation.mutate({
      mode: 'week',
      days: daysWithContent.map((d) => ({
        assignedDate: d.assignedDate,
        content: { blocks: sanitizeBlocks(d.blocks) },
        location: d.location,
        notes: d.notes,
      })),
      memberUserIds: selectedMemberIds,
      saveAsTemplate,
      templateName: saveAsTemplate ? templateName.trim() : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-background shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {mode === 'day' ? 'Crear rutina del día' : 'Crear rutina de la semana'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === 'day'
                ? format(initialDate, "EEEE d 'de' MMMM", { locale: es })
                : `Semana del ${format(weekStart, 'd MMM', { locale: es })}`}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-6">

          {/* ── Selector modo ── */}
          <div className="flex rounded-lg border border-border p-1 gap-1">
            {(['day', 'week'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'day' ? 'Un día' : 'Semana completa'}
              </button>
            ))}
          </div>

          {/* ── Editor modo día ── */}
          {mode === 'day' && (
            <DayEditor day={dayContent} onChange={setDayContent} />
          )}

          {/* ── Editor modo semana — tabs por día ── */}
          {mode === 'week' && (
            <div>
              <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
                {weekDays.map((day, i) => (
                  <button
                    key={day.assignedDate}
                    onClick={() => setActiveDayIndex(i)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeDayIndex === i
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {format(new Date(day.assignedDate + 'T12:00:00'), 'EEE d', { locale: es })}
                    {day.blocks.length > 0 && (
                      <span className="ml-1 rounded-full bg-current/20 px-1 text-[10px]">
                        {day.blocks.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <DayEditor
                day={weekDays[activeDayIndex]}
                onChange={(updated) => {
                  const days = [...weekDays]
                  days[activeDayIndex] = updated
                  setWeekDays(days)
                }}
              />
            </div>
          )}

          {/* ── Selector de alumnos ── */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Asignar a{' '}
              <span className="text-muted-foreground font-normal">
                ({selectedMemberIds.length} seleccionados)
              </span>
            </p>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-1.5 text-sm"
              />
            </div>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {filteredMembers.length === 0 && (
                <p className="px-3 py-4 text-xs text-center text-muted-foreground">
                  No hay alumnos activos
                </p>
              )}
              {filteredMembers.map((m) => {
                const selected = selectedMemberIds.includes(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors ${
                      selected ? 'bg-primary/5' : 'hover:bg-muted'
                    }`}
                  >
                    <span className={selected ? 'text-primary font-medium' : 'text-foreground'}>
                      {m.firstName} {m.lastName}
                    </span>
                    {selected && <span className="text-xs text-primary font-bold">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Guardar como template ── */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-foreground">
                Guardar como template reutilizable
              </span>
            </label>
            {saveAsTemplate && (
              <input
                type="text"
                placeholder="Nombre del template (ej: Rutina de piernas A)"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              />
            )}
          </div>

          {/* ── Error ── */}
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-border sticky bottom-0 bg-background flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {submitMutation.isPending ? 'Guardando...' : 'Publicar rutina'}
          </button>
        </div>
      </div>
    </div>
  )
}
