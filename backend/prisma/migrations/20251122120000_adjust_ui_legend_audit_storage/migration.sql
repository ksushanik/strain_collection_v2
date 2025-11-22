-- Add new audit actions
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ALLOCATE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'UNALLOCATE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BULK_ALLOCATE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CONFIG';

-- Extend audit log payload
ALTER TABLE "audit_logs"
ADD COLUMN "batch_id" TEXT,
ADD COLUMN "comment" TEXT;

-- Extend UI bindings with ordering and legend link
ALTER TABLE "ui_bindings"
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "legend_id" INTEGER;

ALTER TABLE "ui_bindings"
ADD CONSTRAINT "ui_bindings_legend_id_fkey"
FOREIGN KEY ("legend_id") REFERENCES "legend_content"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Strengthen storage cell uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "storage_cells_box_id_cell_code_key"
ON "storage_cells"("box_id", "cell_code");
