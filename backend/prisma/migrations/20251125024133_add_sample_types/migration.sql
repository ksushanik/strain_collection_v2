-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "samples" ADD COLUMN     "sample_type_id" INTEGER,
ADD COLUMN     "subject" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role_id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "sample_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "sample_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sample_types_slug_key" ON "sample_types"("slug");

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_sample_type_id_fkey" FOREIGN KEY ("sample_type_id") REFERENCES "sample_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
