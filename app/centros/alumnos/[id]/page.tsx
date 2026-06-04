"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Edit, Clock3, Users, Calendar, Ticket, CheckCircle2, Bell, KeyRound, Trash2 } from "lucide-react";
import type { FitCenterUserProfile } from "@/lib/types";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { getPlanStatus, getStudentClassesInPeriod, calcularFechaTerminoMembresia, calcularClasesSegunDuracion } from "@/lib/utils";
import { PhoneInputCL } from "@/components/PhoneInputCL";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { useUser, useUpdateUser } from "@/lib/react-query/hooks/useUsers";
import { useMyBookings } from "@/lib/react-query/hooks/useClasses";
import { usePlans } from "@/lib/react-query/hooks/usePlans";
import { useDisciplines } from "@/lib/react-query/hooks/useDisciplines";
import { usePlanHistory } from "@/lib/react-query/hooks/usePlanHistory";

export default function StudentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();

  // React Query
  const { data: fetchedUser, isLoading } = useUser(resolvedParams.id);

  // Fecha segura: periodo actual del alumno, o últimos 30 días como fallback
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgoStr = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const periodStart = fetchedUser?.membership?.currentPeriodStart;
  const startDateToFetch = periodStart
    ? (periodStart < todayStr ? periodStart : todayStr)
    : thirtyDaysAgoStr;

  const { data: userClasses = [] } = useMyBookings(fetchedUser?.id, startDateToFetch);
  const { data: plans = [] } = usePlans({ limit: 100 });
  const { data: disciplinesData } = useDisciplines();
  const disciplines = disciplinesData ?? [];
  const updateUserMutation = useUpdateUser();

  // Estado de edición local
  const [student, setStudent] = useState<FitCenterUserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Estado del acordeón de historial — controla la carga diferida
  const [planesOpen, setPlanesOpen] = useState(true); // abierto por defecto (defaultValue=["planes"])
  const { data: planHistory = [], isLoading: historyLoading } = usePlanHistory(
    resolvedParams.id,
    planesOpen
  );

  // Password reset state
  const [resetPasswordStatus, setResetPasswordStatus] = useState<"idle" | "loading" | "done">("idle");

  // States for Datos Personales
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editDateOfBirth, setEditDateOfBirth] = useState("");
  const [editEmergencyContact, setEditEmergencyContact] = useState("");

  // States for Membresía
  const [editPlanId, setEditPlanId] = useState("");
  const [editClassLimit, setEditClassLimit] = useState<number | string>(0);
  const [editPrice, setEditPrice] = useState<number | string>(0);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("");
  const [registerPayment, setRegisterPayment] = useState(true);

  // Sincronizar student local con dato de React Query
  useEffect(() => {
    if (fetchedUser) setStudent(fetchedUser);
  }, [fetchedUser]);

  // Inicialización explícita al abrir la sección de datos personales.
  // No usamos useEffect([student]) para evitar que un refetch de React Query
  // en background resetee silenciosamente los campos mientras el admin escribe.
  const handleEditPersonal = () => {
    if (!student) return;
    setEditFirstName(student.firstName || "");
    setEditLastName(student.lastName || "");
    setEditEmail(student.email || "");
    setEditPhone(student.phone || "");
    setEditGender(student.gender || "");
    setEditDateOfBirth(student.dateOfBirth || "");
    setEditEmergencyContact(student.emergencyContact || "");
    setEditingSection("personal");
  };

  // Inicialización explícita al abrir la sección de membresía.
  const handleEditMembership = () => {
    if (!student) return;
    const m = student.membership;
    if (m) {
      setEditPlanId(m.planId || "");
      setEditClassLimit(m.planConfig?.classLimit ?? 0);
      setEditPrice(m.monthlyPrice ?? 0);
      setEditStartDate(m.currentPeriodStart ? m.currentPeriodStart.substring(0, 10) : "");
      setEditEndDate(m.currentPeriodEnd ? m.currentPeriodEnd.substring(0, 10) : "");
      setEditPaymentMethod(student.formaDePago || "transferencia");
      setRegisterPayment(true);
    }
    setEditingSection("membership");
  };

  const handlePlanChange = (planId: string) => {
    setEditPlanId(planId);
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      setEditClassLimit(calcularClasesSegunDuracion(selectedPlan.classLimit, selectedPlan.durationInMonths));
      setEditPrice(selectedPlan.price);
      
      if (editStartDate) {
        setEditEndDate(calcularFechaTerminoMembresia(editStartDate, selectedPlan.durationInMonths));
      }
    }
  };

