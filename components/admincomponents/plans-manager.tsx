"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/lib/react-query/hooks/usePlans";
import { useDisciplines } from "@/lib/react-query/hooks/useDisciplines";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  calcularClasesSegunDuracion,
  filterPlansByCategory,
  type PlanCategory,
} from "@/lib/utils";
import type { MembershipPlan } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/lib/react-query/hooks/useMe";
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  Search,
  Receipt,
  CalendarCheck,
  Loader2,
  AlertCircle,
  Save,
} from "lucide-react";

const emptyPlan: Omit<MembershipPlan, "id" | "organizationId"> = {
  name: "",
  description: "",
  price: 0, // Inicializado en 0
  durationInMonths: 1,
  classLimit: 8,
  disciplineAccess: "all",
  allowedDisciplines: [],
  canFreeze: false, // Campo mantenido para compatibilidad pero no usado
  freezeDurationDays: 0, // Campo mantenido para compatibilidad pero no usado
  autoRenews: true, // Mantenemos el campo pero no lo mostramos en la UI
  isActive: true,
};

// Opciones de duración predefinidas
const durationOptions = [
  { value: 1, label: "Mensual (1 mes)" },
  { value: 3, label: "Trimestral (3 meses)" },
  { value: 6, label: "Semestral (6 meses)" },
  { value: 12, label: "Anual (12 meses)" },
];

