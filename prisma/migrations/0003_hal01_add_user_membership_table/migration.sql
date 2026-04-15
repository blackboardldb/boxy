-- HAL-01 Fase 1: Creación de tabla user_memberships
-- Reemplaza progresivamente el JSONB User.membership con columnas relacionales.
-- Esta migración es NO-DESTRUCTIVA: solo añade tabla y relaciones.
-- El campo membership Json? en users se elimina en Fase 4.

-- Eliminar índice GIN temporal (HAL-02 mitigación) — reemplazado por índices btree en la nueva tabla
DROP INDEX IF EXISTS "idx_users_membership_gin";

-- CreateTable user_memberships
CREATE TABLE "user_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startDate" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "monthlyPrice" DOUBLE PRECISION,
    "membershipType" TEXT,
    "classLimit" INTEGER NOT NULL DEFAULT 0,
    "disciplineAccess" TEXT NOT NULL DEFAULT 'all',
    "allowedDisciplines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canFreeze" BOOLEAN NOT NULL DEFAULT false,
    "freezeDurationDays" INTEGER NOT NULL DEFAULT 0,
    "autoRenews" BOOLEAN NOT NULL DEFAULT false,
    "allowCancellation" BOOLEAN NOT NULL DEFAULT true,
    "cancellationHours" INTEGER NOT NULL DEFAULT 6,
    "maxBookingsPerDay" INTEGER NOT NULL DEFAULT 3,
    "autoWaitlist" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique por userId (1-a-1 por ahora)
CREATE UNIQUE INDEX "user_memberships_userId_key" ON "user_memberships"("userId");

-- CreateIndex: índices btree para filtros frecuentes (reemplaza GIN)
CREATE INDEX "user_memberships_userId_idx" ON "user_memberships"("userId");
CREATE INDEX "user_memberships_organizationId_idx" ON "user_memberships"("organizationId");
CREATE INDEX "user_memberships_status_idx" ON "user_memberships"("status");
CREATE INDEX "user_memberships_currentPeriodEnd_idx" ON "user_memberships"("currentPeriodEnd");

-- AddForeignKey: cascade delete cuando se elimina el usuario
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SET NULL si se elimina el plan (membresía queda huérfana, no se borra)
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
