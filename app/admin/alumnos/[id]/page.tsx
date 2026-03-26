"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Edit, Clock3, Users, Calendar, Ticket, CheckCircle2, Bell } from "lucide-react";
import type { FitCenterUserProfile } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getPlanStatus } from "@/lib/utils";

export default function StudentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { users, fetchUserById, classSessions, disciplines, fetchClassSessions, fetchDisciplines, plans, fetchPlans, updateUser } = useBlackSheepStore();

  const [student, setStudent] = useState<FitCenterUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // States for Datos Personales
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState("");

  // States for Membresía
  const [editPlanId, setEditPlanId] = useState("");
  const [editClassLimit, setEditClassLimit] = useState<number | string>(0);
  const [editPrice, setEditPrice] = useState<number | string>(0);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("");

  useEffect(() => {
    const loadData = async () => {
      let found = users.find((u) => u.id === resolvedParams.id);
      
      if (!found) {
        const user = await fetchUserById(resolvedParams.id);
        if (user) found = user;
      }
      
      if (found) {
        setStudent(found);
      }
      
      if (!useBlackSheepStore.getState().plans?.length) {
        await fetchPlans(1, 100);
      }
      // Siempre forzar la carga de un volumen grande de clases (ej. 300) 
      // para asegurar que las clases de este alumno se encuentren en memoria del store
      // ya que sin parámetros solo carga las primeras 10 globales.
      fetchClassSessions(undefined, undefined, 1, 300);
      if (!useBlackSheepStore.getState().disciplines?.length) {
        fetchDisciplines();
      }
      setIsLoading(false);
    };
    loadData();
  }, [resolvedParams.id, fetchUserById, fetchPlans, fetchClassSessions, fetchDisciplines, users]);

  // Populate data when starting to edit
  useEffect(() => {
    if (student && editingSection) {
      setEditFirstName(student.firstName || "");
      setEditLastName(student.lastName || "");
      setEditEmail(student.email || "");
      setEditPhone(student.phone || "");
      setEditGender(student.gender || "");

      const m = student.membership;
      if (m) {
        setEditPlanId(m.planId || "");
        setEditClassLimit(m.planConfig?.classLimit ?? 0);
        setEditPrice(m.monthlyPrice ?? 0);
        setEditStartDate(m.currentPeriodStart ? format(new Date(m.currentPeriodStart), 'yyyy-MM-dd') : "");
        setEditEndDate(m.currentPeriodEnd ? format(new Date(m.currentPeriodEnd), 'yyyy-MM-dd') : "");
        setEditPaymentMethod(student.formaDePago || "transferencia");
        setEditPaymentMethod(student.formaDePago || "transferencia");
      }
    }
  }, [editingSection, student]);

  const handlePlanChange = (planId: string) => {
    setEditPlanId(planId);
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      setEditClassLimit(selectedPlan.classLimit);
      setEditPrice(selectedPlan.price);
      
      if (editStartDate) {
        const d = new Date(editStartDate);
        if (!isNaN(d.getTime())) {
          d.setMonth(d.getMonth() + selectedPlan.durationInMonths);
          setEditEndDate(d.toISOString().substring(0, 10));
        }
      }
    }
  };

  const handleStartDateChange = (newDate: string) => {
    setEditStartDate(newDate);
    const selectedPlan = plans.find(p => p.id === editPlanId);
    if (selectedPlan && newDate) {
      const d = new Date(newDate);
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + selectedPlan.durationInMonths);
        setEditEndDate(d.toISOString().substring(0, 10));
      }
    }
  };

  const savePersonalInfo = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
      const changes = {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        gender: editGender,
      };
      
      await fetch(`/api/users/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      const updated = { ...student, ...changes } as FitCenterUserProfile;
      setStudent(updated);
      updateUser(updated);
      toast({ title: "Guardado", description: "Datos personales actualizados correctamente" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Hubo un problema al guardar los datos", variant: "destructive" });
    } finally {
      setIsSaving(false);
      setEditingSection(null);
    }
  };

  const saveMembershipInfo = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
      const selectedPlan = plans.find(p => p.id === editPlanId);
      
      const newStartStr = new Date(editStartDate + "T00:00:00").toISOString();
      const newEndStr = new Date(editEndDate + "T23:59:59").toISOString();
      const newStart = new Date(newStartStr);
      const newEnd = new Date(newEndStr);
      
      const newEnrolledClasses = (classSessions || []).filter(s => {
        const sessionDate = new Date(s.dateTime);
        return (
          s.registeredParticipantsIds.includes(student.id) &&
          s.status !== "cancelled" &&
          sessionDate >= newStart &&
          sessionDate <= newEnd
        );
      });
      const newClassesConsumed = newEnrolledClasses.length;
      const newClassLimit = Number(editClassLimit);
      const newRemainingClasses = Math.max(0, newClassLimit > 0 ? newClassLimit - newClassesConsumed : 0);

      const updatedMembership = {
        ...student.membership,
        planId: editPlanId,
        membershipType: selectedPlan ? selectedPlan.name : student.membership?.membershipType,
        monthlyPrice: Number(editPrice),
        currentPeriodStart: newStartStr,
        currentPeriodEnd: newEndStr,
        planConfig: {
          ...(student.membership?.planConfig || {}),
          classLimit: newClassLimit,
        },
        centerStats: {
          ...(student.membership?.centerStats || {}),
          currentMonth: {
            ...(student.membership?.centerStats?.currentMonth || {}),
            classesAttended: newClassesConsumed,
            remainingClasses: newRemainingClasses,
            classesContracted: newClassLimit,
          }
        }
      } as any;

      const changes = {
        formaDePago: editPaymentMethod as any,
        membership: updatedMembership,
      };

      await fetch(`/api/users/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      const updated = { ...student, ...changes } as FitCenterUserProfile;
      setStudent(updated);
      updateUser(updated);
      toast({ title: "Guardado", description: "Membresía actualizada correctamente" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Hubo un problema al guardar la membresía", variant: "destructive" });
    } finally {
      setIsSaving(false);
      setEditingSection(null);
    }
  };

  const now = new Date();
  
  const studentAllEnrolledClasses = useMemo(() => {
    if (!student?.membership?.currentPeriodStart || !student?.membership?.currentPeriodEnd) return [];
    
    const start = new Date(student.membership.currentPeriodStart);
    
    // Obtenemos solo la fecha YYYY-MM-DD y forzamos su límite al final del día local
    const endDateStr = student.membership.currentPeriodEnd;
    const endDateOnly = typeof endDateStr === "string" ? endDateStr.substring(0, 10) : new Date(endDateStr).toISOString().substring(0, 10);
    const end = new Date(endDateOnly + "T23:59:59");

    return (classSessions || [])
      .filter(s => {
        const sessionDate = new Date(s.dateTime);
        return (
          s.registeredParticipantsIds.includes(resolvedParams.id) &&
          s.status !== "cancelled" &&
          sessionDate >= start &&
          sessionDate <= end
        );
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [classSessions, resolvedParams.id, student]);

  // Determine plan status
  const planStatus = student ? getPlanStatus(student) : "expired";
  const isPlanActive = planStatus === "active";
  const isPendingApproval = planStatus === "pending" || (student?.membership?.pendingRenewal?.status === "pending");
  const isPlanExpired = planStatus === "expired" || planStatus === "exhausted";
  
  // Data prep for Plan display
  const planClassLimit = student?.membership?.planConfig?.classLimit ?? 0;
  const isUnlimited = planClassLimit === 0;
  
  // Calculate consumed safely based on override or direct attendance
  const remainingClasses = student?.membership?.centerStats?.currentMonth?.remainingClasses ?? 0;
  const classesConsumed = !isUnlimited
    ? Math.max(0, planClassLimit - remainingClasses)
    : student?.membership?.centerStats?.currentMonth?.classesAttended ?? 0;

  if (isLoading) return <div className="p-8">Cargando perfil del alumno...</div>;
  if (!student) return <div className="p-8">Alumno no encontrado.</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto flex flex-col min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/alumnos")} className="shrink-0 hidden sm:flex">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/alumnos")} className="shrink-0 sm:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold truncate">
            Perfil de {student.firstName} {student.lastName}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 flex-1">
        {/* Lado Izquierdo: Información Personal y Membresía Actual */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-6">
          
          {/* Tarjeta de Datos Personales */}
          <Card className="shadow-sm border-zinc-200">
            {editingSection !== "personal" ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">Datos Personales</CardTitle>
                    <CardDescription>Información de contacto</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingSection("personal")}>
                    <Edit className="w-4 h-4 text-muted-foreground mr-1" /> Editar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nombre</p>
                    <p className="font-medium text-zinc-900">{student.firstName} {student.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                    <p className="font-medium text-zinc-900 break-all">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Teléfono</p>
                    <p className="font-medium text-zinc-900">{student.phone || "-"}</p>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="pb-4 border-b border-zinc-100">
                  <CardTitle className="text-lg">Editar Datos Personales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Apellido</Label>
                      <Input value={editLastName} onChange={e => setEditLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setEditingSection(null)}>Cancelar</Button>
                    <Button onClick={savePersonalInfo} disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>

          {/* Tarjeta de Membresía Actual */}
          <Card className="shadow-sm border-zinc-200">
            {editingSection !== "membership" ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <p className="text-lg">Membresía Actual</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingSection("membership")}>
                    <Edit className="w-4 h-4 text-muted-foreground mr-1" /> Editar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`uppercase font-bold tracking-wider text-sm ${isPlanActive ? 'text-lime-900' : isPendingApproval ? 'text-orange-500' : 'text-orange-400'}`}>
                          {isPlanActive ? 'Activo' : isPendingApproval ? 'Validar plan' : isPlanExpired ? 'Expirado' : 'Sin plan'}
                        </span>
                        <div className="inline-flex gap-1.5 text-xs text-zinc-400 bg-black/40 px-2 py-1 rounded-full items-center">
                          <Ticket size={14} className="text-zinc-500" />
                          <span>{student.membership?.currentPeriodStart ? format(new Date(student.membership?.currentPeriodStart), "dd MMM", { locale: es }) : "—"} - {student.membership?.currentPeriodEnd ? format(new Date(student.membership?.currentPeriodEnd), "dd MMM", { locale: es }) : "—"}</span>
                        </div>
                      </div>
                      <h2 className="  font-bold text-2xl">{student.membership?.membershipType || "Sin plan activo"}</h2>
                      <p className=" /70 font-medium mt-1">
                        {isUnlimited ? "Ilimitadas" : `${planClassLimit} clases`} • $
                        {student.membership?.monthlyPrice ? student.membership.monthlyPrice.toLocaleString("es-CL") : "N/A"}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium  ">Clases consumidas</span>
                         <p className="text-sm  ">
                           <span className="text-lime-500 font-bold text-base">{classesConsumed}</span>
                           {" "}
                           {isUnlimited ? "realizadas" : `/ ${planClassLimit}`}
                         </p>
                      </div>
                      
                      {!isUnlimited && (
                        <div className="w-full bg-zinc-700 rounded-full h-2 mt-3 overflow-hidden">
                          <div 
                            className="bg-lime-500 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(100, (classesConsumed / planClassLimit) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-sm px-2">
                    <div className="text-muted-foreground">Duración</div>
                    <div className="font-medium text-right text-zinc-900">
                       {student.membership?.planId && plans.find(p => p.id === student.membership?.planId)?.durationInMonths ? `${plans.find(p => p.id === student.membership?.planId)?.durationInMonths} mes(es)` : "-"}
                    </div>
                    
                    <div className="text-muted-foreground">Forma de pago</div>
                    <div className="font-medium text-right text-zinc-900 capitalize">{student.formaDePago || "-"}</div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col gap-3">
                    {isPendingApproval && (
                      <Button 
                        variant="default" 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => router.push('/admin/alertas')}
                      >
                         <Bell className="w-4 h-4 mr-2" /> Validar Solicitud de Plan
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                      onClick={() => router.push(`/admin/alumnos/${student.id}/nuevo-plan`)}
                    >
                      <Ticket className="w-4 h-4 mr-2" /> Activar Nuevo Plan
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                 <CardHeader className="pb-4 border-b border-zinc-100">
                  <CardTitle className="text-lg">Editar Membresía</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Plan</Label>
                      <Select value={editPlanId} onValueChange={handlePlanChange}>
                        <SelectTrigger>
                           <SelectValue placeholder="Seleccionar plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Clases totales</Label>
                        <Input type="number" value={editClassLimit} onChange={e => setEditClassLimit(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Total ($)</Label>
                        <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Fecha inicio</Label>
                        <Input type="date" value={editStartDate} onChange={e => handleStartDateChange(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha término</Label>
                        <Input type="date" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Forma de pago</Label>
                      <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod}>
                        <SelectTrigger><SelectValue placeholder="Forma" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="contado">Contado</SelectItem>
                          <SelectItem value="debito">Débito</SelectItem>
                          <SelectItem value="credito">Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setEditingSection(null)}>Cancelar</Button>
                    <Button onClick={saveMembershipInfo} disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Lado Derecho: Acordeones Separados */}
        <div className="lg:col-span-1 xl:col-span-2">
          
          <Accordion type="multiple" defaultValue={["asistencia", "planes"]} className="w-full space-y-4">
            
            {/* HISTORIAL DE ASISTENCIA */}
            <AccordionItem value="asistencia" className="border border-zinc-200 bg-white rounded-xl shadow-sm overflow-hidden px-1">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-zinc-50 font-semibold tracking-tight text-lg py-4">
                Historial de Asistencia y Reservas
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0 border-t border-zinc-100">
                <div className="space-y-4 pt-4 max-h-[500px] overflow-y-auto">
                  {studentAllEnrolledClasses.length > 0 ? (
                    <div className="space-y-3">
                       {studentAllEnrolledClasses.map((session) => {
                         const disc = disciplines?.find((d) => d.id === session.disciplineId);
                         return (
                           <div key={session.id} className="bg-zinc-50 border border-zinc-100 p-2 rounded-md">
                             <p className="text-sm text-zinc-800">
                               {disc?.name || session.name} | {format(new Date(session.dateTime), "EEEE, d 'de' MMMM", { locale: es })} | {format(new Date(session.dateTime), "HH:mm")}
                             </p>
                           </div>
                         );
                       })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No hay clases registradas.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* HISTORIAL DE PLANES */}
            <AccordionItem value="planes" className="border border-zinc-200 bg-white rounded-xl shadow-sm overflow-hidden px-1">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-zinc-50 font-semibold tracking-tight text-lg py-4">
                Historial de Planes
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0 border-t border-zinc-100">
                <div className="pt-4">
                  {student?.membership && (
                    <div className={`relative pl-6 border-l-2 ${isPlanActive ? 'border-emerald-500' : 'border-zinc-300'} space-y-1.5 py-2`}>
                      <div className={`absolute w-2.5 h-2.5 ${isPlanActive ? 'bg-emerald-500' : 'bg-zinc-300'} rounded-full -left-[5.5px] top-3`} />
                      <p className={`text-sm font-semibold ${isPlanActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                        {student.membership.membershipType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isPlanActive ? (
                          `Activo desde: ${student.membership.currentPeriodStart ? new Date(student.membership.currentPeriodStart).toLocaleDateString() : "-"} hasta ${student.membership.currentPeriodEnd ? new Date(student.membership.currentPeriodEnd).toLocaleDateString() : "-"}`
                        ) : (
                          `Finalizado | ${student.membership.currentPeriodStart ? new Date(student.membership.currentPeriodStart).toLocaleDateString() : "-"} hasta ${student.membership.currentPeriodEnd ? new Date(student.membership.currentPeriodEnd).toLocaleDateString() : "-"} | ${classesConsumed}/${isUnlimited ? '∞' : planClassLimit} clases`
                        )}
                      </p>
                    </div>
                  )}
                  {(!student?.membership?.history || student.membership.history.length === 0) && !student?.membership?.membershipType && (
                    <div className="relative pl-6 border-l-2 border-zinc-200 space-y-1.5 py-4">
                        <div className="absolute w-2.5 h-2.5 bg-zinc-200 rounded-full -left-[5.5px] top-5" />
                        <p className="text-sm font-medium text-zinc-400">Sin historial previo</p>
                        <p className="text-xs text-zinc-400">Aún no hay membresías asignadas para este alumno.</p>
                    </div>
                  )}
                  {student?.membership?.history?.map((pastMem, idx) => {
                      const isPastUnlimited = pastMem.planConfig?.classLimit === 0;
                      const classesContracted = pastMem.planConfig?.classLimit ?? 0;
                      const remainingClasses = pastMem.centerStats?.currentMonth?.remainingClasses ?? 0;
                      const consumed = !isPastUnlimited ? Math.max(0, classesContracted - remainingClasses) : (pastMem.centerStats?.currentMonth?.classesAttended ?? 0);
                      
                      return (
                          <div key={pastMem.id || idx} className="relative pl-6 border-l-2 border-zinc-200 space-y-1.5 py-4">
                              <div className="absolute w-2.5 h-2.5 bg-zinc-300 rounded-full -left-[5.5px] top-5" />
                              <p className="text-sm font-medium text-zinc-700">{pastMem.membershipType}</p>
                              <p className="text-xs text-muted-foreground">
                                Finalizado | {pastMem.currentPeriodStart ? new Date(pastMem.currentPeriodStart).toLocaleDateString() : "-"} hasta {pastMem.currentPeriodEnd ? new Date(pastMem.currentPeriodEnd).toLocaleDateString() : "-"} | {consumed}/{isPastUnlimited ? '∞' : classesContracted} clases
                              </p>
                          </div>
                      );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
            
          </Accordion>

        </div>
      </div>
    </div>
  );
}
