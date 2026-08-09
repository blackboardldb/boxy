-- Create partial unique index to prevent concurrent race conditions
CREATE UNIQUE INDEX "MembershipRenewal_userId_orgId_startDate_active_key"
ON "MembershipRenewal" ("userId", "organizationId", "startDate")
WHERE status IN ('approved', 'superseded', 'pending', 'scheduled');
