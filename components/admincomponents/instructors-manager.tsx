"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Instructor, Discipline } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus, Edit, Trash2, Search } from "lucide-react";
import {
  usePaginatedInstructors,
  useCreateInstructor,
  useUpdateInstructor,
  useDeleteInstructor,
  useToggleInstructorStatus,
} from "@/lib/react-query/hooks/useInstructors";
import { useDisciplines } from "@/lib/react-query/hooks/useDisciplines";

// ─── InstructorForm — componente independiente para evitar re-mount ──────────
// Definido FUERA de InstructorsManager para que React no lo desmonte al
// re-renderizar el padre.
function InstructorForm({
  instructor,
  disciplines,
  onClose,
  onSave,
}: {
  instructor?: Instructor | null;
  disciplines: Discipline[];
  onClose: () => void;
  onSave: (data: Partial<Instructor>) => Promise<boolean>;
}) {
  const [formData, setFormData] = useState({
    firstName: instructor?.firstName || "",
    lastName: instructor?.lastName || "",
    email: instructor?.email || "",
    phone: instructor?.phone || "",
    specialties: Array.isArray(instructor?.specialties)
      ? instructor.specialties
      : [],
    isActive: instructor?.isActive ?? true,
    role: instructor?.role || "coach",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar cuando cambie el instructor recibido
  useEffect(() => {
    setFormData({
      firstName: instructor?.firstName || "",
      lastName: instructor?.lastName || "",
      email: instructor?.email || "",
      phone: instructor?.phone || "",
      specialties: Array.isArray(instructor?.specialties)
        ? instructor.specialties
        : [],
      isActive: instructor?.isActive ?? true,
      role: instructor?.role || "coach",
    });
    setError(null);
    setIsSubmitting(false);
  }, [instructor]);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Por favor completa los campos obligatorios (Nombre, Apellido, Email).");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const instructorData = {
      ...formData,
      organizationId: "org_blacksheep_001",
    };

    try {
      const success = await onSave(instructorData);
      if (success) {
        onClose();
      } else {
        setError("No se pudo guardar la información del instructor. Por favor intenta nuevamente.");
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: instructor?.firstName || "",
      lastName: instructor?.lastName || "",
      email: instructor?.email || "",
      phone: instructor?.phone || "",
      specialties: Array.isArray(instructor?.specialties)
        ? instructor.specialties
        : [],
      isActive: instructor?.isActive ?? true,
      role: instructor?.role || "coach",
    });
    onClose();
  };

  const handleSpecialtyToggle = (disciplineId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, disciplineId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        specialties: prev.specialties.filter((id) => id !== disciplineId),
      }));
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {error && (
        <Alert variant="destructive" className="rounded-xl py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              placeholder="Nombre del instructor"
              required
              className="rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              placeholder="Apellido del instructor"
              required
              className="rounded-xl"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="instructor@blacksheep.com"
            required
            className="rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="+56 9 1234 5678"
            className="rounded-xl"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                isActive: checked as boolean,
              }))
            }
          />
          <Label htmlFor="isActive">Instructor activo</Label>
        </div>

        <div>
          <Label htmlFor="role">Rol</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                role: value as "admin" | "coach",
              }))
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Coach: acceso a clases, horarios, alumnos. Admin: acceso total.
          </p>
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Especialidades</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Selecciona las disciplinas que puede impartir este instructor
        </p>
        <div className="space-y-2">
          {(disciplines || []).map((discipline) => (
            <div key={discipline.id} className="flex items-center space-x-2">
              <Checkbox
                id={discipline.id}
                checked={formData.specialties.includes(discipline.id)}
                onCheckedChange={(checked) =>
                  handleSpecialtyToggle(discipline.id, checked as boolean)
                }
              />
              <Label
                htmlFor={discipline.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: discipline.color }}
                />
                {discipline.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={handleSubmit}
          className="flex-1 rounded-xl min-w-[140px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            (instructor ? "Actualizar" : "Crear") + " Instructor"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          className="rounded-xl"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ─── InstructorsManager ───────────────────────────────────────────────────────

export function InstructorsManager() {
  // Estado de filtros UI
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [activeFilter, setActiveFilter] = useState("todos");
  const limit = 10;

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset página al cambiar filtros
  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, activeFilter]);

  // React Query
  const { data: response, isFetching } = usePaginatedInstructors({
    page, limit, search: debouncedSearch, role: roleFilter, isActive: activeFilter,
  });
  const instructors = response?.data ?? [];
  const instructorsPagination = response?.pagination;

  const { data: disciplinesData } = useDisciplines();
  const disciplines = disciplinesData ?? [];

  const createInstructorMutation = useCreateInstructor();
  const updateInstructorMutation = useUpdateInstructor();
  const deleteInstructorMutation = useDeleteInstructor();
  const toggleStatusMutation = useToggleInstructorStatus();

  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [isAddingInstructor, setIsAddingInstructor] = useState(false);
  const [deletingInstructor, setDeletingInstructor] = useState<Instructor | null>(null);

  const handleSaveInstructor = async (instructorData: Partial<Instructor>): Promise<boolean> => {
    try {
      if (editingInstructor) {
        await updateInstructorMutation.mutateAsync({ id: editingInstructor.id, data: instructorData });
        setEditingInstructor(null);
      } else {
        await createInstructorMutation.mutateAsync(instructorData);
        setIsAddingInstructor(false);
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteInstructor = async (instructorId: string) => {
    await deleteInstructorMutation.mutateAsync(instructorId);
  };

  const handleToggleStatus = async (instructorId: string, currentStatus: boolean) => {
    await toggleStatusMutation.mutateAsync({ id: instructorId, currentStatus });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold order-2 sm:order-1">Instructores</h2>
       <div className="order-1 sm:order-2 w-full sm:w-auto text-right">
         <Dialog open={isAddingInstructor} onOpenChange={setIsAddingInstructor}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Instructor</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo instructor
              </DialogDescription>
            </DialogHeader>
            <InstructorForm
              instructor={null}
              disciplines={disciplines}
              onClose={() => setIsAddingInstructor(false)}
              onSave={handleSaveInstructor}
            />
          </DialogContent>
        </Dialog>
       </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="todos">Todos los roles</SelectItem>
            <SelectItem value="coach">Coach</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="true">Activo</SelectItem>
            <SelectItem value="false">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Información de resultados */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Mostrando {instructors.length} de {instructorsPagination?.total || 0}{" "}
          instructores
        </p>
        {instructorsPagination && instructorsPagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl"
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {instructorsPagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) =>
                  Math.min(instructorsPagination.totalPages, p + 1)
                )
              }
              disabled={page === instructorsPagination.totalPages}
              className="rounded-xl"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      <Card className="rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching && instructors.length === 0 ? (
                // Skeleton para tabla
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16 rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : instructors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {instructorsPagination?.total === 0
                      ? "No se encontraron instructores"
                      : "No hay instructores en esta página"}
                  </TableCell>
                </TableRow>
              ) : (
                instructors?.map((instructor: Instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell className="font-medium">
                      {instructor.firstName} {instructor.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          instructor.role === "admin" ? "default" : "secondary"
                        }
                        className="capitalize rounded-xl"
                      >
                        {instructor.role || "coach"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {instructor.specialties?.length > 0 ? (
                          instructor.specialties.map((specialtyId: string) => {
                            const discipline = disciplines?.find(
                              (d) => d.id === specialtyId
                            );
                            return discipline ? (
                              <div
                                key={specialtyId}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: discipline.color }}
                                />
                                <span className="text-sm">
                                  {discipline.name}
                                </span>
                              </div>
                            ) : (
                              <Badge
                                key={specialtyId}
                                variant="outline"
                                className="text-xs rounded-xl text-amber-700 border-amber-200 bg-amber-50"
                              >
                                Disciplina eliminada
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Sin especialidades
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={instructor.isActive ? "default" : "secondary"}
                        className="cursor-pointer hover:opacity-80 transition-opacity rounded-xl"
                      onClick={() => handleToggleStatus(instructor.id, instructor.isActive)}
                      >
                        {instructor.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={editingInstructor?.id === instructor.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingInstructor(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setEditingInstructor(instructor)}
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background text-zinc-900 hover:bg-zinc-100 h-10 w-10 rounded-xl"
                            >
                              <Edit />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl rounded-xl">
                            <DialogHeader>
                              <DialogTitle>Editar Instructor</DialogTitle>
                              <DialogDescription>
                                Modifica la información del instructor
                              </DialogDescription>
                            </DialogHeader>
                            <InstructorForm
                              instructor={editingInstructor}
                              disciplines={disciplines}
                              onClose={() => setEditingInstructor(null)}
                              onSave={handleSaveInstructor}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          onClick={() => setDeletingInstructor(instructor)}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 w-10 rounded-xl"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingInstructor !== null}
        onOpenChange={(open) => !open && setDeletingInstructor(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar instructor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              instructor{" "}
              <strong>
                {deletingInstructor?.firstName} {deletingInstructor?.lastName}
              </strong>{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingInstructor) {
                  handleDeleteInstructor(deletingInstructor.id);
                  setDeletingInstructor(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
