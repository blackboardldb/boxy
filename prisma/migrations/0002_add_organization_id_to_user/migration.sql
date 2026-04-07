ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS "organizationId" TEXT NOT NULL DEFAULT 'org_blacksheep_001';

CREATE INDEX IF NOT EXISTS "users_organizationId_idx" 
ON public.users("organizationId");
