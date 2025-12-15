-- CreateEnum
CREATE TYPE "BiosafetyLevel" AS ENUM ('BSL_1', 'BSL_2', 'BSL_3', 'BSL_4');

-- CreateEnum
CREATE TYPE "StrainStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'LOST', 'DESTROYED');

-- CreateEnum
CREATE TYPE "WgsStatus" AS ENUM ('NONE', 'PLANNED', 'SEQUENCED', 'ASSEMBLED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "StockType" AS ENUM ('MASTER', 'WORKING', 'DISTRIBUTION');

-- AlterTable
ALTER TABLE "strain_storage" ADD COLUMN     "parent_strain_id" INTEGER,
ADD COLUMN     "passage_number" INTEGER,
ADD COLUMN     "stock_type" "StockType";

-- AlterTable
ALTER TABLE "strains" ADD COLUMN     "biosafety_level" "BiosafetyLevel",
ADD COLUMN     "isolation_date" TIMESTAMP(3),
ADD COLUMN     "isolator_id" INTEGER,
ADD COLUMN     "ncbi_scientific_name" TEXT,
ADD COLUMN     "ncbi_taxonomy_id" INTEGER,
ADD COLUMN     "status" "StrainStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "strain_phenotypes" (
    "id" SERIAL NOT NULL,
    "strain_id" INTEGER NOT NULL,
    "trait_name" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "method" TEXT,
    "conditions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strain_phenotypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strain_genetics" (
    "id" SERIAL NOT NULL,
    "strain_id" INTEGER NOT NULL,
    "wgs_status" "WgsStatus" NOT NULL DEFAULT 'NONE',
    "sequencing_date" TIMESTAMP(3),
    "assembly_accession" TEXT,
    "raw_data_accession" TEXT,
    "fasta_url" TEXT,

    CONSTRAINT "strain_genetics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "strain_genetics_strain_id_key" ON "strain_genetics"("strain_id");

-- AddForeignKey
ALTER TABLE "strains" ADD CONSTRAINT "strains_isolator_id_fkey" FOREIGN KEY ("isolator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strain_phenotypes" ADD CONSTRAINT "strain_phenotypes_strain_id_fkey" FOREIGN KEY ("strain_id") REFERENCES "strains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strain_genetics" ADD CONSTRAINT "strain_genetics_strain_id_fkey" FOREIGN KEY ("strain_id") REFERENCES "strains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
