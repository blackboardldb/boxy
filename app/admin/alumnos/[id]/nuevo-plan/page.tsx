"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import type { FitCenterUserProfile } from "@/lib/types";
import { calcularFechaTerminoMembresia, calcularClasesSegunDuracion } from "@/lib/utils";
import { parseISO } from "date-fns";
import { useUser, useUpdateUser } from "@/lib/react-query/hooks/useUsers";
import { usePlans } from "@/lib/react-query/hooks/usePlans";
import { useUserClasses } from "@/lib/react-query/hooks/useClasses";

export default function NuevoPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();

  // React Query
  const { data: fetchedUser, isLoading } = useUser(resolvedParams.id);
  const { data: plans = [] } = usePlans({ limit: 100 });
  const { data: userClasses = [] } = useUserClasses(resolvedParams.id);
  const updateUserMutation = useUpdateUser();

  const [student, setStudent] = useState<FitCenterUserProfile | null>(null);
  const [registrarIngreso, setRegistrarIngreso] = useState(true); // Marcado por defecto

  const [formData, setFormData] = useState({
    planId: "",
    formaDePago: "contado",
    startDate: "",
    endDate: "",
    clasesTotales: "",
    precioTotal: "",
  });

  // Sincronizar student local y pre-rellenar formulario cuando llegan los datos
  useEffect(() => {
    if (!fetchedUser || !plans.length) return;
    setStudent(fetchedUser);

    let suggestedStartDate = new Date();
    if (fetchedUser.membership?.currentPeriodEnd && fetchedUser.membership.status === 'active') {
      const end = parseISO(fetchedUser.membership.currentPeriodEnd.substring(0, 10));
      if (end >= suggestedStartDate) {
        suggestedStartDate = new Date(end);
        suggestedStartDate.setDate(suggestedStartDate.getDate() + 1);
      }
    }
    const dateStr = suggestedStartDate.toISOString().split("T")[0];
    const currentPlanId = fetchedUser.membership?.planId || plans[0]?.id || "";
    const initPlan = plans.find(p => p.id === currentPlanId);

    setFormData(prev => ({
      ...prev,
      planId: currentPlanId,
      startDate: dateStr,
      formaDePago: fetchedUser.formaDePago || "contado",
      clasesTotales: initPlan ? String(initPlan.classLimit) : "",
      precioTotal: initPlan ? String(initPlan.price) : "",
    }));
  }, [fetchedUser, plans]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === formData.planId),
    [plans, formData.planId]
  );
  
  // Update end date when start date or plan changes
  useEffect(() => {
    if (selectedPlan && formData.startDate) {
      const calculatedEndDate = calcularFechaTerminoMembresia(
        formData.startDate,
        selectedPlan.durationInMonths
      );
      setFormData(prev => ({ ...prev, endDate: calculatedEndDate }));
    }
  }, [selectedPlan, formData.startDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !selectedPlan) return;

    const newStartStr = formData.startDate;
    const newEndStr = formData.endDate;
    const newStart = new Date(newStartStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isScheduled = newStart > today;
    const newEnd = new Date(newEndStr + "T23:59:59");

    // Clases del alumno en el periodo usando datos de React Query
    const newEnrolledClasses = (userClasses || []).filter(s => {
      const sessionDate = new Date(s.dateTime);
      return (
        s.status !== "cancelled" &&
        sessionDate >= newStart &&
        sessionDate <= newEnd
      );
    });
    
    const classesAttendedCount = newEnrolledClasses.length;
    const classesContractedCount = formData.clasesTotales ? Number(formData.clasesTotales) : calcularClasesSegunDuracion(selectedPlan.classLimit, selectedPlan.durationInMonths);
    const initialRemaining = Math.max(0, classesContractedCount - classesAttendedCount);

    const updatedMembership = {
      ...student.membership, // Preserve existing fields like organizationId, centerConfig, etc.
      id: `mem_${Date.now()}`,
      status: (isScheduled ? "scheduled" : "active") as "scheduled" | "active",
      planId: selectedPlan.id,
      membershipType: selectedPlan.name,
      monthlyPrice: formData.precioTotal ? Number(formData.precioTotal) : selectedPlan.price,
      startDate: student.membership?.startDate || newStartStr, // Keep original join date if exists
      currentPeriodStart: newStartStr,
      currentPeriodEnd: newEndStr,
      planConfig: {
        classLimit: formData.clasesTotales ? Number(formData.clasesTotales) : selectedPlan.classLimit,
        disciplineAccess: selectedPlan.disciplineAccess,
        allowedDisciplines: selectedPlan.allowedDisciplines,
        canFreeze: selectedPlan.canFreeze,
        freezeDurationDays: selectedPlan.freezeDurationDays,
        autoRenews: selectedPlan.autoRenews,
      },
      centerStats: {
        ...student.membership?.centerStats,
        currentMonth: {
          classesAttended: classesAttendedCount,
          classesContracted: classesContractedCount,
          remainingClasses: initialRemaining,
          noShows: 0,
          lastMinuteCancellations: 0,
        },
        totalMonthsActive: student.membership?.centerStats?.totalMonthsActive ?? 0,
        memberSince: student.membership?.centerStats?.memberSince ?? newStartStr,
        lifetimeStats: student.membership?.centerStats?.lifetimeStats ?? {
          totalClasses: 0,
          totalNoShows: 0,
          averageMonthlyAttendance: 0,
          bestMonth: { month: "enero", year: 2024, count: 0 }
        }
      },
      // Ensure specific mandatory fields for schema validation
      organizationId: student.membership?.organizationId || "org_default",
      organizationName: student.membership?.organizationName || "Blacksheep",
      centerConfig: student.membership?.centerConfig || {
        allowCancellation: true,
        cancellationHours: 2,
        maxBookingsPerDay: 1,
        autoWaitlist: true,
      }
    };

    const updateData: Partial<FitCenterUserProfile> = {
      formaDePago: formData.formaDePago as FitCenterUserProfile["formaDePago"],
      membership: updatedMembership
    };

    const result = await updateUserMutation.mutateAsync({
      id: student.id,
      data: updateData,
    });

    if (result) {
      // Si el admin marcó "Registrar como ingreso" y el precio es > 0, crear registro financiero
      if (registrarIngreso && Number(formData.precioTotal) > 0) {
        await fetch(`/api/users/${student.id}/renewal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: selectedPlan.id,
            paymentMethod: formData.formaDePago,
            autoApprove: true,
            planName: selectedPlan.name,
            planPrice: Number(formData.precioTotal),
            planClassLimit: Number(formData.clasesTotales) || selectedPlan.classLimit,
            planDuration: selectedPlan.durationInMonths,
            startDate: newStartStr,
          }),
        });
      }
      toast({ title: "Plan Asignado", description: "El nuevo plan fue asignado correctamente." });
      router.push(`/admin/alumnos/${student.id}`);
    } else {
      toast({ title: "Error", description: "Hubo un problema al asignar el plan.", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8">Cargando...</div>;
  if (!student) return <div className="p-8">Alumno no encontrado.</div>;

  return (
    <div className="p-4 md:p-8 space-y-4 max-w-4xl mx-auto flex flex-col min-h-screen">
      <div className=" space-y-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/alumnos/${student.id}`)} className="shrink-0 bg-zinc-100 rounded-full">
          <ArrowLeft className="h-7 w-7" />
        </Button>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className=" space-y-4">
             <h1 className="text-3xl font-bold">Asignar Nuevo Plan</h1>
              <p className="pb-2 text-base text-zinc-500">
            {student.membership?.status === 'active' && student.membership?.currentPeriodEnd 
              ? `El plan actual de ${student.firstName} ${student.lastName} vence el ${parseISO(student.membership.currentPeriodEnd.substring(0, 10)).toLocaleDateString()}. La sugerencia automática de inicio a continuación es continua para evitar solapamientos.`
              : 'Selecciona el plan, la forma de pago y confirma las fechas de vigencia para activar una nueva membresía.'}
          </p>
          </div>
        </div>
      </div>

        <div>        
          {student.membership && (
             <div className="mb-6 bg-zinc-100/70 rounded-xl p-4 border border-zinc-100">
               <h3 className="text-md font-semibold text-zinc-900 mb-2">Información del Plan Actual</h3>
               <div className="space-y-1 text-sm">
                 <p><span className="text-muted-foreground mr-1">Último plan:</span> <span className="font-medium">{student.membership.membershipType} ({student.membership.status === 'active' ? 'activo' : student.membership.status})</span></p>
                 <p><span className="text-muted-foreground mr-1">Fecha de término del plan:</span> <span className="font-medium">{student.membership.currentPeriodEnd ? parseISO(student.membership.currentPeriodEnd.substring(0, 10)).toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}</span></p>
               </div>
             </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-zinc-800">Plan a Contratar <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.planId}
                  onValueChange={(value) => {
                    const planSeleccionado = plans.find(p => p.id === value);
                    setFormData({ 
                      ...formData, 
                      planId: value,
                      clasesTotales: planSeleccionado ? String(planSeleccionado.classLimit) : "",
                      precioTotal: planSeleccionado ? String(planSeleccionado.price) : ""
                    });
                  }}
                  required
                >
                  <SelectTrigger className="h-11 bg-zinc-50 border-zinc-300 focus:ring-emerald-500 rounded-xl"><SelectValue placeholder="Selecciona un plan" /></SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price.toLocaleString('es-CL')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlan && (
                   <div className="bg-emerald-50 rounded-xl p-3 mt-2 border border-emerald-100 flex items-center gap-2 text-emerald-800">
                      <div className="bg-emerald-200 p-1 rounded-md shrink-0"><span className="text-xs font-bold leading-none block">{selectedPlan.classLimit}</span></div>
                      <p className="text-xs font-medium">Clases mensuales incluidas en el {selectedPlan.name}.</p>
                   </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-zinc-800">Clases totales</Label>
                <Input
                  type="number"
                  value={formData.clasesTotales}
                  onChange={(e) => setFormData({ ...formData, clasesTotales: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-zinc-800">Total ($)</Label>
                <Input
                  type="number"
                  value={formData.precioTotal}
                  onChange={(e) => setFormData({ ...formData, precioTotal: e.target.value })}
                  className="h-11 rounded-xl"
                />
                {/* Checkbox de registro financiero */}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="registrar-ingreso-nuevo"
                    checked={registrarIngreso}
                    onCheckedChange={(v) => setRegistrarIngreso(!!v)}
                  />
                  <label
                    htmlFor="registrar-ingreso-nuevo"
                    className="text-sm text-zinc-500 cursor-pointer select-none"
                  >
                    Registrar como ingreso
                    {formData.precioTotal && Number(formData.precioTotal) > 0
                      ? ` ($${Number(formData.precioTotal).toLocaleString()})`
                      : ""}
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-zinc-800">Forma de Pago <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.formaDePago}
                  onValueChange={(value) => setFormData({ ...formData, formaDePago: value })}
                  required
                >
                  <SelectTrigger className="h-11 bg-zinc-50 border-zinc-300 focus:ring-emerald-500 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Efectivo / Contado</SelectItem>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="debito">Tarjeta de Débito</SelectItem>
                    <SelectItem value="credito">Tarjeta de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border border-zinc-100 rounded-xl overflow-hidden p-0">
               <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-100">
                 <h3 className="text-sm font-semibold text-zinc-800">Vigencia del Nuevo Plan</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6 bg-white">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-zinc-800">Fecha de Inicio <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="h-11 rounded-xl max-w-full"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <Label className="text-sm font-semibold text-zinc-800">Fecha de Término <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      className="h-11 bg-zinc-50 cursor-pointer rounded-xl"
                    />
                    <p className="text-[11px] font-medium text-muted-foreground mt-1.5 flex items-center justify-between">
                       <span>Calculada automáticamente</span>
                       <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">{selectedPlan?.durationInMonths || 1} {selectedPlan?.durationInMonths === 1 ? 'Mes' : 'Meses'}</span>
                    </p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end pt-2 gap-3">
              <Button type="button" variant="outline" className="w-full sm:w-auto h-11 rounded-xl" onClick={() => router.push(`/admin/alumnos/${student.id}`)}>
                Cancelar Operación
              </Button>
              <Button type="submit" className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 group rounded-xl">
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" /> Confirmar y Guardar
              </Button>
            </div>
          </form>
        </div>
  
    </div>
  );
}
