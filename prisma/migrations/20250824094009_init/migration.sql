/*
  Warnings:

  - The values [High,Medium,Low] on the enum `DemandLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [Positive,Neutral,Negative] on the enum `MarketOutlook` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DemandLevel_new" AS ENUM ('HIGH', 'MEDIUM', 'LOW');
ALTER TABLE "public"."IndustryInsight" ALTER COLUMN "demandLevel" TYPE "public"."DemandLevel_new" USING ("demandLevel"::text::"public"."DemandLevel_new");
ALTER TYPE "public"."DemandLevel" RENAME TO "DemandLevel_old";
ALTER TYPE "public"."DemandLevel_new" RENAME TO "DemandLevel";
DROP TYPE "public"."DemandLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MarketOutlook_new" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');
ALTER TABLE "public"."IndustryInsight" ALTER COLUMN "marketOutlook" TYPE "public"."MarketOutlook_new" USING ("marketOutlook"::text::"public"."MarketOutlook_new");
ALTER TYPE "public"."MarketOutlook" RENAME TO "MarketOutlook_old";
ALTER TYPE "public"."MarketOutlook_new" RENAME TO "MarketOutlook";
DROP TYPE "public"."MarketOutlook_old";
COMMIT;
