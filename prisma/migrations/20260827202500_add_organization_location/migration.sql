-- prisma/migrations/20260827202500_add_organization_location/migration.sql
ALTER TABLE "organizations" ADD COLUMN "country" TEXT DEFAULT 'Chile';
ALTER TABLE "organizations" ADD COLUMN "region" TEXT;
ALTER TABLE "organizations" ADD COLUMN "city" TEXT;
