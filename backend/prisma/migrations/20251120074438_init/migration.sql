-- CreateEnum
CREATE TYPE "SampleType" AS ENUM ('PLANT', 'ANIMAL', 'WATER', 'SOIL', 'OTHER');

-- CreateEnum
CREATE TYPE "GramStain" AS ENUM ('POSITIVE', 'NEGATIVE', 'VARIABLE');

-- CreateEnum
CREATE TYPE "Amylase" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "IsolationRegion" AS ENUM ('RHIZOSPHERE', 'ENDOSPHERE', 'PHYLLOSPHERE', 'SOIL', 'OTHER');

-- CreateEnum
CREATE TYPE "CellStatus" AS ENUM ('FREE', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "ProfileKey" AS ENUM ('SAMPLE', 'STRAIN', 'MEDIA', 'STORAGE');

-- CreateTable
CREATE TABLE "samples" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "sample_type" "SampleType" NOT NULL,
    "site_name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "description" TEXT,
    "collected_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "custom_fields" JSONB,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_photos" (
    "id" SERIAL NOT NULL,
    "sample_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sample_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strains" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "sample_id" INTEGER NOT NULL,
    "taxonomy_16s" JSONB,
    "other_taxonomy" TEXT,
    "indexer_initials" TEXT,
    "collection_rcam" TEXT,
    "seq" BOOLEAN NOT NULL DEFAULT false,
    "biochemistry" TEXT,
    "genome" TEXT,
    "antibiotic_activity" TEXT,
    "gram_stain" "GramStain",
    "phosphates" BOOLEAN NOT NULL DEFAULT false,
    "siderophores" BOOLEAN NOT NULL DEFAULT false,
    "pigment_secretion" BOOLEAN NOT NULL DEFAULT false,
    "amylase" "Amylase",
    "isolation_region" "IsolationRegion",
    "iuk" TEXT,
    "features" TEXT,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "custom_fields" JSONB,

    CONSTRAINT "strains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "composition" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strain_media" (
    "strain_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "strain_media_pkey" PRIMARY KEY ("strain_id","media_id")
);

-- CreateTable
CREATE TABLE "storage_boxes" (
    "id" SERIAL NOT NULL,
    "display_name" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "cols" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storage_boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_cells" (
    "id" SERIAL NOT NULL,
    "box_id" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "cell_code" TEXT NOT NULL,
    "status" "CellStatus" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "storage_cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strain_storage" (
    "id" SERIAL NOT NULL,
    "strain_id" INTEGER NOT NULL,
    "cell_id" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strain_storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ui_bindings" (
    "id" SERIAL NOT NULL,
    "menu_label" TEXT NOT NULL,
    "profile_key" "ProfileKey" NOT NULL,
    "route_slug" TEXT NOT NULL,
    "icon" TEXT,
    "enabled_field_packs" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ui_bindings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legend_content" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legend_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "batch_id" TEXT,
    "user_id" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "samples_code_key" ON "samples"("code");

-- CreateIndex
CREATE UNIQUE INDEX "strains_identifier_key" ON "strains"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "media_name_key" ON "media"("name");

-- CreateIndex
CREATE UNIQUE INDEX "storage_cells_box_id_row_col_key" ON "storage_cells"("box_id", "row", "col");

-- CreateIndex
CREATE UNIQUE INDEX "strain_storage_cell_id_key" ON "strain_storage"("cell_id");

-- CreateIndex
CREATE UNIQUE INDEX "ui_bindings_route_slug_key" ON "ui_bindings"("route_slug");

-- AddForeignKey
ALTER TABLE "sample_photos" ADD CONSTRAINT "sample_photos_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strains" ADD CONSTRAINT "strains_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "samples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strain_media" ADD CONSTRAINT "strain_media_strain_id_fkey" FOREIGN KEY ("strain_id") REFERENCES "strains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strain_media" ADD CONSTRAINT "strain_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_cells" ADD CONSTRAINT "storage_cells_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "storage_boxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strain_storage" ADD CONSTRAINT "strain_storage_strain_id_fkey" FOREIGN KEY ("strain_id") REFERENCES "strains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strain_storage" ADD CONSTRAINT "strain_storage_cell_id_fkey" FOREIGN KEY ("cell_id") REFERENCES "storage_cells"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
