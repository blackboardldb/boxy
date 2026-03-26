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

interface Notification {
  id: string;
  type: "pending_user" | "pending_renewal" | "cancelled_class";
  title: string;
  description: string;
  timestamp: Date;
  data?: unknown;
  resolved: boolean;
}

export function Notifications() {
  const { users, classSessions, plans, fetchPlans, updateUserById } =
    useBlackSheepStore() as any;
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<FitCenterUserProfile | null>(
    null
  );
  const [showUserModal, setShowUserModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<any>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    const now = new Date();

    // Usuarios pendientes de aprobación (nuevos registros)
    const pendingUsersList =
      users?.filter((user: any) => user.membership?.status === "pending") || [];

    pendingUsersList.forEach((user: any) => {
      const totalClasses =
        user.membership?.centerStats?.lifetimeStats?.totalClasses;
      const isNewStudent = totalClasses === 0;
      const isReturningStudent = (totalClasses || 0) > 0;

      let title = "Alumno Pendiente";
      let description = `${user.firstName} ${user.lastName} - ${user.email}`;

      if (isNewStudent) {
        title = "Nuevo Alumno Pendiente";
        description += " (Primera vez)";
      } else if (isReturningStudent) {
        title = "Alumno Antiguo Pendiente";
        description += ` (${user.membership?.centerStats?.lifetimeStats?.totalClasses} clases previas)`;
      }

      newNotifications.push({
        id: `pending-user-${user.id}`,
        type: "pending_user",
        title,
        description,
        timestamp: new Date(),
        data: { ...user, isNewStudent, isReturningStudent },
        resolved: false,
      });
    });

    // Usuarios con renovaciones pendientes
    const renewalUsers =
      users?.filter(
        (user: any) =>
          user.membership?.pendingRenewal &&
          user.membership.pendingRenewal.status === "pending"
      ) || [];

    renewalUsers.forEach((user: any) => {
      const renewal = user.membership!.pendingRenewal!;
      const requestDate = renewal.requestDate
        ? new Date(renewal.requestDate)
        : new Date();

      const expirationDate = new Date(user.membership!.currentPeriodEnd);
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const currentPlanId = user.membership!.planId;
      const requestedPlanId = renewal.requestedPlanId;
      const isPlanChange = currentPlanId !== requestedPlanId;

      newNotifications.push({
        id: `pending-renewal-${user.id}`,
        type: "pending_renewal",
        title: "Renovación Pendiente",
        description: `${user.firstName} ${user.lastName} - ${
          isPlanChange ? "Cambio de plan" : "Renovar plan"
        }${daysUntilExpiration <= 7 ? " (Expira pronto)" : ""}`,
        timestamp: requestDate,
        data: { user, renewal, daysUntilExpiration },
        resolved: false,
      });
    });

    // Últimas 3 clases canceladas
    const cancelledClasses = classSessions
      .filter((cls: any) => cls.status === "cancelled")
      .slice(0, 3);
    if (cancelledClasses.length > 0) {
      newNotifications.push({
        id: "cancelled-classes",
        type: "cancelled_class",
        title: "Últimas clases canceladas",
        description: cancelledClasses.map((cls: any) => {
            const date = new Date(cls.dateTime);
            const day = date
              .toLocaleDateString("es-ES", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })
              .toUpperCase();
            const time = date.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return `${day} ${date.getDate()} ${date
              .toLocaleDateString("es-ES", { month: "short" })
              .toUpperCase()} ${date.getFullYear()} - ${time}`;
          })
          .join("\n"),
        timestamp: new Date(),
        data: cancelledClasses,
        resolved: false,
      });
    }

    setNotifications(newNotifications);
    setIsLoading(false);
  };

  const pendingUsers = notifications.filter(
    (n) => n.type === "pending_user" && !n.resolved
  );
  const pendingRenewals = notifications.filter(
    (n) => n.type === "pending_renewal" && !n.resolved
  );
  const otherNotifications = notifications.filter(
    (n) =>
      n.type !== "pending_user" && n.type !== "pending_renewal" && !n.resolved
  );

  // Auto-refresh notifications every 30 seconds to avoid "stale" state
  useEffect(() => {
    const interval = setInterval(() => {
      generateNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [users, classSessions, plans]);

  // Estados para filtros
  const [notificationFilter, setNotificationFilter] = useState("todos");

  useEffect(() => {
    if (plans.length === 0) fetchPlans(1, 100);
    generateNotifications();
  }, [users, classSessions, plans]);

  if (!mounted) return null;


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
      markNotificationAsResolved(`pending-user-${user.id}`);
      toast({ title: "Alumno aprobado", description: `${user.firstName} ${user.lastName} puede inscribir clases` });
      setShowUserModal(false);
    } else {
      toast({ title: "Error", description: "Error al aprobar el alumno", variant: "destructive" });
    }
  };

  const handleRejectUser = async (user: FitCenterUserProfile) => {
    if (!rejectReason.trim()) {
      toast({ title: "Error", description: "Debes proporcionar una razón para el rechazo", variant: "destructive" });
      return;
    }

    const updatedUserData = {
      membership: { ...user.membership!, status: "inactive" as const },
      notes: (user.notes || "") + " - Rejected on " + new Date().toLocaleDateString() + ": " + rejectReason,
      rejectionInfo: { rejectedAt: new Date().toISOString(), reason: rejectReason, rejectedBy: "admin" },
    };

    const result = await updateUserById(user.id, updatedUserData);
    if (result) {
      markNotificationAsResolved(`pending-user-${user.id}`);
      toast({ title: "Alumno rechazado", description: `${user.firstName} ${user.lastName} no fue aprobado`, variant: "destructive" });
      setShowRejectModal(false);
      setRejectReason("");
      setShowUserModal(false);
    } else {
      toast({ title: "Error", description: "Error al rechazar el alumno", variant: "destructive" });
    }
  };

  const handleApproveRenewal = async (user: FitCenterUserProfile, renewal: any) => {
    try {
      const startDate = customStartDate || new Date().toISOString().split("T")[0];
      const planId = renewal.requestedPlanId || user.membership?.planId;
      const targetPlan = plans.find((p: any) => p.id === planId);
      
      if (!targetPlan) {
        toast({ title: "Error", description: "No se encontró la configuración del plan solicitado", variant: "destructive" });
        return;
      }

      const { calcularFechaTerminoMembresia } = await import("@/lib/utils");
      const endDate = calcularFechaTerminoMembresia(startDate, targetPlan.durationInMonths);

      const totalPlanClasses = targetPlan.durationInMonths === 0.5 
        ? Math.ceil(targetPlan.classLimit / 2) 
        : targetPlan.classLimit * targetPlan.durationInMonths;

      const currentPeriodStart = new Date(startDate + "T00:00:00");
      const currentPeriodEnd = new Date(endDate + "T23:59:59");

      const relevantSessions = (classSessions as any[]).filter(session => {
        const isEnrolled = session.registeredUsers?.some((u: any) => u.id === user.id);
        const sessionDate = new Date(session.dateTime);
        return isEnrolled && session.status !== "cancelled" && sessionDate >= currentPeriodStart && sessionDate <= currentPeriodEnd;
      });

      const classesAttended = relevantSessions.length;
      const remainingClasses = targetPlan.classLimit === 0 ? 0 : Math.max(0, totalPlanClasses - classesAttended);

      const currentPlanHistory = {
        planId: user.membership?.planId,
        name: user.membership?.membershipType,
        startDate: user.membership?.currentPeriodStart,
        endDate: user.membership?.currentPeriodEnd,
        price: user.membership?.monthlyPrice,
        status: "completed"
      };

      const updatedUserData = {
        membership: {
          ...user.membership!,
          status: "active" as const,
          planId: targetPlan.id,
          membershipType: targetPlan.name,
          monthlyPrice: targetPlan.price,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          pendingRenewal: undefined,
          centerStats: {
            ...user.membership?.centerStats,
            currentMonth: {
              ...user.membership?.centerStats?.currentMonth,
              classesAttended,
              remainingClasses,
              classLimit: targetPlan.classLimit
            }
          },
          history: [...(user.membership?.history || []), currentPlanHistory]
        },
        ...(renewal.requestedPaymentMethod && { formaDePago: renewal.requestedPaymentMethod }),
        notes: (user.notes || "") + `\n- Renovación aprobada: ${targetPlan.name} desde ${startDate} hasta ${endDate}`,
      };

      const result = await updateUserById(user.id, updatedUserData);
      if (result) {
        markNotificationAsResolved(`pending-renewal-${user.id}`);
        toast({ title: "Renovación aprobada", description: `${user.firstName} ${user.lastName} - Plan ${targetPlan.name} activado` });
        setShowRenewalModal(false);
      } else {
        toast({ title: "Error", description: "Error al actualizar el usuario", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Error crítico al procesar la renovación", variant: "destructive" });
    }
  };

  const handleRejectRenewal = async (user: FitCenterUserProfile, renewal: any) => {
    if (!rejectReason.trim()) {
      toast({ title: "Error", description: "Debes proporcionar una razón para el rechazo", variant: "destructive" });
      return;
    }

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
        markNotificationAsResolved(`pending-renewal-${user.id}`);
        toast({ title: "Renovación rechazada", description: `${user.firstName} ${user.lastName} - Renovación no aprobada`, variant: "destructive" });
        setShowRejectModal(false);
        setRejectReason("");
        setShowRenewalModal(false);
      }
    } catch (error) {
       toast({ title: "Error", description: "Error al procesar el rechazo", variant: "destructive" });
    }
  };

  const markNotificationAsResolved = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, resolved: true }
          : notification
      )
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "pending_user": return <UserCheck className="h-5 w-5 text-blue-500" />;
      case "pending_renewal": return <RefreshCw className="h-5 w-5 text-orange-500" />;
      case "cancelled_class": return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getNotificationBadgeColor = (type: Notification["type"]) => {
    switch (type) {
      case "pending_user": return "default";
      case "pending_renewal": return "secondary";
      case "cancelled_class": return "destructive";
    }
  };

  const getNotificationBadgeText = (type: Notification["type"]) => {
    switch (type) {
      case "pending_user": return "NUEVO";
      case "pending_renewal": return "RENOVACIÓN";
      case "cancelled_class": return "CANCELADA";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notificaciones</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-2xl font-bold">{notifications.filter(n => !n.resolved).length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Pendientes</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-2xl font-bold text-blue-500">{pendingUsers.length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renovaciones Pendientes</CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12 mb-1" /> : (
              <div className="text-2xl font-bold text-orange-500">{pendingRenewals.length}</div>
            )}
            <div className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-3 w-20" /> : (
                <>{pendingRenewals.filter(n => (n.data as any)?.daysUntilExpiration <= 7).length} expiran pronto</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clases Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <div className="text-2xl font-bold text-red-500">{otherNotifications.length}</div>
            )}
            <p className="text-xs text-muted-foreground">Últimas 3 cancelaciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-end gap-4 p-4 bg-muted/50 rounded-lg w-full">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Filtrar por:</Label>
        </div>
        <Select value={notificationFilter} onValueChange={setNotificationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="usuarios">Usuarios</SelectItem>
            <SelectItem value="renovaciones">Renovaciones</SelectItem>
            <SelectItem value="cancelaciones">Cancelaciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skeletons para secciones si carga */}
      {isLoading && (
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-l-4 border-zinc-200">
                  <CardContent className="p-4 space-y-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Usuarios Pendientes */}
          {pendingUsers.length > 0 && (notificationFilter === "todos" || notificationFilter === "usuarios") && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" /> Nuevos Alumnos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingUsers.map(n => {
                  const user = n.data as FitCenterUserProfile;
                  return (
                    <Card key={n.id} className="border-l-4 border-blue-500">
                      <CardContent className="p-4">
                        <div className="flex gap-2 mb-3">
                          {getNotificationIcon(n.type)}
                          <Badge variant={getNotificationBadgeColor(n.type)}>{getNotificationBadgeText(n.type)}</Badge>
                        </div>
                        <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Button size="sm" className="w-full mt-4" onClick={() => { setSelectedUser(user); setShowUserModal(true); }}>Revisar</Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Renovaciones Pendientes */}
          {pendingRenewals.length > 0 && (notificationFilter === "todos" || notificationFilter === "renovaciones") && (
            <div className="space-y-4 pt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-500" /> Renovaciones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRenewals.map(n => {
                  const { user, renewal, daysUntilExpiration } = n.data as any;
                  return (
                    <Card key={n.id} className="border-l-4 border-orange-500">
                      <CardContent className="p-4">
                        <div className="flex gap-2 mb-3">
                          {getNotificationIcon(n.type)}
                          <Badge variant={getNotificationBadgeColor(n.type)}>{getNotificationBadgeText(n.type)}</Badge>
                          {daysUntilExpiration <= 7 && <Badge variant="destructive">URGENTE</Badge>}
                        </div>
                        <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                        <div className="flex justify-between text-sm mt-2">
                           <span>Expira en:</span>
                           <span className={daysUntilExpiration <= 7 ? "text-red-600 font-bold" : "text-green-600"}>{daysUntilExpiration} días</span>
                        </div>
                        <Button size="sm" className="w-full mt-4 bg-orange-600" onClick={() => { 
                          setSelectedRenewal({user, renewal, daysUntilExpiration});
                          setCustomStartDate(new Date().toISOString().split("T")[0]);
                          setShowRenewalModal(true);
                        }}>Revisar</Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clases Canceladas */}
          {otherNotifications.length > 0 && (notificationFilter === "todos" || notificationFilter === "cancelaciones") && (
            <div className="space-y-4 pt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" /> Clases Canceladas
              </h2>
              <div className="space-y-4">
                {otherNotifications.map(n => (
                  <Card key={n.id} className="border-l-4 border-red-500">
                    <CardContent className="p-6 flex justify-between items-center">
                      <div className="flex gap-4">
                        {getNotificationIcon(n.type)}
                        <div>
                          <h3 className="font-semibold">{n.title}</h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{n.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => markNotificationAsResolved(n.id)}>Cerrar</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Revisar Nuevo Alumno</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nombre</Label><p>{selectedUser.firstName} {selectedUser.lastName}</p></div>
                <div><Label>Email</Label><p>{selectedUser.email}</p></div>
                <div><Label>Plan Solicitado</Label><p className="font-bold">{selectedUser.membership?.membershipType}</p></div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-green-600" onClick={() => handleApproveUser(selectedUser)}>Aprobar</Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowRejectModal(true)}>Rechazar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRenewalModal} onOpenChange={setShowRenewalModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Revisar Renovación</DialogTitle></DialogHeader>
          {selectedRenewal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Usuario</Label><p className="font-medium">{selectedRenewal.user.firstName} {selectedRenewal.user.lastName}</p></div>
                <div><Label>Días Expiración</Label><p className={selectedRenewal.daysUntilExpiration <= 7 ? "text-red-600" : ""}>{selectedRenewal.daysUntilExpiration} días</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg bg-orange-50 border-orange-200">
                  <Label>Plan Solicitado</Label>
                  <p className="font-bold">{selectedRenewal.renewal.requestedPlanId || selectedRenewal.user.membership.membershipType}</p>
                  <p className="text-sm">Pago: {selectedRenewal.renewal.requestedPaymentMethod}</p>
                </div>
              </div>
              <div>
                <Label>Fecha de Inicio</Label>
                <input type="date" className="w-full border p-2 rounded mt-2" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-green-600" onClick={() => handleApproveRenewal(selectedRenewal.user, selectedRenewal.renewal)}>Aprobar Renovación</Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowRejectModal(true)}>Rechazar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rechazar Solicitud</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>Razón del rechazo</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Ej: Pago no verificado" />
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
