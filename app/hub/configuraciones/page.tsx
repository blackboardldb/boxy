"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  UserRound,
  Copy,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type OrgConfig = {
  name: string;
  slug: string;
  status: string;
  orgType: string;
  saasPlanName: string | null;
  saasPlanLimit: number | null;
  billingCycle: string | null;
  billingPeriodEnd: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  ownerName: string | null;
  ownerLastName: string | null;
  ownerRut: string | null;
};

function useOrgConfig() {
  return useQuery({
    queryKey: ["admin", "org-config"],
    queryFn: () =>
      fetchClient<{ org: OrgConfig; alumnosCount: number }>("/admin/org-config"),
    staleTime: 1000 * 60 * 10,
  });
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  TRIAL: "bg-amber-100 text-amber-700 border-amber-200",
  SUSPENDED: "bg-red-100 text-red-700 border-red-200",
  CANCELED: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  TRIAL: "Trial",
  SUSPENDED: "Suspendido",
  CANCELED: "Cancelado",
};

function CopyInput({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5 mt-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 bg-muted rounded-md text-xs truncate border border-border/50 text-muted-foreground">
          {value}
        </div>
        <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

export default function ConfiguracionPage() {
  const { data, isLoading } = useOrgConfig();
  const org = data?.org;
  const alumnosCount = data?.alumnosCount ?? 0;
  const planLimit = org?.saasPlanLimit ?? 0;
  const usagePercentage = planLimit > 0 ? (alumnosCount / planLimit) * 100 : 0;

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="p-4 pt-8 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Centro</h1>
        <p className="text-muted-foreground mt-1">
          Información general y estado de la cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos Generales */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Datos del Centro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-full rounded-lg" />
              </div>
            ) : (
              <div className="flex flex-col space-y-4 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Nombre</span>
                  <span className="font-medium text-right">{org?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium text-right">
                    {org?.orgType === "HUB"
                      ? "Box / Hub"
                      : org?.orgType === "PERSONAL_TRAINING"
                      ? "Personal Training"
                      : org?.orgType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Estado</span>
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium border ${
                      STATUS_BADGE[org?.status ?? ""] ?? "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {STATUS_LABEL[org?.status ?? ""] ?? org?.status}
                  </span>
                </div>

                <div className="pt-2">
                  <CopyInput 
                    label="URL de ingreso (Administradores / Staff)" 
                    value={`${origin}/login`} 
                  />
                  <CopyInput 
                    label="URL de ingreso (Alumnos)" 
                    value={`${origin}/${org?.slug}`} 
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan y uso */}
        <Card className="rounded-xl shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium border ${
                  STATUS_BADGE[org?.status ?? ""] ?? "bg-zinc-100 text-zinc-600"
                }`}
              >
                {STATUS_LABEL[org?.status ?? ""] ?? org?.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-1/3 rounded-lg" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="flex flex-col space-y-4 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Plan Actual</span>
                    <span className="font-bold text-base text-right">
                      {org?.saasPlanName || "Sin plan"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Ciclo</span>
                    <span className="font-medium text-right">
                      {org?.billingCycle ? `Ciclo ${org.billingCycle}` : "—"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mt-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Alumnos</span>
                    <span className="font-medium">
                      {alumnosCount} / {planLimit || "∞"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercentage > 90 ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {planLimit
                      ? `${Math.round(usagePercentage)}% del límite del plan`
                      : "Sin límite configurado"}
                  </p>
                </div>

                {org?.billingPeriodEnd && (
                  <p className="text-xs text-muted-foreground pt-2 text-right">
                    Período actual hasta:{" "}
                    <span className="font-medium text-foreground">
                      {new Date(org.billingPeriodEnd).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card className="rounded-xl shadow-sm md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              Contacto y Propietario
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserRound className="h-4 w-4 shrink-0" />
                    <span>Titular</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {[org?.ownerName, org?.ownerLastName].filter(Boolean).join(" ") ||
                        "No registrado"}
                    </p>
                    {org?.ownerRut && (
                      <p className="text-xs text-muted-foreground">RUT: {org.ownerRut}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>Email</span>
                  </div>
                  <span className="font-medium text-right break-all">
                    {org?.email || "No registrado"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>Teléfono</span>
                  </div>
                  <span className="font-medium text-right">
                    {org?.phone || "No registrado"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>Dirección</span>
                  </div>
                  <span className="font-medium text-right line-clamp-2 max-w-[60%] text-balance">
                    {org?.address || "No registrada"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
