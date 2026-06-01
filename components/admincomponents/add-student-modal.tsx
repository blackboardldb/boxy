"use client";

import type React from "react";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FitCenterUserProfile, MembershipPlan, MembershipStatus } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  calcularFechaTerminoMembresia,
  calcularClasesSegunDuracion,
} from "@/lib/utils";
import { MembershipDatePicker } from "./membership-date-picker";
import { format } from "date-fns";

interface AddStudentModalProps {
  onAddStudent: (student: Omit<FitCenterUserProfile, "id">) => Promise<FitCenterUserProfile | null>;
  onEditStudent?: (
    id: string,
    updates: Omit<FitCenterUserProfile, "id">
  ) => Promise<boolean>;
  plans: MembershipPlan[];
  onClose?: () => void;
  initialStudent?: FitCenterUserProfile;
  onSuccess?: () => void; // Callback para refrescar la lista después de agregar/editar
}

// Función helper para crear el objeto studentData
const createStudentData = (
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    formaDePago?: "contado" | "transferencia" | "debito" | "credito";
    joinDate: string;
    nextPayment: string;
  },
  selectedPlan: MembershipPlan,
  initialStudent?: FitCenterUserProfile
): Omit<FitCenterUserProfile, "id"> => {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    organizationId: initialStudent?.organizationId ?? "org_blacksheep_001",
    // Remover campos undefined para evitar problemas de validación
    ...(formData.formaDePago && { formaDePago: formData.formaDePago }),
    avatarId: "avatar_default",
    role: "user",
    membership: {
      id: initialStudent?.membership?.id || `mem_${Date.now()}`,
      organizationId: "org_blacksheep_001",
      organizationName: "BlackSheep CrossFit",
      status: formData.status as MembershipStatus,
      membershipType: selectedPlan.name,
      monthlyPrice: selectedPlan.price,
      startDate: formData.joinDate,
      currentPeriodStart: formData.joinDate,
      currentPeriodEnd: formData.nextPayment,
      planConfig: {
        classLimit: calcularClasesSegunDuracion(selectedPlan.classLimit, selectedPlan.durationInMonths),
        disciplineAccess: selectedPlan.disciplineAccess,
        allowedDisciplines: selectedPlan.allowedDisciplines,
        canFreeze: selectedPlan.canFreeze,
        freezeDurationDays: selectedPlan.freezeDurationDays,
        autoRenews: selectedPlan.autoRenews,
      },
      centerConfig: {
        allowCancellation: true,
        cancellationHours: 2,
        maxBookingsPerDay: 2,
        autoWaitlist: false,
      },
      centerStats: {
        currentMonth: {
          classesAttended: 0,
          classesContracted: calcularClasesSegunDuracion(
            selectedPlan.classLimit,
            selectedPlan.durationInMonths
          ),
          remainingClasses: calcularClasesSegunDuracion(
            selectedPlan.classLimit,
            selectedPlan.durationInMonths
          ),
          noShows: 0,
          lastMinuteCancellations: 0,
        },
        totalMonthsActive: 0,
        memberSince: formData.joinDate,
        lifetimeStats: {
          totalClasses: 0,
          totalNoShows: 0,
          averageMonthlyAttendance: 0,
          bestMonth: { month: "N/A", year: 0, count: 0 },
        },
      },
    },
    globalPreferences: {},
    globalStats: {},
  };
};