export default function PlansManager() {
  // ── Estados de filtro ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [durationFilter, setDurationFilter] = useState("todos");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── React Query ───────────────────────────────────────────────────────────
  const { data: plans = [], isLoading } = usePlans({
    page: 1,
    limit: 50,
    search: debouncedSearch,
    isActive: activeFilter !== "todos" ? activeFilter : undefined,
  });
  const { data: disciplines = [] } = useDisciplines({ limit: 50 });

  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  // ── Estados de UI ─────────────────────────────────────────────────────────
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [planForm, setPlanForm] =
    useState<Omit<MembershipPlan, "id" | "organizationId">>(emptyPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const { data: currentUser } = useMe();

  // ── Filtros y búsqueda ────────────────────────────────────────────────────

  // --- Gestión de planes ---
  const handleNewPlan = () => {
    setPlanForm(emptyPlan);
    setEditingPlan(null);
    setError(null);
    setIsSubmitting(false);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationInMonths: plan.durationInMonths,
      classLimit: plan.classLimit,
      disciplineAccess: plan.disciplineAccess,
      allowedDisciplines: plan.allowedDisciplines,
      canFreeze: plan.canFreeze, // Campo mantenido para compatibilidad pero no usado
      freezeDurationDays: plan.freezeDurationDays, // Campo mantenido para compatibilidad pero no usado
      autoRenews: plan.autoRenews, // Mantenemos el campo pero no lo mostramos en la UI
      isActive: plan.isActive,
    });
    setEditingPlan(plan.id);
    setError(null);
    setIsSubmitting(false);
    setShowPlanModal(true);
  };

  const handleDeletePlan = (id: string) => {
    setPlanToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeletePlan = async () => {
    if (planToDelete) {
      try {
        await deletePlanMutation.mutateAsync(planToDelete);
      } catch (error) {
        console.error("Error deleting plan:", error);
      } finally {
        setShowDeleteModal(false);
        setPlanToDelete(null);
      }
    }
  };

  const handlePlanChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      val = e.target.checked;
    } else if (type === "number") {
      val = Number(value);
    }
    setPlanForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPlanForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDiscipline = (disciplineId: string) => {
    setPlanForm((prev) => {
      const isSelected = prev.allowedDisciplines.includes(disciplineId);
      const newAllowedDisciplines = isSelected
        ? prev.allowedDisciplines.filter((id) => id !== disciplineId)
        : [...prev.allowedDisciplines, disciplineId];

      return {
        ...prev,
        allowedDisciplines: newAllowedDisciplines,
        disciplineAccess:
          newAllowedDisciplines.length === 0 ? "all" : "limited",
      };
    });
  };

  // Calcular clases totales según duración
  const clasesTotales = calcularClasesSegunDuracion(
    planForm.classLimit,
    planForm.durationInMonths
  );

  const handleSavePlan = async () => {
    // Validación básica
    if (!planForm.name || !planForm.price) {
      setError("El nombre y el precio son campos obligatorios.");
      return;
    }

    // Validación de precio
    const priceValue =
      typeof planForm.price === "string"
        ? Number(planForm.price)
        : planForm.price;
    if (isNaN(priceValue) || priceValue < 0) {
      setError("El precio debe ser un número válido mayor o igual a 0.");
      return;
    }

    // Validación de límite de clases
    if (planForm.classLimit < 0) {
      setError("El límite de clases debe ser mayor o igual a 0.");
      return;
    }

    if (!currentUser?.organizationId) {
      setError("Error de sesión: No se pudo determinar la organización. Por favor, recarga la página.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const planData = {
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        price: priceValue,
        durationInMonths: Number(planForm.durationInMonths),
        classLimit: Number(planForm.classLimit),
        disciplineAccess: planForm.disciplineAccess,
        allowedDisciplines: planForm.allowedDisciplines || [],
        canFreeze: planForm.canFreeze,
        freezeDurationDays: Number(planForm.freezeDurationDays),
        autoRenews: planForm.autoRenews,
        isActive: planForm.isActive,
        organizationId: currentUser.organizationId,
      };

      if (editingPlan) {
        await updatePlanMutation.mutateAsync({ id: editingPlan, data: planData });
      } else {
        await createPlanMutation.mutateAsync(planData);
      }

      setShowPlanModal(false);
      setPlanForm(emptyPlan);
      setEditingPlan(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado al guardar el plan.";
      console.error("Error saving plan:", err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 py-8 max-w-7xl mx-auto px-4 sm:px-8">
      {/* Header con gestión de planes */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
        <div className="order-2 sm:order-1 text-left w-full sm:w-auto">
          <h2 className="text-3xl font-bold">Planes disponibles</h2>
         
        </div>
        <div className="order-1 sm:order-2 flex justify-end w-full sm:w-auto">
          <Button onClick={handleNewPlan} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Plan
        </Button>
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="flex flex-col sm:flex-row  gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
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
        <Select value={durationFilter} onValueChange={setDurationFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <SelectValue placeholder="Filtrar por duración" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="todos">Todas las duraciones</SelectItem>
            <SelectItem value="monthly">Planes Mensuales</SelectItem>
            <SelectItem value="extended">Planes Extendidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          // Skeleton simplificado para cards de planes
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-xl" />
                    <Skeleton className="h-6 w-32 rounded-xl" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <Skeleton className="w-8 h-8 rounded-xl" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16 rounded-xl" />
                    <Skeleton className="h-4 w-20 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12 rounded-xl" />
                    <Skeleton className="h-4 w-24 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12 rounded-xl" />
                    <Skeleton className="h-4 w-16 rounded-xl" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Skeleton className="h-4 w-32 mb-2 rounded-xl" />
                  <Skeleton className="h-4 w-40 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : !plans || plans.length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No hay planes configurados
                </p>
                <Button onClick={handleNewPlan} className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Crear primer plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          plans
            ?.filter((plan) => plan && plan.id && plan.name)
            .filter((plan) => {
              // Apply duration filter
              if (durationFilter === "todos") return true;
              if (
                durationFilter === "monthly" ||
                durationFilter === "extended"
              ) {
                return (
                  filterPlansByCategory([plan], durationFilter as PlanCategory)
                    .length > 0
                );
              }
              return true;
            })
            .map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow rounded-xl">
                <CardHeader className="pb-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {!plan.isActive && (
                        <Badge variant="secondary" className="ml-2 rounded-xl">
                          Oculto
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEditPlan(plan)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background text-zinc-900 hover:bg-zinc-100 h-10 w-10 rounded-xl"
                      >
                        <Edit />
                      </Button>
                      <Button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 w-10 rounded-xl"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-start gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />

                      <p className="text-sm text-muted-foreground">
                        {plan.durationInMonths === 1
                          ? "1 mes | "
                          : `${plan.durationInMonths} meses`}
                      </p>
                       <p className="text-sm text-muted-foreground">
                        {plan.classLimit === 0
                          ? "Ilimitadas"
                          : `${calcularClasesSegunDuracion(
                              plan.classLimit,
                              plan.durationInMonths
                            )} clases`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Receipt className="w-4 h-4 text-muted-foreground" />

                      <p className="text-sm text-muted-foreground">
                        ${plan.price.toLocaleString("es-CL")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t">
                    <div className="space-y-2 flex flex-row justify-between items-center">
                      <div className="">
                        <span className="text-xs rounded-xl">
                          {plan.disciplineAccess === "all"
                            ? "Todas las disciplinas"
                            : "Disciplinas limitadas"}
                        </span>
                      </div>

                      {plan.disciplineAccess === "limited" &&
                        plan.allowedDisciplines &&
                        plan.allowedDisciplines.length > 0 && (         
                            <div className="flex flex-wrap gap-1">
                              {plan.allowedDisciplines.map((disciplineId) => {
                                const discipline = disciplines?.find(
                                  (d) => d.id === disciplineId
                                );
                                if (!discipline) return null;

                                return (
                                  <div
                                    key={disciplineId}
                                    className="text-xs rounded-xl flex gap-1 items-center"
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        background: discipline.color || "#ccc",
                                      }}
                                    />
                                    <span>
                                       {discipline.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                        
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Modal para crear/editar plan */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Editar Plan" : "Nuevo Plan"}
            </DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="rounded-xl py-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Información básica - 3 campos en una columna */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Nombre del Plan</Label>
                <Input
                  name="name"
                  value={planForm.name}
                  onChange={handlePlanChange}
                  placeholder="Ej: Básico, Premium, VIP"
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input
                  name="description"
                  value={planForm.description}
                  onChange={handlePlanChange}
                  placeholder="Descripción del plan"
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label>Precio</Label>
                <Input
                  name="price"
                  type="number"
                  value={planForm.price}
                  onChange={handlePlanChange}
                  placeholder="Ingresa el precio"
                  min="0"
                  step="1"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Reglas - 2 columnas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Reglas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Duración</Label>
                  <Select
                    value={planForm.durationInMonths.toString()}
                    onValueChange={(value) => {
                      setPlanForm((prev) => ({
                        ...prev,
                        durationInMonths: Number(value),
                      }));
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona la duración" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {durationOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Límite de Clases por Mes</Label>
                  <Input
                    name="classLimit"
                    type="number"
                    value={planForm.classLimit}
                    onChange={handlePlanChange}
                    placeholder="0 = ilimitado"
                    min="0"
                    className="rounded-xl"
                  />
                  {planForm.classLimit > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Total para{" "}
                      {`${planForm.durationInMonths} mes${
                            planForm.durationInMonths !== 1 ? "es" : ""
                          }`}: {clasesTotales} clases
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Acceso a disciplinas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Acceso a todas las disciplinas
                </Label>
                <Switch
                  checked={planForm.disciplineAccess === "all"}
                  onCheckedChange={(checked) => {
                    setPlanForm((prev) => ({
                      ...prev,
                      disciplineAccess: checked ? "all" : "limited",
                      allowedDisciplines: checked
                        ? []
                        : prev.allowedDisciplines,
                    }));
                  }}
                />
              </div>

              {planForm.disciplineAccess === "limited" && (
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">
                    Selecciona las disciplinas incluidas en este plan:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {!disciplines || disciplines.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Cargando disciplinas...
                      </p>
                    ) : (
                      disciplines
                        .filter((d) => d.isActive)
                        .map((discipline) => (
                          <Badge
                            key={discipline.id}
                            variant={
                              planForm.allowedDisciplines.includes(
                                discipline.id
                              )
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer transition-colors rounded-xl ${
                              planForm.allowedDisciplines.includes(
                                discipline.id
                              )
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "hover:bg-blue-50 hover:border-blue-300"
                            }`}
                            onClick={() => toggleDiscipline(discipline.id)}
                          >
                            <span
                              className="w-2 h-2 rounded-full mr-2"
                              style={{
                                background: discipline.color || "#ccc",
                              }}
                            />
                            {discipline.name}
                          </Badge>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Configuraciones adicionales */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Visible para usuarios
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Los usuarios pueden ver y seleccionar este plan al renovar.
                    Si está desactivado, solo el admin puede asignarlo.
                  </p>
                </div>
                <Switch
                  checked={planForm.isActive}
                  onCheckedChange={(checked) => {
                    setPlanForm((prev) => ({
                      ...prev,
                      isActive: checked,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSavePlan}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 rounded-xl min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Plan
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPlanModal(false)} 
                className="rounded-xl"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Confirmar eliminación
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              ¿Estás seguro de que quieres eliminar este plan? Esta acción no se
              puede deshacer.
            </p>
            <p className="text-sm text-red-600 font-medium">
              Los usuarios con este plan activo no se verán afectados
              inmediatamente.
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={confirmDeletePlan}
              className="flex-1 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setPlanToDelete(null);
              }}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
