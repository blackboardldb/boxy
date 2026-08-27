// components/user-profile.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, ChevronRight, Lock, Bell, Medal, History } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { FitCenterUserProfile } from "@/lib/types";
import { SkeletonUserProfile } from "@/components/ui/skeleton";
import { PhoneInputCL } from "./PhoneInputCL";
import { WhatsAppLink } from "./WhatsAppLink";
import { UserStatsBlock } from "./UserStatsBlock";
import { useUserStats } from "@/lib/hooks/useUserStats";
import {
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_COLORS,
} from "@/lib/types";
import { getPlanStatus } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function UserProfile() {
  const { currentUser, isLoading, reload } = useCurrentUser();

  const [userData, setUserData] = useState<FitCenterUserProfile | null>(null);
  const { data: statsData } = useUserStats(userData?.id ?? "", !!userData?.id);
  const [editableFirstName, setEditableFirstName] = useState("");
  const [editableLastName, setEditableLastName] = useState("");
  const [editablePhone, setEditablePhone] = useState("");
  const [editableGender, setEditableGender] = useState("");
  const [editableDateOfBirth, setEditableDateOfBirth] = useState("");
  const [editableEmergencyContact, setEditableEmergencyContact] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Historial de planes — desplegable + paginación
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Notificaciones Push
  const [permission, setPermission] = useState<NotificationPermission | "unsupported" | "loading">("loading");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("Notification" in window)) {
        setPermission("unsupported");
      } else {
        setPermission(Notification.permission);
      }
    }
  }, []);

  const togglePush = async (checked: boolean) => {
    if (permission === "unsupported") return;

    // Si ya tiene permiso denegado en sistema
    if (permission === "denied" && checked) {
      alert("Las notificaciones están bloqueadas en tu dispositivo. Debes activarlas manualmente desde el menú de Configuración del sistema.");
      setPermission("denied"); // Reforzar estado
      return;
    }

    // Proceso de activación (solo si pasa a true)
    if (checked && permission !== "granted") {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          });

          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription)
          });
        }
      } catch (err) {
        console.error("Error al activar notificaciones:", err);
      }
    }

    // Si desactiva (checked=false)
    if (!checked && permission === "granted") {
      // Simplemente eliminamos suscripción localmente o notificamos borrado al servidor
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          });
          await subscription.unsubscribe();
        }
      } catch (err) {
        console.error("Error al desactivar:", err);
      }
      setPermission("default"); // Resetear visualmente para que vuelva a pedir permiso al activar
    }
  };

  // Sincronizar cuando llegan los datos del usuario real
  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
      setEditableFirstName(currentUser.firstName || "");
      setEditableLastName(currentUser.lastName || "");
      setEditablePhone(currentUser.phone || "");
      setEditableGender(currentUser.gender || "");
      setEditableDateOfBirth(currentUser.dateOfBirth || "");
      setEditableEmergencyContact(currentUser.emergencyContact || "");
    }
  }, [currentUser]);

  // Al montar: fetch eager del historial, sin esperar interacción del usuario
  useEffect(() => {
    if (!userData?.id) return;
    setHistoryLoading(true);
    fetch('/api/me/history?limit=5')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setHistoryItems(json.data ?? []);
          setHistoryCursor(json.nextCursor ?? null);
          setHistoryHasMore(!!json.nextCursor);
        }
      })
      .finally(() => {
        setHistoryLoading(false);
        setHistoryReady(true);
      });
  }, [userData?.id]);

  const saveNameInfo = async () => {
    if (!userData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: editableFirstName, lastName: editableLastName }),
      });
      if (res.ok) {
        const updated = { ...userData, firstName: editableFirstName, lastName: editableLastName };
        setUserData(updated);
        reload();
      }
    } finally {
      setIsSaving(false);
      setExpandedSection(null);
    }
  };

  const saveContactInfo = async () => {
    if (!userData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: editablePhone }),
      });
      if (res.ok) {
        const updated = { ...userData, phone: editablePhone };
        setUserData(updated);
        reload();
      }
    } finally {
      setIsSaving(false);
      setExpandedSection(null);
    }
  };

  const savePersonalInfo = async () => {
    if (!userData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender: editableGender, dateOfBirth: editableDateOfBirth }),
      });
      if (res.ok) {
        const updated = { ...userData, gender: editableGender, dateOfBirth: editableDateOfBirth };
        setUserData(updated);
        reload();
      }
    } finally {
      setIsSaving(false);
      setExpandedSection(null);
    }
  };

  const saveEmergencyContactInfo = async () => {
    if (!userData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyContact: editableEmergencyContact }),
      });
      if (res.ok) {
        const updated = { ...userData, emergencyContact: editableEmergencyContact };
        setUserData(updated);
        reload();
      }
    } finally {
      setIsSaving(false);
      setExpandedSection(null);
    }
  };

  const savePassword = async () => {
    setPasswordMsg(null);
    if (!currentPassword) {
      setPasswordMsg({ ok: false, text: "Debes ingresar tu contraseña actual." });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: "Las contraseñas no coinciden." });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setPasswordMsg({ ok: true, text: "¡Contraseña actualizada correctamente!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setExpandedSection(null);
          setPasswordMsg(null);
        }, 1800);
      } else {
        setPasswordMsg({ ok: false, text: json.error ?? "Error al actualizar." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatMemberSince = (isoDateString: string) => {
    try {
      return format(new Date(isoDateString), "MMMM yyyy", { locale: es });
    } catch {
      return "—";
    }
  };

  const formatDateOfBirth = (isoDateString?: string) => {
    if (!isoDateString) return "No especificado";
    try {
      const parts = isoDateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed in JS
        const day = parseInt(parts[2], 10);
        return format(new Date(year, month, day), "d 'de' MMMM yyyy", { locale: es });
      }
      return format(new Date(isoDateString), "d 'de' MMMM yyyy", { locale: es });
    } catch {
      return isoDateString;
    }
  };

  if (isLoading || !currentUser || !userData) {
    return <SkeletonUserProfile />;
  }

  const gender = userData.gender;
  const dateOfBirth = userData.dateOfBirth;
  const emergencyContact = userData.emergencyContact;

  // Override visual: si el plan está inactivo pero hay renovación scheduled, mostrar como programado
  const rawMembershipStatus = getPlanStatus(userData);
  const scheduledRenewal = userData.membershipRenewals?.find((r: any) => r.status === 'scheduled');
  const hasScheduledRenewal = !!scheduledRenewal;
  const effectiveMembershipStatus =
    rawMembershipStatus === 'inactive' && hasScheduledRenewal ? 'scheduled' : rawMembershipStatus;

  // Si es scheduled, extraer fechas de la renovación para no mostrar las del plan vencido
  const details = scheduledRenewal?.renewalDetails as { startDate?: string; endDate?: string } | undefined;
  const displayStart = effectiveMembershipStatus === 'scheduled' && details?.startDate
    ? details.startDate
    : userData.membership?.currentPeriodStart;
  const displayEnd = effectiveMembershipStatus === 'scheduled' && details?.endDate
    ? details.endDate
    : userData.membership?.currentPeriodEnd;

  return (
    <div>
      <div className="py-6 space-y-6 mx-auto">
        {/* Foto de perfil y cabecera */}
        <div className="overflow-hidden">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-alumno-border shadow-lg">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-yellow-200">
                  {userData.firstName?.[0] ?? "?"}
                  {userData.lastName?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-alumno-text">
                {userData.firstName} {userData.lastName}
              </h2>
              {/* HAL-01 Fase 4 Sprint 3.2: startDate de UserMembership reemplaza centerStats.memberSince del JSONB */}
              {(userData.membership?.startDate ?? userData.membership?.centerStats?.memberSince) && (
                <p className="text-alumno-text-muted">
                  Miembro desde {formatMemberSince(
                    (userData.membership?.startDate ?? userData.membership?.centerStats?.memberSince) as string
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Plan */}
        {userData.membership && (
          <div className="bg-alumno-surface rounded-xl p-4">
            <h3 className="text-lg font-semibold text-alumno-text">
              {userData.membership.membershipType}{" "}

              <span
                className="font-semibold"
                style={{
                  color: MEMBERSHIP_STATUS_COLORS[effectiveMembershipStatus] || "#fff",
                }}
              >
                {MEMBERSHIP_STATUS_LABELS[effectiveMembershipStatus] || "N/A"}
              </span>
            </h3>
            <div className="space-y-2 text-sm mt-4">

              {displayStart && displayEnd && (
                <div className="flex justify-between items-center">
                  <span className="text-alumno-text-muted">Periodo:</span>
                  <span className="text-alumno-text">
                    {format(parseISO(displayStart.substring(0, 10)), "dd MMM yyyy", { locale: es })}
                    {" - "}
                    {format(parseISO(displayEnd.substring(0, 10)), "dd MMM yyyy", { locale: es })}
                  </span>
                </div>
              )}
              {userData.membership.planConfig && (
                <div className="flex justify-between items-center">
                  <span className="text-alumno-text-muted">Clases incluidas:</span>
                  <span className="text-alumno-text">
                    {userData.membership.planConfig.classLimit === 0
                      ? "Ilimitadas"
                      : `${userData.membership.planConfig.classLimit} al mes`}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4 ">
              <p className="text-alumno-text-muted text-sm"> ¿Dudas? Escríbenos </p>
              <WhatsAppLink phone="56987522551" label="Chatear en Whatsapp" />
            </div>
          </div>
        )}

        {/* Historial de planes contratados — desplegable */}
        {(() => {
          // Solo renderizar si el fetch completó y hay datos
          if (!historyReady || historyItems.length === 0) return null;

          const handleOpen = () => {
            setHistoryOpen(!historyOpen);
          };

          const loadMore = async () => {
            if (historyLoading || !historyHasMore) return;
            setHistoryLoading(true);
            try {
              const url = historyCursor
                ? `/api/me/history?limit=5&cursor=${encodeURIComponent(historyCursor)}`
                : '/api/me/history?limit=5';
              const res = await fetch(url);
              const json = await res.json();
              if (json.success) {
                setHistoryItems(prev => [...prev, ...(json.data ?? [])]);
                setHistoryCursor(json.nextCursor ?? null);
                setHistoryHasMore(!!json.nextCursor);
              }
            } finally {
              setHistoryLoading(false);
            }
          };

          // Asegurar orden estricto del más reciente al más antiguo
          const displayItems = [...historyItems].sort((a: any, b: any) => {
            const dateA = new Date(a.startDate || a.requestedAt || a.processedAt || 0).getTime();
            const dateB = new Date(b.startDate || b.requestedAt || b.processedAt || 0).getTime();
            return dateB - dateA; // Orden descendente (más reciente primero)
          });

          const formatShort = (raw: string | Date | null | undefined) => {
            if (!raw) return null;
            try {
              return format(
                typeof raw === "string" ? parseISO(raw.toString().substring(0, 10)) : raw,
                "dd MMM yyyy",
                { locale: es }
              );
            } catch { return null; }
          };

          // (La validación de historyReady ya se hace arriba)

          return (
            <div className="bg-alumno-surface rounded-xl overflow-hidden">
              <button
                id="plan-history-toggle"
                onClick={handleOpen}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-alumno-text-muted" />
                  <span className="text-lg font-semibold text-alumno-text">Historial de planes</span>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-alumno-text-muted transition-transform duration-200 ${
                    historyOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {historyOpen && (
                <div className="px-4 pb-4">
                  {historyLoading && displayItems.length === 0 ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 py-3 border-t border-alumno-border first:border-0 first:pt-0">
                          <div className="w-2 h-2 rounded-full bg-alumno-chip-bg flex-shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-alumno-chip-bg rounded w-1/3 animate-pulse" />
                            <div className="h-2.5 bg-alumno-chip-hover rounded w-1/2 animate-pulse" />
                          </div>
                          <div className="h-3 bg-alumno-chip-bg rounded w-16 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : displayItems.length === 0 ? (
                    <p className="text-alumno-text-subtle text-sm py-2">Sin planes registrados.</p>
                  ) : (
                    <div className="space-y-0">
                      {displayItems.map((renewal: any, idx: number) => {
                        const { planName, amount, startDate, endDate } = renewal;
                        const formattedStart = formatShort(startDate);
                        const formattedEnd = formatShort(endDate);

                        return (
                          <div
                            key={renewal.id ?? idx}
                            className="flex items-start gap-3 py-3 border-t border-alumno-border first:border-0 first:pt-0"
                          >
                            <div className="flex flex-col items-center mt-1.5 flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-alumno-chip-hover" />
                              {idx < displayItems.length - 1 && (
                                <div className="w-px flex-1 min-h-5 bg-alumno-chip-bg/60 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-alumno-text font-medium text-sm">{planName}</p>
                              {(formattedStart || formattedEnd) && (
                                <p className="text-alumno-text-muted text-xs mt-0.5">
                                  {formattedStart ?? "—"}{formattedEnd ? ` › ${formattedEnd}` : ""}
                                </p>
                              )}
                            </div>
                            {amount != null && (
                              <p className="text-alumno-chip-text text-sm font-medium flex-shrink-0 tabular-nums">
                                ${new Intl.NumberFormat("es-CL").format(amount)}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {historyHasMore && (
                        <button
                          id="plan-history-load-more"
                          onClick={loadMore}
                          disabled={historyLoading}
                          className="w-full mt-3 py-2 text-sm text-alumno-text-muted hover:text-alumno-text border border-alumno-border hover:border-alumno-border rounded-lg transition-colors disabled:opacity-50"
                        >
                          {historyLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                              Cargando...
                            </span>
                          ) : (
                            "Cargar más planes"
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Estadísticas — bloque principal (reemplaza al botón y al drawer) */}
        {userData.id && (
          <UserStatsBlock userId={userData.id} />
        )}

        {/* Notificaciones App */}
        {permission !== "unsupported" && (
          <div className="bg-alumno-surface rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">

                <div>
                  <p className="text-lg font-semibold text-alumno-text">Notificaciones App</p>
                  <p className="text-sm text-alumno-text-muted">Recibe avisos de clases y cancelaciones</p>
                </div>
              </div>
              <Switch
                checked={permission === "granted"}
                onCheckedChange={togglePush}
                className="data-[state=checked]:bg-[var(--alumno-primary)] data-[state=unchecked]:bg-alumno-chip-bg"
              />
            </div>
          </div>
        )}
        {/* Secciones editables */}
        {/* BSProfileButton — botones nativos del perfil de usuario */}
        <div className="space-y-4">
          {/* Nombre */}
          <div className="bg-alumno-surface rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-alumno-text">Nombre</h3>
                <p className="text-alumno-text-muted">
                  {userData.firstName} {userData.lastName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "name" ? null : "name")}
                className="text-alumno-text hover:text-alumno-text-muted"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            {expandedSection === "name" && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-alumno-text">Nombre</Label>
                    <Input
                      id="firstName"
                      value={editableFirstName}
                      onChange={(e) => setEditableFirstName(e.target.value)}
                      className="mt-1 bg-white border-zinc-800 text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-alumno-text">Apellido</Label>
                    <Input
                      id="lastName"
                      value={editableLastName}
                      onChange={(e) => setEditableLastName(e.target.value)}
                      className="mt-1 bg-white border-zinc-800 text-black"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveNameInfo}
                    disabled={isSaving}
                    className="bg-[var(--alumno-primary)] hover:bg-[var(--alumno-primary-hover)] text-[var(--alumno-primary-text)] font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setExpandedSection(null)}
                    className="bg-white hover:bg-zinc-100 text-black font-semibold text-sm px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Informacion de Contacto */}
          <div className="bg-alumno-surface rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-alumno-text">Información de Contacto</h3>
                <p className="text-alumno-text-muted">{userData.email}</p>
                {userData.phone && (
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-alumno-text-muted">{userData.phone}</p>

                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "contact" ? null : "contact")}
                className="text-alumno-text hover:text-alumno-text-muted"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            {expandedSection === "contact" && (
              <div className="mt-4 space-y-4">
                {/* Email: solo lectura */}
                <div>
                  <Label htmlFor="email-readonly" className="text-alumno-text">Email</Label>
                  <Input
                    id="email-readonly"
                    type="email"
                    value={userData.email}
                    readOnly
                    disabled
                    className="mt-1 bg-alumno-chip-bg border-zinc-600 text-alumno-text-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-alumno-text-subtle mt-1">El email no puede ser modificado.</p>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-alumno-text">Teléfono</Label>
                  <PhoneInputCL
                    id="phone"
                    value={editablePhone}
                    onChange={setEditablePhone}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveContactInfo}
                    disabled={isSaving}
                    className="bg-[var(--alumno-primary)] hover:bg-[var(--alumno-primary-hover)] text-[var(--alumno-primary-text)] font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setExpandedSection(null)}
                    className="bg-white hover:bg-zinc-100 text-black font-semibold text-sm px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seguridad — cambio de contraseña */}
          <div className="bg-alumno-surface rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-alumno-text">Contraseña</h3>
                <p className="text-alumno-text-muted">Cambiar contraseña</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExpandedSection(expandedSection === "password" ? null : "password");
                  setPasswordMsg(null);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-alumno-text hover:text-alumno-text-muted"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            {expandedSection === "password" && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="current-password" className="text-alumno-text">Contraseña actual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="mt-1 bg-white border-zinc-800 text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password" className="text-alumno-text">Nueva contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="mt-1 bg-white border-zinc-800 text-black"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-alumno-text">Confirmar contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="mt-1 bg-white border-zinc-800 text-black"
                  />
                </div>
                {passwordMsg && (
                  <p className={`text-sm font-medium ${passwordMsg.ok ? "text-zinc-900" : "text-red-400"
                    }`}>
                    {passwordMsg.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={savePassword}
                    disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-[var(--alumno-primary)] hover:bg-[var(--alumno-primary-hover)] text-[var(--alumno-primary-text)] font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    {isSaving ? "Guardando..." : "Cambiar contraseña"}
                  </button>
                  <button
                    onClick={() => { setExpandedSection(null); setPasswordMsg(null); }}
                    className="bg-white hover:bg-zinc-100 text-black font-semibold text-sm px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Información personal */}
          <div className="bg-alumno-surface rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-alumno-text">Información Personal</h3>
                {gender && <p className="text-alumno-text-muted">Género: {gender}</p>}
                {dateOfBirth && (
                  <p className="text-alumno-text-muted">
                    Nacimiento: {formatDateOfBirth(dateOfBirth)}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "personal" ? null : "personal")}
                className="text-alumno-text hover:text-alumno-text-muted"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            {expandedSection === "personal" && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="gender" className="text-alumno-text">Género</Label>
                  <Select value={editableGender} onValueChange={setEditableGender}>
                    <SelectTrigger className="mt-1 bg-white border-zinc-800 text-black">
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-alumno-text">Fecha de nacimiento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editableDateOfBirth}
                    onChange={(e) => setEditableDateOfBirth(e.target.value)}
                    className="mt-1 bg-white border-zinc-800 text-black"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={savePersonalInfo}
                    disabled={isSaving}
                    className="bg-[var(--alumno-primary)] hover:bg-[var(--alumno-primary-hover)] text-[var(--alumno-primary-text)] font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setExpandedSection(null)}
                    className="bg-white hover:bg-zinc-100 text-black font-semibold text-sm px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Contacto de emergencia */}
          <div className="bg-alumno-surface rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-alumno-text">Contacto de Emergencia</h3>
                <p className="text-alumno-text-muted">{emergencyContact}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "emergency" ? null : "emergency")}
                className="text-alumno-text hover:text-alumno-text-muted"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            {expandedSection === "emergency" && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="emergencyContact" className="text-alumno-text">Contacto de emergencia</Label>
                  <Input
                    id="emergencyContact"
                    value={editableEmergencyContact}
                    onChange={(e) => setEditableEmergencyContact(e.target.value)}
                    className="mt-1 bg-white border-zinc-800 text-black"
                    placeholder="Nombre y teléfono"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveEmergencyContactInfo}
                    disabled={isSaving}
                    className="bg-[var(--alumno-primary)] hover:bg-[var(--alumno-primary-hover)] text-[var(--alumno-primary-text)] font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setExpandedSection(null)}
                    className="bg-white hover:bg-zinc-100 text-black font-semibold text-sm px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
