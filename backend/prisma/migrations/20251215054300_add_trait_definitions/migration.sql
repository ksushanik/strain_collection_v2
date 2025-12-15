-- CreateEnum
CREATE TYPE "TraitDataType" AS ENUM ('BOOLEAN', 'NUMERIC', 'CATEGORICAL', 'TEXT');

-- AlterTable
ALTER TABLE "strain_phenotypes" ADD COLUMN     "trait_definition_id" INTEGER,
ALTER COLUMN "trait_name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "trait_definitions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "data_type" "TraitDataType" NOT NULL,
    "options" JSONB,
    "units" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trait_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trait_definitions_name_key" ON "trait_definitions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "trait_definitions_code_key" ON "trait_definitions"("code");

-- AddForeignKey
ALTER TABLE "strain_phenotypes" ADD CONSTRAINT "strain_phenotypes_trait_definition_id_fkey" FOREIGN KEY ("trait_definition_id") REFERENCES "trait_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
