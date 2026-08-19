-- CreateIndex
CREATE INDEX "class_sessions_organizationId_dateTime_idx" ON "public"."class_sessions"("organizationId", "dateTime");
