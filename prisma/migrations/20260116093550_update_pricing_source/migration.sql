/*
  Warnings:

  - The values [COLLEGE] on the enum `PricingSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PricingSource_new" AS ENUM ('DEFAULT', 'REFERRAL', 'COUPON');
ALTER TABLE "Subscription" ALTER COLUMN "pricingSource" TYPE "PricingSource_new" USING ("pricingSource"::text::"PricingSource_new");
ALTER TYPE "PricingSource" RENAME TO "PricingSource_old";
ALTER TYPE "PricingSource_new" RENAME TO "PricingSource";
DROP TYPE "public"."PricingSource_old";
COMMIT;
