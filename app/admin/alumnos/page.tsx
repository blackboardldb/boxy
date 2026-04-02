"use client";

import { useState, useEffect } from "react";
import { Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddStudentModal } from "../../../components/admincomponents/add-student-modal";
import {
  useBlackSheepStore,
  STUDENT_STATES,
  STATE_COLORS,
} from "@/lib/blacksheep-store";
import type { FitCenterUserProfile } from "@/lib/types";
// Removed unused pagination imports
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateShort, getPlanStatus } from "@/lib/utils";

import { parseISO, format } from "date-fns";

// Función helper para formatear fechas
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  return format(parseISO(dateString.substring(0, 10)), "dd/MM/yyyy");
};
import { useRouter } from "next/navigation";

export default function AlumnosPage() {
  const router = useRouter();
  const {
    users = [],
    fetchUsers,
    pagination,
    // updateUser, // Currently unused
    // addUser, // Currently unused
    createUser,
    updateUserById,
    plans = [],
    fetchPlans,
  } = useBlackSheepStore();

  // Filtrar usuarios para excluir staff (admin/coach) - solo mostrar alumnos
  const studentsOnly = users.filter(
    (user) => !user.role || user.role === "user" // Solo usuarios sin rol o con rol "user"
  );

  // const { toast } = useToast(); // Eliminado

  const [isLoading, setIsLoading] = useState(true);

  // Estado de paginación y filtros
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar usuarios al montar el componente y cuando cambian filtros/página
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchUsers(
          page,
          limit,
          debouncedSearch,
          undefined, // No filtrar por rol específico (incluye usuarios sin rol = alumnos)
          statusFilter !== "todos" ? statusFilter : undefined
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    
    // Solo cargar planes si no existen (optimización Punto 1 matizado)
    if (plans.length === 0) {
      fetchPlans(1, 100);
    }
  }, [page, debouncedSearch, statusFilter, fetchUsers, fetchPlans, plans.length]);

  // Resetear página si cambia el filtro de búsqueda o estado
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const getStatusBadge = (status: string) => {
    const color =
      STATE_COLORS[status as keyof typeof STATE_COLORS] || "#6b7280";
    
    const labels: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
      scheduled: "Programado",
    };

    return (
      <Badge className="text-white border-0 rounded-xl" style={{ backgroundColor: color }}>
        {labels[status] || status}
      </Badge>
    );
  };

  const handleEditStudent = (student: FitCenterUserProfile) => {
    router.push(`/admin/alumnos/${student.id}`);
  };

  // Paginación real desde el store
  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + (users?.length || 0), totalItems);

  return (
    <div className="p-4 pt-8 md:p-8 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
        <h1 className="text-3xl font-bold order-2 sm:order-1 ">Gestión de Alumnos</h1>
        <div className="order-1 sm:order-2 flex end justify-end w-full sm:w-auto">
        <AddStudentModal
          onAddStudent={async (studentData) => {
            const result = await createUser(studentData);
            return !!result;
          }}
          plans={plans}
          onSuccess={() => {
            // Refrescar la lista después de agregar/editar
            fetchUsers(
              page,
              limit,
              searchTerm,
              undefined, // No filtrar por rol específico (incluye usuarios sin rol = alumnos)
              statusFilter !== "todos" ? statusFilter : undefined
            );
          }}
        />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value={STUDENT_STATES.ACTIVE}>Activo</SelectItem>
            <SelectItem value={STUDENT_STATES.INACTIVE}>Inactivo</SelectItem>
            <SelectItem value={STUDENT_STATES.SCHEDULED}>
              Programado
            </SelectItem>
            <SelectItem value={STUDENT_STATES.PENDING}>
              Nuevo - Pendiente
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Información de resultados */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-{endIndex} de {totalItems} alumnos
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      <Card className="rounded-xl overflow-hidden border-zinc-100">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Validez</TableHead>
                <TableHead>Editar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && users.length === 0 ? (
                // Skeleton para tabla
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : studentsOnly.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {totalItems === 0
                      ? "No se encontraron alumnos"
                      : "No hay alumnos en esta página"}
                  </TableCell>
                </TableRow>
              ) : (
                studentsOnly.map((student: FitCenterUserProfile) => {
                  const currentPlanStatus = getPlanStatus(student);
                  return (
                    <TableRow
                      key={student.id}
                      className={
                        currentPlanStatus === "pending"
                          ? "bg-yellow-50 border-l-4 border-yellow-400"
                          : currentPlanStatus === "inactive"
                          ? "bg-zinc-50 border-l-4 border-zinc-300"
                          : currentPlanStatus === "scheduled"
                          ? "bg-blue-50 border-l-4 border-blue-400"
                          : ""
                      }
                    >
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {student.membership?.membershipType || "Sin plan"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(currentPlanStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatDate(student.membership?.currentPeriodStart)} -{" "}
                          {formatDate(student.membership?.currentPeriodEnd)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Forma de pago:{" "}
                          {student.formaDePago || "Sin especificar"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleEditStudent(student)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background text-zinc-900 hover:bg-zinc-100 h-10 w-10 rounded-xl"
                      >
                        <Edit />
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
