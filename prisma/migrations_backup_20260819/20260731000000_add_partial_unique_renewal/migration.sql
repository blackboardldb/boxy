-- Create partial unique index to prevent concurrent race conditions
CREATE UNIQUE INDEX "membership_renewals_userId_orgId_startDate_active_key"
ON "public"."membership_renewals" ("userId", "organizationId", "startDate")
WHERE status IN ('approved', 'superseded', 'pending', 'scheduled');
