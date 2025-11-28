-- Add JSON permissions map for access control groups
ALTER TABLE "groups"
ADD COLUMN "permissions" JSONB NOT NULL DEFAULT '{}';
