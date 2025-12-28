-- Create indexers table for legend/indexer list
CREATE TABLE "indexers" (
    "id" SERIAL NOT NULL,
    "index" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "indexers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "indexers_index_key" ON "indexers"("index");
