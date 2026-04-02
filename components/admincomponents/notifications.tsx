"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { calcularFechaTerminoMembresia } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  XCircle,
  Bell,
  RefreshCw,
  Filter,
} from "lucide-react";

export function Notifications() {
  const { 
    users, 
    classSessions, 
    plans, 
    fetchPlans, 
    fetchUsers, 
    fetchClassSessions, 
    updateUserById, 
    isLoading: storeLoading 
  } = useBlackSheepStore() as any;
  
  const [mounted, setMounted] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<any>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [notificationFilter, setNotificationFilter] = useState("todos");

  // EFECTO DE MONTAJE Y CARGA INICIAL
  useEffect(() => {
    setMounted(true);
    
    // Carga de datos específica para alertas
    const loadData = async () => {
      // 1. Usuarios y Planes (Normal)
      if (users.length === 0) fetchUsers(1, 100);
      if (plans.length === 0) fetchPlans(1, 100);

      // 2. Clases: Traemos específicamente las canceladas de hoy en adelante para que "funcione bien" al refrescar
      const today = new Date().toISOString().split("T")[0];
      fetchClassSessions(today, undefined, 1, 50, { status: "cancelled" });
    };

    loadData();
  }, []);

  if (!mounted) return null;

  // --- DERIVACIÓN DE DATOS (Notificaciones calculadas al vuelo) ---
  const now = new Date();

  // 1. Renovaciones Pendientes (Priorizado por urgencia)
  const pendingRenewals = (users || [])
    .filter((u: any) => u.membership?.pendingRenewal?.status === "pending")
    .map((user: any) => {
      const renewal = user.membership!.pendingRenewal!;
      const expirationDate = parseISO(user.membership!.currentPeriodEnd.substring(0, 10));
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: `renewal-${user.id}`,
        type: "pending_renewal",
        user,
        renewal,
        daysUntilExpiration,
        timestamp: new Date(renewal.requestDate || now)
      };
    })
    .sort((a: any, b: any) => a.daysUntilExpiration - b.daysUntilExpiration);

  // 2. Clases Canceladas (Últimas 5 de hoy en adelante)
  const cancelledClasses = (classSessions || [])
    .filter((cls: any) => {
      if (cls.status !== "cancelled") return false;
      const classDate = new Date(cls.dateTime);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return classDate.getTime() >= startOfToday.getTime();
    })
    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  const handleApproveRenewal = async (user: any, renewal: any) => {
    try {
     const startDate = customStartDate || new Date().toISOString().split("T")[0];
const selectedPlan = plans.find((p: any) => p.id === renewal.requestedPlanId);
const planDuration = selectedPlan?.durationInMonths || 1;
      
      const endDateStr = calcularFechaTerminoMembresia(startDate, planDuration);

      const updatedUserData = {
        membership: {
          ...user.membership!,
          status: "active" as const,
          planId: renewal.requestedPlanId,
          membershipType: selectedPlan?.name || renewal.requestedPlanName,
          monthlyPrice: selectedPlan?.price || user.membership.monthlyPrice,
          currentPeriodStart: startDate,
currentPeriodEnd: endDateStr,
          pendingRenewal: {
            ...renewal,
            status: "approved" as const,
            processedBy: "admin",
            processedDate: new Date().toISOString(),
          },
        },
      };

      const result = await updateUserById(user.id, updatedUserData);
      if (result) {
        setShowRenewalModal(false);
      }
    } catch (error) {
      console.error("Error al procesar la renovación:", error);
    }
  };

  const handleRejectRenewal = async (user: any, renewal: any) => {
    try {
      const updatedUserData = {
        membership: {
          ...user.membership!,
          pendingRenewal: {
            ...renewal,
            status: "rejected" as const,
            processedBy: "admin",
            processedDate: new Date().toISOString(),
            notes: rejectReason,
          },
        },
        notes: (user.notes || "") + ` - Renewal rejected on ${new Date().toLocaleDateString()}: ${rejectReason}`,
      };

      const result = await updateUserById(user.id, updatedUserData);
      if (result) {
        setShowRejectModal(false);
        setRejectReason("");
        setShowRenewalModal(false);
      }
    } catch (error) {
      console.error("Error al procesar el rechazo:", error);
    }
  };

  return (
    <div className="space-y-6">
       {/* Filtros */}
      <div className="flex items-center justify-end gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={notificationFilter} onValueChange={setNotificationFilter}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Mostrar Todo</SelectItem>
            <SelectItem value="renovaciones">Solo Renovaciones</SelectItem>
            <SelectItem value="cancelaciones">Solo Cancelaciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notificaciones</h1>
      
      </div>
      {/* Header con estadísticas resumidas */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">

        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Renovaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500 flex items-center gap-2">{pendingRenewals.length} <RefreshCw className="h-4 w-4 text-orange-500" /></div>
             <p className="text-xs text-muted-foreground">{pendingRenewals.filter((r: any) => r.daysUntilExpiration <= 7).length} expiran pronto</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 flex items-center gap-2">{cancelledClasses.length} <XCircle className="h-4 w-4 text-red-500" /></div>
            <p className="text-xs text-muted-foreground">Clases hoy / futuro</p>
          </CardContent>
        </Card>


      </div>

     

      {/* --- SECCIONES DE NOTIFICACIONES --- */}
      <div className="space-y-8">
        
        {/* 1. RENOVACIONES */}
        {(notificationFilter === "todos" || notificationFilter === "renovaciones") && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-500" /> Renovaciones de Plan
            </h2>
            
            {(storeLoading && pendingRenewals.length === 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Card key={i} className="h-40 animate-pulse bg-zinc-50 rounded-xl" />)}
              </div>
            ) : pendingRenewals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {pendingRenewals.map((r: any) => (
                  <Card key={r.id} className="border-l-4 border-orange-500 hover:shadow-md transition-shadow rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 rounded-xl">RENOVACIÓN</Badge>
                        {r.daysUntilExpiration <= 7 && <Badge variant="destructive" className="rounded-xl">URGENTE</Badge>}
                      </div>
                      <h3 className="font-bold text-lg">{r.user.firstName} {r.user.lastName}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {r.daysUntilExpiration < 0 ? "Vencido" : `Vence en ${r.daysUntilExpiration} días`}
                      </p>
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 rounded-xl" onClick={() => {
                        setSelectedRenewal(r);
                       setCustomStartDate(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date()));
                        setShowRenewalModal(true);
                      }}>Gestionar</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50 rounded-xl border border-dashed text-muted-foreground">No hay renovaciones pendientes.</div>
            )}
          </div>
        )}

        {/* 2. CANCELACIONES (Simplificado, sin botón entendido) */}
        {(notificationFilter === "todos" || notificationFilter === "cancelaciones") && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" /> Clases Canceladas
            </h2>
            
           <div className="bg-red-50 p-4 rounded-xl">
             {(storeLoading && cancelledClasses.length === 0) ? (
              <div className="space-y-3 ">
                {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : cancelledClasses.length > 0 ? (
              <div className="space-y-4">
                 {cancelledClasses.map((cls: any) => (
                  <div key={cls.id} className="">
                    <div className=" flex items-center gap-2">
                     
                        <p className="font-bold text-red-900">{cls.name}</p>
                        <p className="text-sm text-red-700">
                          {format(new Date(cls.dateTime), "EEE dd MMMM, HH:mm", { locale: es })}
                        </p>
                     
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50 rounded-xl border border-dashed text-muted-foreground">No hay clases canceladas recientemente.</div>
            )}
           </div>
          </div>
        )}
      </div>



      <Dialog open={showRenewalModal} onOpenChange={setShowRenewalModal}>
        <DialogContent className="max-w-2xl rounded-xl">
          <DialogHeader><DialogTitle>Gestionar Renovación</DialogTitle></DialogHeader>
          {selectedRenewal && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-xl border">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Alumno</Label>
                  <p className="font-bold">{selectedRenewal.user.firstName} {selectedRenewal.user.lastName}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <Label className="text-[10px] uppercase font-bold text-orange-600">Plan Solicitado</Label>
                  <p className="font-bold text-orange-700">
                    {plans.find((p: any) => p.id === selectedRenewal.renewal.requestedPlanId)?.name || selectedRenewal.renewal.requestedPlanName}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Fecha de Inicio</Label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded-xl" 
                  value={customStartDate} 
                  onChange={e => setCustomStartDate(e.target.value)} 
                />
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl" onClick={() => handleApproveRenewal(selectedRenewal.user, selectedRenewal.renewal)}>Confirmar Pago y Activar</Button>
                <Button variant="destructive" className="flex-1 rounded-xl" onClick={() => setShowRejectModal(true)}>Rechazar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="rounded-xl">
          <DialogHeader><DialogTitle>Confirmar Rechazo</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Label>Motivo del rechazo</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Ej: No se confirma transferencia..." className="rounded-xl" />
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1 rounded-xl" onClick={() => handleRejectRenewal(selectedRenewal.user, selectedRenewal.renewal)}>Confirmar Rechazo</Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
