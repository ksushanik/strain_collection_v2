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