export function AddStudentModal({
  onAddStudent,
  onEditStudent,
  plans = [],
  onClose,
  initialStudent,
  onSuccess,
}: AddStudentModalProps) {
  // El modal se abre cuando el usuario hace clic en el trigger o cuando se pasa initialStudent
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrarIngreso, setRegistrarIngreso] = useState(true);

  const createInitialFormData = (student?: FitCenterUserProfile) => ({
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    email: student?.email || "",
    phone: student?.phone || "",
    status: student?.membership?.status || "active",
    joinDate:
      student?.membership?.currentPeriodStart ||
      format(new Date(), "yyyy-MM-dd"),
    lastPayment:
      student?.membership?.currentPeriodStart ||
      format(new Date(), "yyyy-MM-dd"),
    nextPayment: student?.membership?.currentPeriodEnd || "",
    planId: student?.membership?.planId || "",
    formaDePago: student?.formaDePago || "contado",
    role: student?.role || "user",
  });

  const [formData, setFormData] = useState(
    createInitialFormData(initialStudent)
  );

  // Flag para saber si el usuario editó manualmente el campo de último pago
  const [lastPaymentTouched, setLastPaymentTouched] = useState(false);

  // Ref para guardar el valor anterior de joinDate
  const prevJoinDateRef = useRef(formData.joinDate);

  // Buscar el objeto plan real (MembershipPlan)
  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === formData.planId),
    [plans, formData.planId]
  );

  // Recalcular nextPayment cuando cambia el plan seleccionado
  useEffect(() => {
    if (!selectedPlan) return;

    setFormData((prev) => ({
      ...prev,
      nextPayment: calcularFechaTerminoMembresia(
        prev.joinDate, // ✅ lee joinDate del estado actual, evita closure stale
        selectedPlan.durationInMonths
      ),
    }));
  }, [selectedPlan]); // se ejecuta cada vez que cambia el plan seleccionado

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData(createInitialFormData(initialStudent));
      setLastPaymentTouched(false);
      setError(null);
      setIsSubmitting(false);
      setRegistrarIngreso(true);
    }
  }, [open, initialStudent]);

  // Open modal when initialStudent is provided (for editing)
  useEffect(() => {
    if (initialStudent) {
      setOpen(true);
    }
  }, [initialStudent]);

  // Función explícita para manejar cambios de fecha de inicio
  const handleJoinDateChange = useCallback(
    (newDate: string) => {
      if (!selectedPlan) return;

      // const newEndDate = calcularFechaTerminoMembresia(
      const newEndDate = calcularFechaTerminoMembresia(
        newDate,
        selectedPlan.durationInMonths
      );

      setFormData((prev) => {
        const updatedData = {
          ...prev,
          joinDate: newDate,
          nextPayment: newEndDate,
        };

        // Si el último pago no ha sido tocado manualmente, se sincroniza con la fecha de inicio
        if (!lastPaymentTouched) {
          updatedData.lastPayment = newDate;
        }

        return updatedData;
      });

      // Actualizar la ref del joinDate anterior
      prevJoinDateRef.current = newDate;
    },
    [selectedPlan, lastPaymentTouched]
  );

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Si estamos en modo edición, llamar a onClose
      if (initialStudent) {
        onClose?.();
      }
      // Resetear el formulario si no hay initialStudent
      if (!initialStudent) {
        setFormData(createInitialFormData());
        setLastPaymentTouched(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !selectedPlan
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const studentData = createStudentData(
      formData,
      selectedPlan,
      initialStudent
    );

    try {
      if (initialStudent && onEditStudent) {
        const success = await onEditStudent(initialStudent.id, studentData);
        if (success) {
          onSuccess?.();
          setOpen(false);
        } else {
          setError("No se pudo guardar la información del alumno. Por favor revisa los datos e intenta nuevamente.");
        }
      } else {
        const createdUser = await onAddStudent(studentData);
        if (createdUser) {
          // Registrar ingreso en finanzas si el checkbox está marcado y hay precio
          if (registrarIngreso && selectedPlan.price > 0) {
            try {
              await fetch(`/api/users/${createdUser.id}/renewal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  planId: selectedPlan.id,
                  paymentMethod: formData.formaDePago || "contado",
                  autoApprove: true,
                  planName: selectedPlan.name,
                  planPrice: selectedPlan.price,
                  planClassLimit: calcularClasesSegunDuracion(selectedPlan.classLimit, selectedPlan.durationInMonths),
                  planDuration: selectedPlan.durationInMonths,
                  startDate: formData.joinDate,
                  paymentDate: formData.joinDate,
                }),
              });
            } catch (renewalErr) {
              // El alumno fue creado; el ingreso falló silenciosamente (no bloquear UX)
              console.error("[AddStudentModal] Error registrando ingreso:", renewalErr);
            }
          }
          onSuccess?.();
          setOpen(false);
        } else {
          setError("No se pudo guardar la información del alumno. Por favor revisa los datos e intenta nuevamente.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!initialStudent && (
        <DialogTrigger asChild>
          <Button variant="default" className="flex items-center gap-2 rounded-xl">
            <Plus className="w-4 h-4" />
            Agregar Alumno
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col rounded-xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {initialStudent ? "Editar Alumno" : "Agregar Alumno"}
          </DialogTitle>
          <DialogDescription>
            {initialStudent
              ? "Edita la información del alumno."
              : "Completa la información para agregar un nuevo alumno."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4 py-2 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Divider entre información personal y membresía */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Información de Membresía
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {plans.length > 0 && (
                <div>
                  <Label htmlFor="plan">Plan *</Label>
                  <Select
                    value={formData.planId}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, planId: value }));
                    }}
                    required
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona un plan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price} {" "}
                          {plan.durationInMonths === 0.5
                            ? "quincena"
                            : plan.durationInMonths === 1
                            ? "mes"
                            : plan.durationInMonths + " meses"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Checkbox de ingreso — solo al crear un alumno nuevo */}
                  {!initialStudent && selectedPlan && selectedPlan.price > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox
                        id="registrar-ingreso-add"
                        checked={registrarIngreso}
                        onCheckedChange={(v) => setRegistrarIngreso(!!v)}
                      />
                      <label
                        htmlFor="registrar-ingreso-add"
                        className="text-xs text-muted-foreground cursor-pointer select-none"
                      >
                        Registrar como ingreso (${selectedPlan.price.toLocaleString("es-CL")})
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="formaDePago">Forma de Pago</Label>
                <Select
                  value={formData.formaDePago}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      formaDePago: value as
                        | "contado"
                        | "transferencia"
                        | "debito"
                        | "credito",
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Componente de fechas de membresía */}
            <MembershipDatePicker
              selectedPlan={selectedPlan}
              value={formData.joinDate}
              onValueChange={handleJoinDateChange}
            />

            <div>
              <Label htmlFor="lastPayment">Último Pago</Label>
              <Input
                id="lastPayment"
                type="date"
                value={formData.lastPayment}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    lastPayment: e.target.value,
                  }));
                  setLastPaymentTouched(true);
                }}
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 Se actualiza automáticamente con la fecha de inicio, pero
                puedes editarlo manualmente
              </p>
            </div>

            <div>
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value as "admin" | "coach" | "user",
                  }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="user">Alumno</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="membershipStatus">
                Estado Manual (Control de Acceso)
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as MembershipStatus,
                  }))
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="active">
                    Normal (Seguir fechas del plan)
                  </SelectItem>
                  <SelectItem value="inactive">
                    Suspendido / Bloqueado manualmente
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                💡 El sistema calcula automáticamente si el alumno está Activo,
                Programado o Inactivo según sus fechas. Usa "Suspendido" solo
                para bloquear el acceso manualmente (ej: deuda).
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="rounded-xl min-w-[140px]" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                initialStudent ? "Guardar Cambios" : "Agregar Alumno"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
