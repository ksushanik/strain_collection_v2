-- CreateTable
CREATE TABLE "strain_photos" (
    "id" SERIAL NOT NULL,
    "strain_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strain_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "strain_photos" ADD CONSTRAINT "strain_photos_strain_id_fkey" FOREIGN KEY ("strain_id") REFERENCES "strains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
