"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  UserRound,
} from "lucide-react";

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

export default function ConfiguracionPage() {
  const { data, isLoading } = useOrgConfig();
  const org = data?.org;
  const alumnosCount = data?.alumnosCount ?? 0;
  const planLimit = org?.saasPlanLimit ?? 0;
  const usagePercentage = planLimit > 0 ? (alumnosCount / planLimit) * 100 : 0;

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
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Nombre</p>
                  <p className="font-medium">{org?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Tipo</p>
                  <p className="font-medium">
                    {org?.orgType === "HUB"
                      ? "Box / Hub"
                      : org?.orgType === "PERSONAL_TRAINING"
                      ? "Personal Training"
                      : org?.orgType}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Estado</p>
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium border ${
                      STATUS_BADGE[org?.status ?? ""] ?? "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {STATUS_LABEL[org?.status ?? ""] ?? org?.status}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Slug</p>
                  <p className="font-mono text-xs font-medium">{org?.slug}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan y uso */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Plan y Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-1/3 rounded-lg" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Plan Actual</p>
                    <p className="text-2xl font-bold">{org?.saasPlanName || "Sin plan"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-0.5">Ciclo</p>
                    <p className="font-medium text-sm">
                      {org?.billingCycle ? `Ciclo ${org.billingCycle}` : "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
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
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="flex items-start gap-3">
                  <UserRound className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Titular</p>
                    <p className="font-medium">
                      {[org?.ownerName, org?.ownerLastName].filter(Boolean).join(" ") ||
                        "No registrado"}
                    </p>
                    {org?.ownerRut && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        RUT: {org.ownerRut}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                    <p className="font-medium break-all">{org?.email || "No registrado"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Teléfono</p>
                    <p className="font-medium">{org?.phone || "No registrado"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Dirección</p>
                    <p className="font-medium line-clamp-2">{org?.address || "No registrada"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
