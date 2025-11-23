-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role_id" DROP DEFAULT;
