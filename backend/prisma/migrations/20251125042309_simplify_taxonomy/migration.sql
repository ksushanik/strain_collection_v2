/*
  Warnings:

  - You are about to drop the column `other_taxonomy` on the `strains` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "strains" DROP COLUMN "other_taxonomy",
ALTER COLUMN "taxonomy_16s" SET DATA TYPE TEXT;
