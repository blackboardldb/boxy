"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, History, Dumbbell, Edit, PlusCircle } from "lucide-react";
import type { FitCenterUserProfile } from "@/lib/types";

export default function StudentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { users, fetchUserById, classSessions, disciplines, fetchClassSessions, fetchDisciplines, plans, fetchPlans } = useBlackSheepStore();

  const [student, setStudent] = useState<FitCenterUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      if (!useBlackSheepStore.getState().classSessions?.length) {
        fetchClassSessions();
      }
      if (!useBlackSheepStore.getState().disciplines?.length) {
        fetchDisciplines();
      }
      setIsLoading(false);
    };
    loadData();
  }, [resolvedParams.id, fetchUserById, fetchPlans, fetchClassSessions, fetchDisciplines, users]);

  // Clases del alumno: futuras (próximas) y pasadas (asistidas)
  const now = new Date();
  const studentUpcomingClasses = useMemo(() =>
    (classSessions || [])
      .filter(s =>
        s.registeredParticipantsIds.includes(resolvedParams.id) &&
        new Date(s.dateTime) > now &&
        s.status !== "cancelled"
      )
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [classSessions, resolvedParams.id]
  );

  const studentPastClasses = useMemo(() =>
    (classSessions || [])
      .filter(s =>
        s.registeredParticipantsIds.includes(resolvedParams.id) &&
        new Date(s.dateTime) <= now
      )
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
    [classSessions, resolvedParams.id]
  );
  
  const currentPlan = useMemo(() => {
    if (!student?.membership?.planId) return null;
    return plans.find(p => p.id === student.membership?.planId);
  }, [plans, student]);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
        {/* Lado Izquierdo: Información Personal y Membresía Actual */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Datos Personales</CardTitle>
                <CardDescription>Información de contacto</CardDescription>
              </div>
              <Button variant="ghost" size="icon" title="Editar datos" onClick={() => toast({ title: "Edición Inline", description: "La edición de perfil se implementará en un modal" })}>
                  <Edit className="w-4 h-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Nombre completo</p>
                  <p className="font-medium text-zinc-900">{student.firstName} {student.lastName}</p>
               </div>
               <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium text-zinc-900 break-all">{student.email}</p>
               </div>
               <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Teléfono</p>
                  <p className="font-medium text-zinc-900">{student.phone}</p>
               </div>
               <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contacto de Emergencia</p>
                  <p className="font-medium text-zinc-900">{student.emergencyContact || "-"}</p>
               </div>
               {student.notes && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notas</p>
                    <p className="text-sm bg-amber-50/50 text-amber-900 border border-amber-100 p-3 rounded-md">{student.notes}</p>
                  </div>
               )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-zinc-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Dumbbell className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <div>
                <CardTitle className="text-lg">Membresía Actual</CardTitle>
                <CardDescription>Estado de facturación y plan</CardDescription>
              </div>
              <Button variant="ghost" size="icon" title="Ajustar plan actual" onClick={() => toast({ title: "Editar Plan Actual", description: "Modal para ajustes menores al plan actual" })}>
                  <Edit className="w-4 h-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5 relative z-10">
               <div className="flex items-start justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <div>
                    <p className="font-semibold text-lg text-zinc-900 leading-tight">{student.membership?.membershipType || "Sin plan activo"}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 uppercase tracking-wide
                      ${student.membership?.status === 'active' ? 'bg-green-100 text-green-800' : 
                      student.membership?.status === 'expired' ? 'bg-red-100 text-red-800' : 
                      'bg-zinc-100 text-zinc-800'}`}>
                      {student.membership?.status || "inactive"}
                    </span>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-black tracking-tight text-zinc-900">${student.membership?.monthlyPrice || 0}</p>
                     <p className="text-xs text-muted-foreground font-medium">/{currentPlan?.durationInMonths === 1 ? "mes" : currentPlan?.durationInMonths ? currentPlan.durationInMonths + " meses" : "mensual"}</p>
                  </div>
               </div>
               
               <div className="flex flex-col gap-3 py-2">
                 <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2">
                   <span className="text-muted-foreground">Inicio de plan</span>
                   <span className="font-medium text-zinc-900">{student.membership?.currentPeriodStart ? new Date(student.membership?.currentPeriodStart).toLocaleDateString() : "-"}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2">
                   <span className="text-muted-foreground">Vencimiento</span>
                   <span className="font-medium text-zinc-900">{student.membership?.currentPeriodEnd ? new Date(student.membership?.currentPeriodEnd).toLocaleDateString() : "-"}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">Forma de pago</span>
                   <span className="font-medium text-zinc-900 capitalize">{student.formaDePago || "-"}</span>
                 </div>
               </div>

               <Button className="w-full mt-2 flex items-center justify-center gap-2 group transition-all" variant="default" onClick={() => router.push(`/admin/alumnos/${student.id}/nuevo-plan`)}>
                 <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> Asignar Nuevo Plan
               </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lado Derecho: Timeline continuo de Historial, Próximas y Clases Asistidas */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-sm border-zinc-200">
            <CardHeader className="pb-4 border-b border-zinc-100">
              <CardTitle>Línea de Tiempo Operativa</CardTitle>
              <CardDescription>Resumen cronológico de actividad y reservas del alumno</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 pb-8 relative">
              <div className="absolute left-[38px] top-8 bottom-8 w-px bg-zinc-200 z-0 hidden md:block" />
              
              <div className="space-y-12 relative z-10 w-full max-w-full">
                 {/* PRÓXIMAS CLASES */}
                 <div>
                   <div className="flex items-center gap-4 mb-5">
                     <div className="bg-blue-100 text-blue-600 p-2.5 rounded-full outline outline-4 outline-white shadow-sm ring-1 ring-zinc-200 hidden md:block">
                       <CalendarDays className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-semibold tracking-tight text-zinc-900 flex-1">Reservas Activas</h3>
                   </div>
                   
                   <div className="space-y-3 md:pl-[60px] w-full max-w-full">
                     {studentUpcomingClasses.length > 0 ? (
                       studentUpcomingClasses.map((session) => {
                         const disc = disciplines?.find((d) => d.id === session.disciplineId);
                         const sessionDate = new Date(session.dateTime);
                         return (
                           <div key={session.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border border-blue-100/50 bg-blue-50/30 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-3 sm:gap-0 w-full max-w-full min-w-0">
                             <div className="min-w-0 pr-2">
                               <p className="font-semibold text-sm text-blue-950 truncate">{disc?.name || session.name}</p>
                               <p className="text-xs text-blue-800/80 mt-1">
                                 {sessionDate.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })} • <span className="font-semibold">{sessionDate.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} hrs</span>
                               </p>
                             </div>
                             <span className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-blue-100 text-blue-800 self-start sm:self-center shrink-0">Reservada</span>
                           </div>
                         );
                       })
                     ) : (
                       <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl text-center">
                         <p className="text-sm text-muted-foreground">El alumno no tiene reservas futuras ingresadas.</p>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* CLASES PASADAS / HISTORIAL */}
                 <div>
                   <div className="flex items-center gap-4 mb-5">
                     <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-full outline outline-4 outline-white shadow-sm ring-1 ring-zinc-200 hidden md:block">
                       <Dumbbell className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-semibold tracking-tight text-zinc-900 flex-1">Clases Asistidas</h3>
                   </div>
                   
                   <div className="space-y-4 md:pl-[60px] w-full max-w-full">
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-900 text-zinc-100 p-4 rounded-xl border border-zinc-800 shadow-md gap-2 w-full max-w-full">
                        <span className="text-sm">Total mensual consumido: <strong className="text-emerald-400 text-lg ml-1">{(student.membership?.planConfig?.classLimit || 0) - (student.membership?.centerStats?.currentMonth?.remainingClasses || 0)}</strong></span>
                        <span className="text-sm text-zinc-400 font-medium">Límite mensual: <span className="text-zinc-200">{student.membership?.planConfig?.classLimit || 0}</span></span>
                     </div>

                     {studentPastClasses.length > 0 ? (
                       <div className="space-y-2">
                         {studentPastClasses.slice(0, 15).map((session) => {
                           const disc = disciplines?.find((d) => d.id === session.disciplineId);
                           const sessionDate = new Date(session.dateTime);
                           return (
                             <div key={session.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:px-4 sm:py-3 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 transition-colors gap-2 sm:gap-0 w-full max-w-full min-w-0">
                               <div className="min-w-0 pr-2">
                                 <p className="font-medium text-sm text-zinc-900 truncate">{disc?.name || session.name}</p>
                                 <p className="text-xs text-muted-foreground mt-0.5">
                                   {sessionDate.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })} a las {sessionDate.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                                 </p>
                               </div>
                               <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-zinc-100 text-zinc-600 self-start sm:self-center shrink-0">
                                 Completada
                               </span>
                             </div>
                           );
                         })}
                       </div>
                     ) : (
                       <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl text-center">
                         <p className="text-sm text-muted-foreground">No hay registro de asistencia a clases.</p>
                       </div>
                     )}
                     
                     {studentPastClasses.length > 15 && (
                        <p className="text-xs font-medium text-muted-foreground text-center pt-2">Mostrando las últimas 15 clases asistidas</p>
                     )}
                   </div>
                 </div>

                 {/* HISTORIAL MEMBRESIA */}
                 <div>
                   <div className="flex items-center gap-4 mb-5">
                     <div className="bg-zinc-100 text-zinc-600 p-2.5 rounded-full outline outline-4 outline-white shadow-sm ring-1 ring-zinc-200 hidden md:block">
                       <History className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-semibold tracking-tight text-zinc-900 flex-1">Renovaciones Previas</h3>
                   </div>
                   
                   <div className="space-y-4 md:pl-[60px] opacity-80 hover:opacity-100 transition-opacity w-full max-w-full">
                      <div className="relative pl-6 border-l-2 border-emerald-500 space-y-1.5 py-1 w-full">
                          <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-[5px] top-1.5" />
                          <p className="text-sm font-semibold text-zinc-900">{student.membership?.membershipType || "Plan actual"}</p>
                          <p className="text-xs text-muted-foreground">Inició el {student.membership?.currentPeriodStart ? new Date(student.membership?.currentPeriodStart).toLocaleDateString() : "-"}</p>
                      </div>
                      <div className="relative pl-6 border-l-2 border-zinc-200 space-y-1.5 py-1 w-full">
                          <div className="absolute w-2 h-2 bg-zinc-300 rounded-full -left-[4px] top-1.5" />
                          <p className="text-sm font-medium text-zinc-500">Historial previo</p>
                          <p className="text-xs text-muted-foreground">Membresías finalizadas aparecerán aquí.</p>
                      </div>
                   </div>
                 </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

