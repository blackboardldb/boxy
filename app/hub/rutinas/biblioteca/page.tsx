'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { RoutineTemplateWithCreator, RoutineContent } from '@/lib/types/routine'
import { RoutineModal } from '@/components/routines/RoutineModal'

// ─────────────────────────────────────────────────────────────────────────────
// FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchTemplates(): Promise<RoutineTemplateWithCreator[]> {
  const res = await fetch('/api/routine-templates')
  if (!res.ok) throw new Error('Error al cargar templates')
  return res.json()
}

async function deleteTemplate(id: string) {
  const res = await fetch(`/api/routine-templates/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Error al eliminar template')
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onDelete,
  isDeleting,
}: {
  template: RoutineTemplateWithCreator
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const content = template.content as RoutineContent

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{template.name}</p>
          {template.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Creado por {template.createdBy.firstName} {template.createdBy.lastName}
            {' · '}
            {format(new Date(template.createdAt), 'd MMM yyyy', { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onDelete(template.id)}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
            title="Eliminar template"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.blocks.length}{' '}
          {content.blocks.length === 1 ? 'bloque' : 'bloques'}
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {expanded ? 'Cerrar' : 'Ver bloques'}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {content.blocks.map((block, i) => (
            <div key={i} className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-xs font-medium text-foreground">{block.title}</p>
              {block.kind === 'exercise' && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[
                    block.sets && `${block.sets} series`,
                    block.reps && `${block.reps} reps`,
                    block.weight,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {block.kind === 'text' && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {block.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA
// ─────────────────────────────────────────────────────────────────────────────

export default function BibliotecaPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['routine-templates'],
    queryFn: fetchTemplates,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine-templates'] })
    },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Biblioteca de rutinas</h1>
          <p className="text-sm text-muted-foreground">
            Templates reutilizables del centro
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva rutina
        </button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm font-medium">
            No hay rutinas guardadas todavía.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Crea una desde aquí o guarda una al asignar una rutina del día.
          </p>
        </div>
      )}

      {/* Template list */}
      {!isLoading && templates.length > 0 && (
        <div className="flex flex-col gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deletingId === template.id}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <RoutineModal
          initialDate={new Date()}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
