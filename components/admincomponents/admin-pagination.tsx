import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * AdminPagination — controles Anterior / Página X de Y / Siguiente para
 * los listados paginados del panel admin.
 *
 * Se renderiza solo si `totalPages > 1`. Los botones quedan deshabilitados
 * automáticamente en los extremos (primera y última página).
 *
 * Uso:
 *   <AdminPagination
 *     currentPage={page}
 *     totalPages={totalPages}
 *     onPrev={() => setPage((p) => Math.max(1, p - 1))}
 *     onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
 *   />
 */
export function AdminPagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={currentPage === 1}
        className="rounded-xl"
      >
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="rounded-xl"
      >
        Siguiente
      </Button>
    </div>
  );
}