const handleStartDateChange = (newDate: string) => {
  setEditStartDate(newDate);
  const selectedPlan = plans.find(p => p.id === editPlanId)
    || plans.find(p => p.name === student?.membership?.membershipType);
  if (selectedPlan && newDate) {
    setEditEndDate(calcularFechaTerminoMembresia(newDate, selectedPlan.durationInMonths));
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
        dateOfBirth: editDateOfBirth,
        emergencyContact: editEmergencyContact,
      };

      await updateUserMutation.mutateAsync({ id: student.id, data: changes });

      const updated = { ...student, ...changes } as FitCenterUserProfile;
      setStudent(updated);
      toast({ title: "Guardado", description: "Datos personales actualizados correctamente" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Hubo un problema al guardar los datos", variant: "destructive" });
    } finally {
      setIsSaving(false);
      setEditingSection(null);
    }
  };

  const handleResetPassword = async () => {
    if (!student?.email) return;
    setResetPasswordStatus("loading");
    try {
      const res = await fetch(`/api/users/${student.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: student.email }),
      });
      const json = await res.json();
      if (json.success) {
        setResetPasswordStatus("done");
        // Vuelve al estado idle despues de 3 segundos
        setTimeout(() => setResetPasswordStatus("idle"), 3000);
      } else {
        toast({ title: "Error", description: json.error ?? "No se pudo resetear la contraseña.", variant: "destructive" });
        setResetPasswordStatus("idle");
      }
    } catch {
      toast({ title: "Error", description: "Error inesperado al resetear la contraseña.", variant: "destructive" });
      setResetPasswordStatus("idle");
    }
  };

  const saveMembershipInfo = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
      const selectedPlan = plans.find(p => p.id === editPlanId);
      
      const newStartStr = editStartDate;
      const newEndStr = editEndDate;
      const newStart = new Date(newStartStr + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isScheduled = newStart > today;
      const newEnd = new Date(newEndStr + "T23:59:59");
      
      const newEnrolledClasses = (userClasses || []).filter(s => {
        const sessionDate = new Date(s.dateTime);
        return (
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
        status: isScheduled ? "scheduled" : "active",
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
      } as NonNullable<FitCenterUserProfile["membership"]>;

      const changes = {
        formaDePago: editPaymentMethod as FitCenterUserProfile["formaDePago"],
        membership: updatedMembership,
        registerPayment,
      };

      // Fix 1: Cancelar renovaciones zombie (scheduled/pending) antes de guardar.
      // El admin está tomando control manual → cualquier renovación en cola pierde validez.
      const zombieRenewals = (student.membershipRenewals ?? []).filter(
        (r: any) => r.status === 'scheduled' || r.status === 'pending'
      );
      await Promise.all(
        zombieRenewals.map((renewal: any) =>
          fetch(`/api/users/${student.id}/renewal/${renewal.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' }),
          })
        )
      );

      await updateUserMutation.mutateAsync({ id: student.id, data: changes });

      const updated = { ...student, ...changes } as FitCenterUserProfile;
      setStudent(updated);
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
    return getStudentClassesInPeriod(
      userClasses,
      student?.membership?.currentPeriodStart,
      student?.membership?.currentPeriodEnd
    );
  }, [userClasses, student]);




  const hasPendingRenewal = student?.membershipRenewals?.some(
    (r: any) => r.status === 'pending'
  ) ?? false;

  // Plan programado futuro (desde MembershipRenewal, NO desde UserMembership)
  const scheduledPlan = student?.membershipRenewals?.find(
    (r: any) => r.status === 'scheduled'
  ) ?? null;

  // Determine plan status
  const planStatus = student ? getPlanStatus(student) : "inactive";
  const isPlanActive = planStatus === "active";
  const isPendingApproval =
    planStatus === "pending" ||
    student?.membership?.pendingRenewal?.status === "pending";
  const isScheduled = planStatus === "scheduled";
  const isPlanInactive = planStatus === "inactive";
  
  // Data prep for Plan display
  const planClassLimit = student?.membership?.planConfig?.classLimit ?? 0;
  const isUnlimited = planClassLimit === 0;
  
  // Calculate consumed safely based on override or direct attendance
  // Calculate consumed safely based on the actual enrolled classes count in the current period
  const classesConsumedTotal = studentAllEnrolledClasses.length;
  const classesConsumed = !isUnlimited
    ? classesConsumedTotal
    : student?.membership?.centerStats?.currentMonth?.classesAttended ?? classesConsumedTotal;
  
  const remainingClasses = !isUnlimited ? Math.max(0, planClassLimit - classesConsumed) : 0;

  if (isLoading) return <div className="p-8">Cargando perfil del alumno...</div>;
  if (!student) return <div className="p-8">Alumno no encontrado.</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto flex flex-col min-h-screen">
      <div className=" space-y-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/centros/alumnos")} className="shrink-0 bg-zinc-100 rounded-full">
          <ArrowLeft className="h-7 w-7" />
        </Button>
        <div className="flex items-center gap-3 w-full sm:w-auto">
       
          <h1 className="text-3xl font-bold">
            Perfil de {student.firstName} {student.lastName}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 flex-1">
        {/* Lado Izquierdo: Información Personal y Membresía Actual */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-6">
          
          {/* Tarjeta de Datos Personales */}
          <Card className="shadow-sm border-zinc-100 rounded-xl">
            {editingSection !== "personal" ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">Datos Personales</CardTitle>
                    <CardDescription>Información de contacto</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleEditPersonal} className="rounded-xl">
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
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-zinc-900">{student.phone || "-"}</p>
                      <WhatsAppLink phone={student.phone} />
                    </div>
                  </div>
                  {student.gender && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Género</p>
                      <p className="font-medium text-zinc-900 capitalize">{student.gender}</p>
                    </div>
                  )}
                  {student.dateOfBirth && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fecha de Nacimiento</p>
                      <p className="font-medium text-zinc-900">
                        {(() => {
                          const parts = student.dateOfBirth.split('-');
                          if (parts.length === 3) {
                            const year = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1;
                            const day = parseInt(parts[2], 10);
                            return format(new Date(year, month, day), "d 'de' MMMM yyyy", { locale: es });
                          }
                          return format(new Date(student.dateOfBirth), "d 'de' MMMM yyyy", { locale: es });
                        })()}
                      </p>
                    </div>
                  )}
                  {student.emergencyContact && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contacto de Emergencia</p>
                      <p className="font-medium text-zinc-900">{student.emergencyContact}</p>
                    </div>
                  )}
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
                      <Label className="text-zinc-700 font-medium">Nombre</Label>
                      <Input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-700 font-medium">Apellido</Label>
                      <Input value={editLastName} onChange={e => setEditLastName(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-700 font-medium">Email</Label>
                    <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-700 font-medium">Teléfono</Label>
                    <PhoneInputCL value={editPhone} onChange={setEditPhone} />
                  </div>
                  {student.gender && (
                    <div className="space-y-2">
                      <Label className="text-zinc-700 font-medium">Género</Label>
                      <Select value={editGender} onValueChange={setEditGender}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {student.dateOfBirth && (
                    <div className="space-y-2">
                      <Label className="text-zinc-700 font-medium">Fecha de Nacimiento</Label>
                      <Input type="date" value={editDateOfBirth} onChange={e => setEditDateOfBirth(e.target.value)} className="rounded-xl" />
                    </div>
                  )}
                  {student.emergencyContact && (
                    <div className="space-y-2">
                      <Label className="text-zinc-700 font-medium">Contacto de Emergencia</Label>
                      <Input value={editEmergencyContact} onChange={e => setEditEmergencyContact(e.target.value)} className="rounded-xl" />
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setEditingSection(null)} className="rounded-xl">Cancelar</Button>
                    <Button onClick={savePersonalInfo} disabled={isSaving} className="rounded-xl">{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>



          {/* Tarjeta de Membresía Actual */}
          <Card className="shadow-sm border-zinc-100 rounded-xl">
            {editingSection !== "membership" ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <p className="text-md font-semibold">Plan Actual</p>
                  </div>
                  <Button variant="ghost" size="sm" className="underline " onClick={handleEditMembership}>
                    <Edit className="w-4 h-4 text-muted-foreground mr-1" /> Editar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`uppercase font-bold tracking-wider text-sm ${
                              isPlanActive
                                ? "text-lime-900"
                                : isScheduled
                                ? "text-blue-500"
                                : isPendingApproval
                                ? "text-orange-500"
                                : "text-zinc-500"
                            }`}
                          >
                            {isPlanActive
                              ? "Activo"
                              : isScheduled
                              ? "Programado"
                              : isPendingApproval
                              ? "Validar plan"
                              : "Inactivo"}
                          </span>
                          {hasPendingRenewal && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-200">
                              Renovación pendiente
                            </span>
                          )}
                        </div>
                        <div className="inline-flex gap-1.5 text-xs text-zinc-600 bg-black/5 px-2 py-1 rounded-xl items-center">
                          
                        
                        </div>
                      </div>
                      <h2 className="  font-bold text-2xl">{student.membership?.membershipType || "Sin plan activo"}</h2>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-100">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium  ">Clases consumidas</span>
                         <p className="text-sm  ">
                           <span className="text-lime-500 font-bold text-base">{classesConsumed}</span>
                           {" "}
                           {isUnlimited ? "realizadas" : `/ ${planClassLimit}`}
                         </p>
                      </div>
                      
                      {!isUnlimited && (
                        <div className="w-full bg-zinc-700 rounded-xl h-2 mt-3 overflow-hidden">
                          <div 
                            className="bg-lime-500 h-full rounded-xl transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(100, (classesConsumed / planClassLimit) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-sm px-2">
                    <div className="text-muted-foreground">Clases totales</div>
                    <div className="font-medium text-right text-zinc-900">
                       {isUnlimited ? "Ilimitadas" : `${planClassLimit} clases`}
                      </div>
                    <div className="text-muted-foreground">Precio plan</div>
                    <div className="font-medium text-right text-zinc-900">
                       $
                        {student.membership?.monthlyPrice ? student.membership.monthlyPrice.toLocaleString("es-CL") : "N/A"}
                      </div>
                    <div className="text-muted-foreground">Duración</div>
                    <div className="font-medium text-right text-zinc-900">
                      
                            {student.membership?.currentPeriodStart
                              ? format(
                                  parseISO(student.membership.currentPeriodStart.substring(0, 10)),
                                  "dd MMM",
                                  { locale: es }
                                )
                              : "—"}{" "}
                            -{" "}
                            {student.membership?.currentPeriodEnd
                              ? format(
                                  parseISO(student.membership.currentPeriodEnd.substring(0, 10)),
                                  "dd MMM",
                                  { locale: es }
                                )
                              : "—"}
                    </div>
                    
                    <div className="text-muted-foreground">Forma de pago</div>
                    <div className="font-medium text-right text-zinc-900 capitalize">{student.formaDePago || "-"}</div>
                  </div>
                  {/* Banner azul eliminado — la info de plan programado
                      vive en "Historial de Planes" con todos los estados */}

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col gap-3">
                    {isPendingApproval && (
                      <Button 
                        variant="default" 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                        onClick={() => router.push('/centros/alertas')}
                      >
                         <Bell className="w-4 h-4 mr-2" /> Validar Solicitud de Plan
                      </Button>
                    )}
                    <Button 
                      variant="default" 
                      className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl"
                      onClick={() => router.push(`/centros/alumnos/${student.id}/nuevo-plan`)}
                    >
                      <Ticket className="w-4 h-4 mr-2" /> Activar Nuevo Plan
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                 <CardHeader className="pb-4 border-b border-zinc-100">
                  <CardTitle className="text-lg text-zinc-900 font-bold">Editar Membresía</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-zinc-700 font-medium">Plan</Label>
                      <Select value={editPlanId} onValueChange={handlePlanChange}>
                        <SelectTrigger className="rounded-xl">
                           <SelectValue placeholder="Seleccionar plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-zinc-700 font-medium">Clases totales</Label>
                        <Input type="number" value={editClassLimit} onChange={e => setEditClassLimit(e.target.value)} className="rounded-xl" />
                      </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-700 font-medium">Total ($)</Label>
                        <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-zinc-700 font-medium">Fecha inicio</Label>
                        <Input type="date" value={editStartDate} onChange={e => handleStartDateChange(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-700 font-medium">Fecha término</Label>
                        <Input type="date" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-700 font-medium">Forma de pago</Label>
                      <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Forma" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="contado">Contado</SelectItem>
                          <SelectItem value="debito">Débito</SelectItem>
                          <SelectItem value="credito">Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="registerPayment"
                        checked={registerPayment}
                        onCheckedChange={(v) => setRegisterPayment(v as boolean)}
                      />
                      <Label htmlFor="registerPayment" className="text-sm text-zinc-600 cursor-pointer">
                        Registrar como ingreso
                      </Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingSection(null)} className="rounded-xl">Cancelar</Button>
                      <Button onClick={saveMembershipInfo} disabled={isSaving} className="rounded-xl">{isSaving ? "Guardando..." : "Guardar cambios"}</Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Lado Derecho: Contraseña y Acordeones */}
        <div className="lg:col-span-1 xl:col-span-2 space-y-6">
          
          {/* Tarjeta de Contraseña (Movida aquí) */}
          <Card className="shadow-sm border-zinc-100 rounded-xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold">Seguridad de la cuenta</CardTitle>
                <CardDescription>Restablece la clave de acceso del alumno a la contraseña por defecto</CardDescription>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resetPasswordStatus === "loading" || resetPasswordStatus === "done"}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed ${
                  resetPasswordStatus === "done"
                    ? "bg-emerald-500 text-white focus:ring-emerald-400"
                    : "bg-zinc-900 hover:bg-zinc-700 text-white focus:ring-zinc-600"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                {resetPasswordStatus === "loading"
                  ? "Cambiando..."
                  : resetPasswordStatus === "done"
                  ? "Cambiado"
                  : "Restablecer contraseña"}
              </button>
            </CardHeader>
          </Card>

          <Accordion
            type="multiple"
            defaultValue={["planes"]}
            className="w-full space-y-4"
            onValueChange={(vals) => setPlanesOpen(vals.includes("planes"))}
          >
            
            {/* HISTORIAL DE ASISTENCIA */}
            <AccordionItem value="asistencia" className="border border-zinc-100 bg-white rounded-xl shadow-sm overflow-hidden px-1">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-zinc-50 font-semibold tracking-tight text-lg py-4">
                Clases consumidas del plan actual
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
            <AccordionItem value="planes" className="border border-zinc-100 bg-white rounded-xl shadow-sm overflow-hidden px-1">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-zinc-50 font-semibold tracking-tight text-lg py-4">
                Historial de Planes
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0 border-t border-zinc-100">
                <div className="pt-3 max-h-[420px] overflow-y-auto space-y-2 pr-1">

                  {historyLoading ? (
                    <div className="space-y-2 pt-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl px-4 py-3 bg-zinc-50 border border-zinc-100 space-y-1.5">
                          <div className="h-3.5 bg-zinc-200 rounded-lg animate-pulse w-2/5" />
                          <div className="h-3 bg-zinc-100 rounded-lg animate-pulse w-3/5" />
                        </div>
                      ))}
                    </div>
                  ) : planHistory.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {planHistory.map((renewal) => {
                        const isScheduled = renewal.status === "scheduled";
                        const isCurrent =
                          !isScheduled &&
                          renewal.planName === student?.membership?.membershipType &&
                          renewal.startDate?.substring(0, 10) ===
                            student?.membership?.currentPeriodStart?.substring(0, 10);

                        return (
                          <div
                            key={renewal.id}
                            className={`rounded-xl px-4 py-3 flex items-center justify-between gap-3 border ${
                              isScheduled
                                ? "bg-blue-50 border-blue-100"
                                : "bg-zinc-50 border-zinc-100"
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <p className="text-sm font-medium text-zinc-800 truncate">
                                {renewal.planName}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {renewal.startDate
                                  ? format(parseISO(renewal.startDate.substring(0, 10)), "d MMM yyyy", { locale: es })
                                  : "—"}
                                {" → "}
                                {renewal.endDate
                                  ? format(parseISO(renewal.endDate.substring(0, 10)), "d MMM yyyy", { locale: es })
                                  : "—"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {renewal.amount != null && (
                                <span className="text-xs font-semibold text-zinc-500">
                                  ${renewal.amount.toLocaleString("es-CL")}
                                </span>
                              )}
                              {isScheduled && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  Programado
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                  Activo
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : student?.membership ? (
                    /* Fallback: plan activo sin MembershipRenewal (activado antes del sistema de historial) */
                    <div className="space-y-2 pt-1">
                      <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 border bg-emerald-50 border-emerald-100">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-sm font-medium text-zinc-800 truncate">
                            {student.membership.membershipType}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {student.membership.currentPeriodStart
                              ? format(parseISO(student.membership.currentPeriodStart.substring(0, 10)), "d MMM yyyy", { locale: es })
                              : "—"}
                            {" → "}
                            {student.membership.currentPeriodEnd
                              ? format(parseISO(student.membership.currentPeriodEnd.substring(0, 10)), "d MMM yyyy", { locale: es })
                              : "—"}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                          Activo
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 px-1 italic">Sin planes anteriores registrados.</p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 px-1 pt-1 italic">Sin historial de planes.</p>
                  )}

                </div>
              </AccordionContent>
            </AccordionItem>
            
          </Accordion>

        </div>
      </div>
    </div>
  );
}
