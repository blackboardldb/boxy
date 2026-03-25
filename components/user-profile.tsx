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
import { Edit3, BarChart3, ChevronRight } from "lucide-react";
import { StatsDrawer } from "./stats-drawer";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import type { FitCenterUserProfile } from "@/lib/types";
import { SkeletonUserProfile } from "@/components/ui/skeleton";
import {
  MEMBERSHIP_STATUS_LABELS,
  MEMBERSHIP_STATUS_COLORS,
} from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function UserProfile() {
  const { updateUser } = useBlackSheepStore();
  const { currentUser, isLoading, reload } = useCurrentUser();

  const [userData, setUserData] = useState<FitCenterUserProfile | null>(null);
  const [editableFirstName, setEditableFirstName] = useState("");
  const [editableLastName, setEditableLastName] = useState("");
  const [editablePhone, setEditablePhone] = useState("");
  const [editableGender, setEditableGender] = useState("");
  const [editableDateOfBirth, setEditableDateOfBirth] = useState("");
  const [editableEmergencyContact, setEditableEmergencyContact] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar cuando llegan los datos del usuario real
  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
      setEditableFirstName(currentUser.firstName || "");
      setEditableLastName(currentUser.lastName || "");
      setEditablePhone(currentUser.phone || "");
      setEditableGender((currentUser as any).gender || "");
      setEditableDateOfBirth((currentUser as any).dateOfBirth || "");
      setEditableEmergencyContact((currentUser as any).emergencyContact || "");
    }
  }, [currentUser]);

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
        updateUser(updated);
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
        updateUser(updated);
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
        const updated = { ...userData, gender: editableGender, dateOfBirth: editableDateOfBirth } as any;
        setUserData(updated);
        updateUser(updated);
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
        const updated = { ...userData, emergencyContact: editableEmergencyContact } as any;
        setUserData(updated);
        updateUser(updated);
        reload();
      }
    } finally {
      setIsSaving(false);
      setExpandedSection(null);
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
      return format(new Date(isoDateString), "d 'de' MMMM yyyy", { locale: es });
    } catch {
      return isoDateString;
    }
  };

  if (isLoading || !currentUser || !userData) {
    return <SkeletonUserProfile />;
  }

  const gender = (userData as any).gender;
  const dateOfBirth = (userData as any).dateOfBirth;
  const emergencyContact = (userData as any).emergencyContact;
  const hasPersonalInfo = gender || dateOfBirth;
  const hasEmergencyContact = !!emergencyContact;

  const estimatedTotalHours =
    userData.membership?.centerStats?.lifetimeStats?.totalClasses ?? 0;

  return (
    <div className="min-h-screen">
      <div className="py-6 space-y-6 mx-auto">
        {/* Foto de perfil y cabecera */}
        <div className="overflow-hidden">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage
                  src={`/avatars/${(userData as any).avatarId || "default"}.png`}
                  alt={`${userData.firstName} ${userData.lastName}`}
                />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {userData.firstName?.[0] ?? "?"}
                  {userData.lastName?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-white">
                {userData.firstName} {userData.lastName}
              </h2>
              {userData.membership?.centerStats?.memberSince && (
                <p className="text-zinc-400">
                  Miembro desde {formatMemberSince(userData.membership.centerStats.memberSince)}
                </p>
              )}
            </div>

            {/* Quick Stats
            
            <div className="grid grid-cols-3 gap-4 w-full mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userData.membership?.centerStats?.lifetimeStats?.totalClasses ?? 0}
                </div>
                <div className="text-xs text-zinc-400">Clases</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userData.membership?.centerStats?.currentMonth?.classesAttended ?? 0}
                </div>
                <div className="text-xs text-zinc-400">Este mes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {estimatedTotalHours}h
                </div>
                <div className="text-xs text-zinc-400">Horas</div>
              </div>
            </div>
            
            */}
            
          </div>
        </div>

        {/* Estadísticas - Drawer */}
        <div
          className="p-4 bg-zinc-800 cursor-pointer transition-colors flex items-center justify-between rounded-lg"
          onClick={() => setIsStatsDrawerOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-white">Mis Estadísticas</div>
              <div className="text-sm text-zinc-400">Ver estadísticas detalladas</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-white" />
        </div>

        {/* Plan */}
        {userData.membership && (
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Mi Plan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Plan:</span>
                <span className="font-medium text-white">
                  {userData.membership.membershipType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Estado:</span>
                <span
                  className="font-semibold"
                  style={{
                    color: MEMBERSHIP_STATUS_COLORS[userData.membership.status] || "#fff",
                  }}
                >
                  {MEMBERSHIP_STATUS_LABELS[userData.membership.status] || "N/A"}
                </span>
              </div>
              {userData.membership.currentPeriodStart && userData.membership.currentPeriodEnd && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Periodo:</span>
                  <span className="text-white">
                    {format(new Date(userData.membership.currentPeriodStart), "dd/MM/yy", { locale: es })}
                    {" - "}
                    {format(new Date(userData.membership.currentPeriodEnd), "dd/MM/yy", { locale: es })}
                  </span>
                </div>
              )}
              {userData.membership.planConfig && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Clases del plan:</span>
                  <span className="text-white">
                    {userData.membership.planConfig.classLimit === 0
                      ? "Ilimitadas"
                      : `${userData.membership.planConfig.classLimit} al mes`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secciones editables */}
        <div className="space-y-4">
          {/* Nombre */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Nombre</h3>
                <p className="text-zinc-400">
                  {userData.firstName} {userData.lastName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "name" ? null : "name")}
                className="text-white hover:bg-white/10"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            {expandedSection === "name" && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">Nombre</Label>
                    <Input
                      id="firstName"
                      value={editableFirstName}
                      onChange={(e) => setEditableFirstName(e.target.value)}
                      className="mt-1 bg-zinc-800 border-zinc-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">Apellido</Label>
                    <Input
                      id="lastName"
                      value={editableLastName}
                      onChange={(e) => setEditableLastName(e.target.value)}
                      className="mt-1 bg-zinc-800 border-zinc-600 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveNameInfo} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="outline" onClick={() => setExpandedSection(null)} className="border-zinc-600 text-white hover:bg-zinc-700">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Contacto — email readonly, teléfono editable */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Información de Contacto</h3>
                <p className="text-zinc-400">{userData.email}</p>
                {userData.phone && <p className="text-zinc-400">{userData.phone}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "contact" ? null : "contact")}
                className="text-white hover:bg-white/10"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            {expandedSection === "contact" && (
              <div className="mt-4 space-y-4">
                {/* Email: solo lectura */}
                <div>
                  <Label htmlFor="email-readonly" className="text-white">Email</Label>
                  <Input
                    id="email-readonly"
                    type="email"
                    value={userData.email}
                    readOnly
                    disabled
                    className="mt-1 bg-zinc-700 border-zinc-600 text-zinc-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-500 mt-1">El email no puede ser modificado.</p>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    className="mt-1 bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveContactInfo} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="outline" onClick={() => setExpandedSection(null)} className="border-zinc-600 text-white hover:bg-zinc-700">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Información personal: solo si hay datos o es visible */}
          {hasPersonalInfo && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Información Personal</h3>
                  {gender && <p className="text-zinc-400">Género: {gender}</p>}
                  {dateOfBirth && (
                    <p className="text-zinc-400">
                      Nacimiento: {formatDateOfBirth(dateOfBirth)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSection(expandedSection === "personal" ? null : "personal")}
                  className="text-white hover:bg-white/10"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
              {expandedSection === "personal" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="gender" className="text-white">Género</Label>
                    <Select value={editableGender} onValueChange={setEditableGender}>
                      <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-600 text-white">
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
                    <Label htmlFor="dateOfBirth" className="text-white">Fecha de nacimiento</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editableDateOfBirth}
                      onChange={(e) => setEditableDateOfBirth(e.target.value)}
                      className="mt-1 bg-zinc-800 border-zinc-600 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={savePersonalInfo} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button variant="outline" onClick={() => setExpandedSection(null)} className="border-zinc-600 text-white hover:bg-zinc-700">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contacto de emergencia: solo si existe */}
          {hasEmergencyContact && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Contacto de Emergencia</h3>
                  <p className="text-zinc-400">{emergencyContact}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSection(expandedSection === "emergency" ? null : "emergency")}
                  className="text-white hover:bg-white/10"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
              {expandedSection === "emergency" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="emergencyContact" className="text-white">Contacto de emergencia</Label>
                    <Input
                      id="emergencyContact"
                      value={editableEmergencyContact}
                      onChange={(e) => setEditableEmergencyContact(e.target.value)}
                      className="mt-1 bg-zinc-800 border-zinc-600 text-white"
                      placeholder="Nombre y teléfono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEmergencyContactInfo} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button variant="outline" onClick={() => setExpandedSection(null)} className="border-zinc-600 text-white hover:bg-zinc-700">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <StatsDrawer
        isOpen={isStatsDrawerOpen}
        onClose={() => setIsStatsDrawerOpen(false)}
        userData={userData}
      />
    </div>
  );
}
