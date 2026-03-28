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
import { Edit3, ChevronRight, Lock } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);

  // Estados para cambio de contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  const savePassword = async () => {
    setPasswordMsg(null);
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ ok: false, text: "La contraseña debe tener al menos 6 caracteres." });
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
        body: JSON.stringify({ newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setPasswordMsg({ ok: true, text: "¡Contraseña actualizada correctamente!" });
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

  const estimatedTotalHours =
    userData.membership?.centerStats?.lifetimeStats?.totalClasses ?? 0;

  return (
    <div>
      <div className="py-6 space-y-6 mx-auto">
        {/* Foto de perfil y cabecera */}
        <div className="overflow-hidden">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white/10 shadow-lg">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-yellow-200">
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
          </div>
        </div>
        {/* Plan */}
        {userData.membership && (
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white">
                  {userData.membership.membershipType} {" "}
              
                <span
                  className="font-semibold"
                  style={{
                    color: MEMBERSHIP_STATUS_COLORS[userData.membership.status] || "#fff",
                  }}
                >
                  {MEMBERSHIP_STATUS_LABELS[userData.membership.status] || "N/A"}
             </span>
            </h3>
            <div className="space-y-2 text-sm mt-4">
  
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
                  <span className="text-zinc-400">Clases incluidas:</span>
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
        {/* BSProfileButton — botones nativos del perfil de usuario */}
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
                className="text-white hover:bg-white/90"
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
                      className="mt-1 bg-white border-zinc-800 text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">Apellido</Label>
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
                    className="bg-lime-500 hover:bg-lime-400 text-black font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
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
                className="text-white hover:bg-white/90"
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
                    className="mt-1 bg-white border-zinc-800 text-black"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveContactInfo}
                    disabled={isSaving}
                    className="bg-lime-500 hover:bg-lime-400 text-black font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
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
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Contraseña</h3>
                <p className="text-zinc-400">Cambiar contraseña</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setExpandedSection(expandedSection === "password" ? null : "password");
                  setPasswordMsg(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-white hover:bg-white/90"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            {expandedSection === "password" && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-white">Nueva contraseña</Label>
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
                  <Label htmlFor="confirm-password" className="text-white">Confirmar contraseña</Label>
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
                  <p className={`text-sm font-medium ${
                    passwordMsg.ok ? "text-zinc-900" : "text-red-400"
                  }`}>
                    {passwordMsg.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={savePassword}
                    disabled={isSaving || !newPassword || !confirmPassword}
                    className="bg-lime-500 hover:bg-lime-400 text-black font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
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
                  className="text-white hover:bg-white/90"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
              {expandedSection === "personal" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="gender" className="text-white">Género</Label>
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
                    <Label htmlFor="dateOfBirth" className="text-white">Fecha de nacimiento</Label>
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
                      className="bg-lime-500 hover:bg-lime-400 text-black font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
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
                  className="text-white hover:bg-white/90"
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
                      className="mt-1 bg-white border-zinc-800 text-black"
                      placeholder="Nombre y teléfono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEmergencyContactInfo}
                      disabled={isSaving}
                      className="bg-lime-500 hover:bg-lime-400 text-black font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-zinc-900 transition-colors"
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
