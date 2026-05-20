"use client";

import { useState, useEffect } from "react";
import { Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admincomponents/admin-pagination";
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
  STUDENT_STATES,
  STATE_COLORS,
  statusStyles,
} from "@/lib/utils";
import { usePaginatedUsers } from "@/lib/react-query/hooks/useUsers";
import { usePlans } from "@/lib/react-query/hooks/usePlans";
import type { FitCenterUserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateShort, getPlanStatus } from "@/lib/utils";

import { parseISO, format } from "date-fns";

// Función helper para formatear fechas
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  return format(parseISO(dateString.substring(0, 10)), "dd/MM/yy");
};
import { useRouter } from "next/navigation";
import { useCreateUser } from "@/lib/react-query/hooks/useUsers";

export default function AlumnosPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();

  // Estado de filtros
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const limit = 10;

  // React Query
  const { data, isFetching } = usePaginatedUsers({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter !== "todos" ? statusFilter : undefined,
    role: "user",
  });
  const { data: plansData } = usePlans({ limit: 100 });

  const users = data?.users ?? [];
  const pagination = data?.pagination ?? null;
  const plans = plansData ?? [];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Resetear a página 1 cuando cambia filtro o búsqueda
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const getStatusBadge = (status: string) => {
    const color =
      statusStyles[status as keyof typeof statusStyles] || "#6b7280";
    
    const labels: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
      scheduled: "Programado",
    };

    return (
      <div className={`rounded-xl px-1.5 py-0.5 text-[0.7rem] font-medium border inline-block ${color}`}>
        {labels[status] || status}
      </div>
    );
  };

  const handleEditStudent = (student: FitCenterUserProfile) => {
    router.push(`/admin/alumnos/${student.id}`);
  };

  // Paginación desde React Query
  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? 1;
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + users.length, totalItems);

  return (
    <div className="p-4 pt-8 md:p-8 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
        <h1 className="text-3xl font-bold order-2 sm:order-1 ">Gestión de Alumnos</h1>
        <div className="order-1 sm:order-2 flex end justify-end w-full sm:w-auto">
        <AddStudentModal
          onAddStudent={async (studentData) => {
            await createUserMutation.mutateAsync(studentData);
            return true;
          }}
          plans={plans}
          onSuccess={() => {
            // Ya no es necesario invalidar manualmente porque
            // useCreateUser en onSuccess ya llama a queryClient.invalidateQueries(userKeys.lists())
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

    <div>
       <p className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-{endIndex} de {totalItems} alumnos
        </p>
    </div>
      <Card className="rounded-xl overflow-hidden border-zinc-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Plan</TableHead>
              
                <TableHead className="hidden sm:table-cell">Validez</TableHead>
                <TableHead>Editar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && users.length === 0 ? (
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
                      <Skeleton className="h-4 w-20 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {totalItems === 0
                      ? "No se encontraron alumnos"
                      : "No hay alumnos en esta página"}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((student: FitCenterUserProfile) => {
                  const rawPlanStatus = getPlanStatus(student);
                  const hasScheduledRenewal = student.membershipRenewals?.some(
                    (r: any) => r.status === 'scheduled'
                  );
                  const currentPlanStatus =
                    rawPlanStatus === 'inactive' && hasScheduledRenewal ? 'scheduled' : rawPlanStatus;
                  return (
                    <TableRow
                      key={student.id}
                      className={
                        currentPlanStatus === "pending"
                          ? " border-l-4 border-l-yellow-400"
                          : currentPlanStatus === "inactive"
                          ? " border-l-4 border-l-zinc-300"
                          : currentPlanStatus === "scheduled"
                          ? " border-l-4 border-l-blue-400"
                          : ""
                      }
                    >
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell className="text-left flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                       <p className="font-medium">
                        {student.membership?.membershipType || "Sin plan"} 
                      </p>
                      {getStatusBadge(currentPlanStatus)}
                     </div>
                     <div className="space-y-1 sm:hidden">
                        <div className="text-xs">
                          {formatDate(student.membership?.currentPeriodStart)} -{" "}
                          {formatDate(student.membership?.currentPeriodEnd)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                         
                          {student.formaDePago || "Sin especificar"}
                        </div>
                      </div>
                    </TableCell>
                  
                    <TableCell className="hidden sm:table-cell ">
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatDate(student.membership?.currentPeriodStart)} -{" "}
                          {formatDate(student.membership?.currentPeriodEnd)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                         
                          {student.formaDePago || "Sin especificar"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-20">
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

        {/* Información de resultados */}
      <div className="flex justify-end items-center">
       
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

    </div>
  );
}
