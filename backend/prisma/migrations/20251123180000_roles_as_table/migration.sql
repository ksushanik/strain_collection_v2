-- Create roles table (editable roles with permissions)
CREATE TABLE "roles" (
    "id" SERIAL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add FK column to users
ALTER TABLE "users" ADD COLUMN "role_id" INTEGER;

-- Seed base roles
INSERT INTO "roles" ("key", "name", "description", "permissions")
VALUES
  ('ADMIN', 'Администратор', 'Полный доступ', '{"all":["manage"]}'),
  ('MANAGER', 'Менеджер', 'CRUD доменов + чтение настроек/легенды', '{"Strain":["read","create","update","delete"],"Sample":["read","create","update","delete"],"Storage":["read","create","update","delete"],"Photo":["read","create","update","delete"],"Media":["read","create","update","delete"],"Settings":["read"],"Legend":["read"],"Analytics":["read"],"User":["read"],"Group":["read"]}'),
  ('USER', 'Пользователь', 'Чтение основных разделов + ограниченный CRUD штаммов/проб/фото', '{"Strain":["read","create","update"],"Sample":["read","create","update"],"Photo":["read","create","update"],"Storage":["read"],"Media":["read"],"Analytics":["read"],"Legend":["read"],"Settings":["read"]}');

-- Map existing enum-based roles to new FK
UPDATE "users" u
SET "role_id" = r.id
FROM "roles" r
WHERE r.key = u."role"::text;

-- Default missing to USER
UPDATE "users"
SET "role_id" = (SELECT id FROM "roles" WHERE key = 'USER')
WHERE "role_id" IS NULL;

-- Make column required and set default to USER (id=3 by insertion order)
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role_id" SET DEFAULT 3;

-- Add FK constraint
ALTER TABLE "users"
  ADD CONSTRAINT "users_role_id_fkey"
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old enum column and type
ALTER TABLE "users" DROP COLUMN "role";
DROP TYPE IF EXISTS "Role";
