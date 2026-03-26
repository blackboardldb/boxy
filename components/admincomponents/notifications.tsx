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
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Bell,
  RefreshCw,
  Filter,
} from "lucide-react";
import type { FitCenterUserProfile } from "@/lib/types";

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
  
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FitCenterUserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<any>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
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
      const expirationDate = new Date(user.membership!.currentPeriodEnd);
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

  // 3. Nuevos Alumnos
  const pendingUsers = (users || [])
    .filter((u: any) => u.membership?.status === "pending")
    .map((user: any) => ({
      id: `user-${user.id}`,
      type: "pending_user",
      user,
      isNew: (user.membership?.centerStats?.lifetimeStats?.totalClasses || 0) === 0,
      timestamp: now 
    }));

  // Filtro de UI
  const filteredRenewals = (notificationFilter === "todos" || notificationFilter === "renovaciones") ? pendingRenewals : [];
  const filteredUsers = (notificationFilter === "todos" || notificationFilter === "usuarios") ? pendingUsers : [];
  const filteredCancellations = (notificationFilter === "todos" || notificationFilter === "cancelaciones") ? cancelledClasses : [];

  const totalNotificationsCount = pendingRenewals.length + filteredCancellations.length + pendingUsers.length;
  // Handlers para acciones
  const handleApproveUser = async (user: FitCenterUserProfile) => {
    const startDate = new Date().toISOString().split("T")[0];
    const planDuration = 1;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + planDuration);

    const updatedUserData = {
      membership: {
        ...user.membership!,
        status: "active" as const,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate.toISOString().split("T")[0],
      },
      notes: (user.notes || "") + " - Approved on " + new Date().toLocaleDateString(),
    };

    const result = await updateUserById(user.id, updatedUserData);
    if (result) {
      toast({ title: "Alumno aprobado", description: `${user.firstName} ya tiene acceso al centro.` });
      setShowUserModal(false);
    }
  };

  const handleRejectUser = async (user: FitCenterUserProfile) => {
    try {
      const updatedUserData = {
        membership: {
          ...user.membership!,
          status: "inactive" as const,
        },
        rejectionInfo: {
          rejectedAt: new Date().toISOString(),
          reason: rejectReason,
          rejectedBy: "admin",
        },
      };

      const result = await updateUserById(user.id, updatedUserData);
      if (result) {
        toast({ title: "Alumno rechazado", description: "La solicitud ha sido denegada correctamente.", variant: "destructive" });
        setShowRejectModal(false);
        setRejectReason("");
        setShowUserModal(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Ocurrió un error al procesar el rechazo.", variant: "destructive" });
    }
  };

  const handleApproveRenewal = async (user: any, renewal: any) => {
    try {
      const startDate = customStartDate || new Date().toISOString().split("T")[0];
      const selectedPlan = plans.find((p: any) => p.id === renewal.requestedPlanId);
      const planDuration = selectedPlan?.durationInMonths || 1;
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + planDuration);

      const updatedUserData = {
        membership: {
          ...user.membership!,
          status: "active" as const,
          planId: renewal.requestedPlanId,
          membershipType: selectedPlan?.name || renewal.requestedPlanName,
          monthlyPrice: selectedPlan?.price || user.membership.monthlyPrice,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate.toISOString().split("T")[0],
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
        toast({ title: "Renovación aprobada", description: `Plan ${updatedUserData.membership.membershipType} activado para ${user.firstName}.` });
        setShowRenewalModal(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al procesar la renovación.", variant: "destructive" });
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
        toast({ title: "Renovación rechazada", description: "Se ha notificado al alumno.", variant: "destructive" });
        setShowRejectModal(false);
        setRejectReason("");
        setShowRenewalModal(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Error al procesar el rechazo.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRenewals.length + cancelledClasses.length + pendingUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Renovaciones</CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingRenewals.length}</div>
            <p className="text-xs text-muted-foreground">{pendingRenewals.filter(r => r.daysUntilExpiration <= 7).length} expiran pronto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelaciones</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{cancelledClasses.length}</div>
            <p className="text-xs text-muted-foreground">Clases hoy / futuro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Alumnos</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{pendingUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-end gap-4 p-4 bg-muted/50 rounded-lg">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={notificationFilter} onValueChange={setNotificationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Mostrar Todo</SelectItem>
            <SelectItem value="renovaciones">Solo Renovaciones</SelectItem>
            <SelectItem value="cancelaciones">Solo Cancelaciones</SelectItem>
            <SelectItem value="usuarios">Solo Alumnos</SelectItem>
          </SelectContent>
        </Select>
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
                {[1, 2, 3].map(i => <Card key={i} className="h-40 animate-pulse bg-zinc-50" />)}
              </div>
            ) : pendingRenewals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRenewals.map(r => (
                  <Card key={r.id} className="border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">RENOVACIÓN</Badge>
                        {r.daysUntilExpiration <= 7 && <Badge variant="destructive">URGENTE</Badge>}
                      </div>
                      <h3 className="font-bold text-lg">{r.user.firstName} {r.user.lastName}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {r.daysUntilExpiration < 0 ? "Vencido" : `Vence en ${r.daysUntilExpiration} días`}
                      </p>
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => {
                        setSelectedRenewal(r);
                        setCustomStartDate(new Date().toISOString().split("T")[0]);
                        setShowRenewalModal(true);
                      }}>Gestionar</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50 rounded-lg border border-dashed text-muted-foreground">No hay renovaciones pendientes.</div>
            )}
          </div>
        )}

        {/* 2. CANCELACIONES (Simplificado, sin botón entendido) */}
        {(notificationFilter === "todos" || notificationFilter === "cancelaciones") && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" /> Clases Canceladas
            </h2>
            
            {(storeLoading && cancelledClasses.length === 0) ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : cancelledClasses.length > 0 ? (
              <div className="space-y-4">
                {cancelledClasses.map(cls => (
                  <Card key={cls.id} className="border-l-4 border-red-500 bg-red-50/30">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-red-100 p-2 rounded-full text-red-600"><Clock className="h-5 w-5" /></div>
                      <div>
                        <h3 className="font-bold text-red-900">{cls.name} - CANCELADA</h3>
                        <p className="text-sm text-red-700">
                          {format(new Date(cls.dateTime), "EEEE dd 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50 rounded-lg border border-dashed text-muted-foreground">No hay clases canceladas recientemente.</div>
            )}
          </div>
        )}

        {/* 3. ALUMNOS PENDIENTES */}
        {(notificationFilter === "todos" || notificationFilter === "usuarios") && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" /> Nuevos Alumnos
            </h2>
            
            {(storeLoading && pendingUsers.length === 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map(i => <Card key={i} className="h-32 animate-pulse bg-zinc-50" />)}
              </div>
            ) : pendingUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingUsers.map(p => (
                  <Card key={p.id} className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                      <Badge className="mb-2 bg-blue-50 text-blue-700 border-blue-200">{p.isNew ? "NUEVO" : "RE-INGRESO"}</Badge>
                      <h3 className="font-bold">{p.user.firstName} {p.user.lastName}</h3>
                      <p className="text-xs text-muted-foreground truncate mb-3">{p.user.email}</p>
                      <Button size="sm" variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => { 
                        setSelectedUser(p.user); 
                        setShowUserModal(true); 
                      }}>Validar Alumno</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50 rounded-lg border border-dashed text-muted-foreground">No hay alumnos pendientes de aprobación.</div>
            )}
          </div>
        )}
      </div>

      {/* MODALES */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Validar Nuevo Alumno</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">Información de contacto</Label>
                <p className="font-bold text-lg">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-md border text-sm">
                <p>Plan solicitado: <span className="font-bold">{selectedUser.membership?.membershipType}</span></p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApproveUser(selectedUser)}>Aprobar</Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowRejectModal(true)}>Rechazar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRenewalModal} onOpenChange={setShowRenewalModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Gestionar Renovación</DialogTitle></DialogHeader>
          {selectedRenewal && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-lg border">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Alumno</Label>
                  <p className="font-bold">{selectedRenewal.user.firstName} {selectedRenewal.user.lastName}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
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
                  className="w-full p-2 border rounded-md" 
                  value={customStartDate} 
                  onChange={e => setCustomStartDate(e.target.value)} 
                />
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApproveRenewal(selectedRenewal.user, selectedRenewal.renewal)}>Confirmar Pago y Activar</Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowRejectModal(true)}>Rechazar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Rechazo</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Label>Motivo del rechazo</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Ej: No se confirma transferencia..." />
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={() => selectedUser ? handleRejectUser(selectedUser) : handleRejectRenewal(selectedRenewal.user, selectedRenewal.renewal)}>Confirmar Rechazo</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
