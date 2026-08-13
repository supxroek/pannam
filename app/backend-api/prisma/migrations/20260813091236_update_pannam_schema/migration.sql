/*
  Warnings:

  - The values [pending_approval] on the enum `UserVillageStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `is_primary_owner` on the `user_properties` table. All the data in the column will be lost.
  - You are about to drop the column `village_name` on the `villages` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserVillageStatus_new" AS ENUM ('active', 'suspended');
ALTER TABLE "public"."user_villages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "user_villages" ALTER COLUMN "status" TYPE "UserVillageStatus_new" USING ("status"::text::"UserVillageStatus_new");
ALTER TYPE "UserVillageStatus" RENAME TO "UserVillageStatus_old";
ALTER TYPE "UserVillageStatus_new" RENAME TO "UserVillageStatus";
DROP TYPE "public"."UserVillageStatus_old";
ALTER TABLE "user_villages" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user_properties" DROP COLUMN "is_primary_owner",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "villages" DROP COLUMN "village_name",
ADD COLUMN     "district" VARCHAR(100),
ADD COLUMN     "postalCode" VARCHAR(10),
ADD COLUMN     "promptpay_image" VARCHAR(255),
ADD COLUMN     "province" VARCHAR(100),
ADD COLUMN     "subDistrict" VARCHAR(100);
