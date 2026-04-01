-- AlterTable
ALTER TABLE "strain_phenotypes" ADD COLUMN     "method_id" INTEGER;

-- CreateIndex
CREATE INDEX "strain_phenotypes_method_id_idx" ON "strain_phenotypes"("method_id");

-- AddForeignKey
ALTER TABLE "strain_phenotypes" ADD CONSTRAINT "strain_phenotypes_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
