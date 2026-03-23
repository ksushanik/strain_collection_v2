-- Migration: add-cascades-indexes
-- Adds onDelete: Cascade to child relations of Sample and Strain,
-- adds indexes on filtered columns, and adds unique constraint on StrainPhenotype.

-- DropForeignKey (old constraints without cascade)
ALTER TABLE "sample_photos" DROP CONSTRAINT IF EXISTS "sample_photos_sample_id_fkey";
ALTER TABLE "strains" DROP CONSTRAINT IF EXISTS "strains_sample_id_fkey";
ALTER TABLE "strain_media" DROP CONSTRAINT IF EXISTS "strain_media_strain_id_fkey";
ALTER TABLE "strain_storage" DROP CONSTRAINT IF EXISTS "strain_storage_strain_id_fkey";

-- Deduplicate strain_phenotypes before adding unique constraint
-- Keep only the row with the lowest id for each (strain_id, trait_definition_id) pair
DELETE FROM "strain_phenotypes"
WHERE id NOT IN (
  SELECT MIN(id)
  FROM "strain_phenotypes"
  WHERE trait_definition_id IS NOT NULL
  GROUP BY strain_id, trait_definition_id
)
AND trait_definition_id IS NOT NULL;

-- AddUniqueConstraint on StrainPhenotype
CREATE UNIQUE INDEX IF NOT EXISTS "strain_phenotypes_strain_id_trait_definition_id_key"
  ON "strain_phenotypes"("strain_id", "trait_definition_id")
  WHERE "trait_definition_id" IS NOT NULL;

-- AddIndex on Sample
CREATE INDEX IF NOT EXISTS "samples_collected_at_idx" ON "samples"("collected_at");
CREATE INDEX IF NOT EXISTS "samples_sample_type_id_idx" ON "samples"("sample_type_id");

-- AddIndex on Strain
CREATE INDEX IF NOT EXISTS "strains_sample_id_idx" ON "strains"("sample_id");
CREATE INDEX IF NOT EXISTS "strains_isolation_region_idx" ON "strains"("isolation_region");
CREATE INDEX IF NOT EXISTS "strains_status_idx" ON "strains"("status");
CREATE INDEX IF NOT EXISTS "strains_created_at_idx" ON "strains"("created_at");

-- AddIndex on StrainPhenotype
CREATE INDEX IF NOT EXISTS "strain_phenotypes_strain_id_idx" ON "strain_phenotypes"("strain_id");
CREATE INDEX IF NOT EXISTS "strain_phenotypes_trait_definition_id_idx" ON "strain_phenotypes"("trait_definition_id");

-- AddForeignKey with onDelete: Cascade
ALTER TABLE "sample_photos"
  ADD CONSTRAINT "sample_photos_sample_id_fkey"
  FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "strains"
  ADD CONSTRAINT "strains_sample_id_fkey"
  FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "strain_media"
  ADD CONSTRAINT "strain_media_strain_id_fkey"
  FOREIGN KEY ("strain_id") REFERENCES "strains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "strain_storage"
  ADD CONSTRAINT "strain_storage_strain_id_fkey"
  FOREIGN KEY ("strain_id") REFERENCES "strains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
