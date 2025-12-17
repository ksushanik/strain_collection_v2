/*
  Warnings:

  - You are about to drop the column `amylase` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `antibiotic_activity` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `biochemistry` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `genome` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `gram_stain` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `iuk` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `phosphates` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `pigment_secretion` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `seq` on the `strains` table. All the data in the column will be lost.
  - You are about to drop the column `siderophores` on the `strains` table. All the data in the column will be lost.

*/

-- Data migration: preserve legacy strain characteristic columns by copying them into `strain_phenotypes`
-- before dropping legacy columns. At this point in the migration timeline, `strain_phenotypes` already exists.
-- We intentionally store canonical `trait_name` values; later migrations/system traits can link them to definitions.

-- Gram stain (enum -> "+/-/variable")
INSERT INTO "strain_phenotypes" ("strain_id", "trait_name", "result")
SELECT
  s."id",
  'Gram Stain',
  CASE
    WHEN s."gram_stain"::text = 'POSITIVE' THEN '+'
    WHEN s."gram_stain"::text = 'NEGATIVE' THEN '-'
    WHEN s."gram_stain"::text = 'VARIABLE' THEN 'variable'
    ELSE s."gram_stain"::text
  END
FROM "strains" s
WHERE s."gram_stain" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "strain_phenotypes" p
    WHERE p."strain_id" = s."id" AND p."trait_name" = 'Gram Stain'
  );

-- Amylase (enum -> "+/-")
INSERT INTO "strain_phenotypes" ("strain_id", "trait_name", "result")
SELECT
  s."id",
  'Amylase',
  CASE
    WHEN s."amylase"::text = 'POSITIVE' THEN '+'
    WHEN s."amylase"::text = 'NEGATIVE' THEN '-'
    ELSE s."amylase"::text
  END
FROM "strains" s
WHERE s."amylase" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "strain_phenotypes" p
    WHERE p."strain_id" = s."id" AND p."trait_name" = 'Amylase'
  );

-- IUK / IAA (text)
INSERT INTO "strain_phenotypes" ("strain_id", "trait_name", "result")
SELECT s."id", 'IUK / IAA', s."iuk"
FROM "strains" s
WHERE s."iuk" IS NOT NULL AND length(btrim(s."iuk")) > 0
  AND NOT EXISTS (
    SELECT 1 FROM "strain_phenotypes" p
    WHERE p."strain_id" = s."id" AND p."trait_name" = 'IUK / IAA'
  );

-- Antibiotic Activity (text/html)
INSERT INTO "strain_phenotypes" ("strain_id", "trait_name", "result")
SELECT s."id", 'Antibiotic Activity', s."antibiotic_activity"
FROM "strains" s
WHERE s."antibiotic_activity" IS NOT NULL AND length(btrim(s."antibiotic_activity")) > 0
  AND NOT EXISTS (
    SELECT 1 FROM "strain_phenotypes" p
    WHERE p."strain_id" = s."id" AND p."trait_name" = 'Antibiotic Activity'
  );

-- Boolean flags: we persist only the positive signal (`result = 'true'`)
INSERT INTO "strain_phenotypes" ("strain_id", "trait_name", "result")
SELECT s."id", 'Sequenced (SEQ)', 'true'
FROM "strains" s
WHERE s."seq" = true
  AND NOT EXISTS (
    SELECT 1 FROM "strain_phenotypes" p
    WHERE p."strain_id" = s."id" AND p."trait_name" = 'Sequenced (SEQ)'
  );

INSERT INTO "strain_phenotypes" ("strain_id", "trait_name", "result")
SELECT s."id", 'Phosphate Solubilization', 'true'
FROM "strains" s
WHERE s."phosphates" = true
  AND NOT EXISTS (
    SELECT 1 FROM "strain_phenotypes" p
    WHERE p."strain_id" = s."id" AND p."trait_name" = 'Phosphate Solubilization'
  );

INSERT INTO "strain_phenotypes" ("strain_id", "trait_name", "result")
SELECT s."id", 'Siderophore Production', 'true'
FROM "strains" s
WHERE s."siderophores" = true
  AND NOT EXISTS (
    SELECT 1 FROM "strain_phenotypes" p
    WHERE p."strain_id" = s."id" AND p."trait_name" = 'Siderophore Production'
  );

INSERT INTO "strain_phenotypes" ("strain_id", "trait_name", "result")
SELECT s."id", 'Pigment Secretion', 'true'
FROM "strains" s
WHERE s."pigment_secretion" = true
  AND NOT EXISTS (
    SELECT 1 FROM "strain_phenotypes" p
    WHERE p."strain_id" = s."id" AND p."trait_name" = 'Pigment Secretion'
  );

-- AlterTable
ALTER TABLE "strains" DROP COLUMN "amylase",
DROP COLUMN "antibiotic_activity",
DROP COLUMN "biochemistry",
DROP COLUMN "genome",
DROP COLUMN "gram_stain",
DROP COLUMN "iuk",
DROP COLUMN "phosphates",
DROP COLUMN "pigment_secretion",
DROP COLUMN "seq",
DROP COLUMN "siderophores";

-- DropEnum
DROP TYPE "Amylase";

-- DropEnum
DROP TYPE "GramStain";
