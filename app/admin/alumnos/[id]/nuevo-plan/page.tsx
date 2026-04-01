"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import type { FitCenterUserProfile } from "@/lib/types";
import { calcularFechaTerminoMembresia, calcularClasesSegunDuracion } from "@/lib/utils";

export default function NuevoPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { users, fetchUserById, updateUserById, plans, fetchPlans, classSessions } = useBlackSheepStore();

  const [student, setStudent] = useState<FitCenterUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    planId: "",
    formaDePago: "contado",
    startDate: "",
    endDate: "",
    clasesTotales: "",
    precioTotal: "",
  });

  useEffect(() => {
    const loadData = async () => {
      let found = users.find((u) => u.id === resolvedParams.id);
      
      if (!found) {
        const user = await fetchUserById(resolvedParams.id);
        if (user) found = user;
      }
      
      if (!useBlackSheepStore.getState().plans?.length) {
        await fetchPlans(1, 100);
      }

      useBlackSheepStore.getState().fetchClassSessions(undefined, undefined, 1, 300);
      
      const activePlans = useBlackSheepStore.getState().plans || [];
      
      if (found) {
        setStudent(found);
        
        // Calcular fecha sugerida
        let suggestedStartDate = new Date();
        if (found.membership?.currentPeriodEnd && found.membership.status === 'active') {
          // Si tiene plan activo, sugerir el día después del término
          const end = new Date(found.membership.currentPeriodEnd);
          if (end >= suggestedStartDate) { // If it's today or in the future
            suggestedStartDate = new Date(end);
            suggestedStartDate.setDate(suggestedStartDate.getDate() + 1);
          }
        }
        
        const dateStr = suggestedStartDate.toISOString().split("T")[0];
        
        // Pre-seleccionar el mismo plan si existe, o el primero
        const currentPlanId = found.membership?.planId || activePlans[0]?.id || "";
        const initPlan = activePlans.find(p => p.id === currentPlanId);
        
        setFormData(prev => ({
          ...prev,
          planId: currentPlanId,
          startDate: dateStr,
          formaDePago: found.formaDePago || "contado",
          clasesTotales: initPlan ? String(initPlan.classLimit) : "",
          precioTotal: initPlan ? String(initPlan.price) : "",
        }));
      }
      setIsLoading(false);
    };
    loadData();
  }, [resolvedParams.id, fetchUserById, fetchPlans, users]);

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

    const newStartStr = formData.startDate; // "2026-03-01"
    const newEndStr = formData.endDate;     // "2026-03-31"
    const newStart = new Date(newStartStr + "T00:00:00");
    const newEnd = new Date(newEndStr + "T23:59:59");

    const newEnrolledClasses = (classSessions || []).filter(s => {
      const sessionDate = new Date(s.dateTime);
      return (
        s.registeredParticipantsIds.includes(student.id) &&
        s.status !== "cancelled" &&
        sessionDate >= newStart &&
        sessionDate <= newEnd
      );
    });
    
    const classesAttendedCount = newEnrolledClasses.length;
    const classesContractedCount = formData.clasesTotales ? Number(formData.clasesTotales) : calcularClasesSegunDuracion(selectedPlan.classLimit, selectedPlan.durationInMonths);
    const initialRemaining = Math.max(0, classesContractedCount - classesAttendedCount);

    const newMembership = {
      ...student.membership,
      id: `mem_${Date.now()}`,
      status: "active" as any,
      planId: selectedPlan.id,
      membershipType: selectedPlan.name,
      monthlyPrice: formData.precioTotal ? Number(formData.precioTotal) : selectedPlan.price,
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
        }
      }
    };

    const history = student.membership?.history ? [...student.membership.history] : [];
    if (student.membership) {
        // Marcamos la antigua como inactiva si está activa
        const pastMembership = { ...student.membership };
        if (pastMembership.status === 'active') {
            pastMembership.status = 'inactive';
        }
        delete pastMembership.history;
        history.unshift(pastMembership);
    }
    
    newMembership.history = history;

    const updateData: Partial<FitCenterUserProfile> = {
      formaDePago: formData.formaDePago as FitCenterUserProfile["formaDePago"],
      membership: newMembership as any
    };

    const result = await updateUserById(student.id, updateData);

    if (result) {
      toast({ title: "Plan Asignado", description: "El nuevo plan fue asignado correctamente." });
      router.push(`/admin/alumnos/${student.id}`);
    } else {
      toast({ title: "Error", description: "Hubo un problema al asignar el plan.", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8">Cargando...</div>;
  if (!student) return <div className="p-8">Alumno no encontrado.</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto flex flex-col min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/alumnos/${student.id}`)} className="shrink-0 hidden sm:flex rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/alumnos/${student.id}`)} className="shrink-0 sm:hidden rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
             <h1 className="text-2xl font-bold truncate">Asignar Nuevo Plan</h1>
             <p className="text-muted-foreground text-sm truncate">Renovación para {student.firstName} {student.lastName}</p>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-zinc-100 rounded-xl">
        <CardHeader className="border-b border-zinc-100 pb-5">
          <CardTitle>Configuración de Membresía</CardTitle>
          <CardDescription className="pt-2">
            {student.membership?.status === 'active' && student.membership?.currentPeriodEnd 
              ? `El plan actual de ${student.firstName} vence el ${new Date(student.membership.currentPeriodEnd).toLocaleDateString()}. La sugerencia automática de inicio a continuación es continua para evitar solapamientos.`
              : 'Selecciona el plan, la forma de pago y confirma las fechas de vigencia para activar una nueva membresía.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {student.membership && (
             <div className="mb-6 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
               <h3 className="text-sm font-semibold text-zinc-900 mb-2">Información del Plan Actual</h3>
               <div className="space-y-1 text-sm">
                 <p><span className="text-muted-foreground mr-1">Último plan:</span> <span className="font-medium">{student.membership.membershipType} ({student.membership.status === 'active' ? 'activo' : student.membership.status})</span></p>
                 <p><span className="text-muted-foreground mr-1">Fecha de término del plan:</span> <span className="font-medium">{student.membership.currentPeriodEnd ? new Date(student.membership.currentPeriodEnd).toLocaleString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</span></p>
               </div>
             </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
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
                      className="h-11 rounded-xl"
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
        </CardContent>
      </Card>
    </div>
  );
}
