/*
  Warnings:

  - The values [occupied] on the enum `OfficeStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,payed] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expiryDate` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Maintenance` table. All the data in the column will be lost.
  - You are about to drop the column `officeArea` on the `Office` table. All the data in the column will be lost.
  - You are about to drop the column `rentAmount` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expireDate` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyRent` to the `Rental` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OfficeStatus_new" AS ENUM ('available', 'rented', 'maintenance');
ALTER TABLE "public"."Office" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Office" ALTER COLUMN "status" TYPE "OfficeStatus_new" USING ("status"::text::"OfficeStatus_new");
ALTER TYPE "OfficeStatus" RENAME TO "OfficeStatus_old";
ALTER TYPE "OfficeStatus_new" RENAME TO "OfficeStatus";
DROP TYPE "public"."OfficeStatus_old";
ALTER TABLE "Office" ALTER COLUMN "status" SET DEFAULT 'available';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('paid', 'unpaid', 'overdue');
ALTER TABLE "public"."payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MAINTENANCE';

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_rentalId_fkey";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "expiryDate",
ADD COLUMN     "expireDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Maintenance" DROP COLUMN "startDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'open';

-- AlterTable
ALTER TABLE "Office" DROP COLUMN "officeArea",
ADD COLUMN     "area" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "Rental" DROP COLUMN "rentAmount",
ADD COLUMN     "monthlyRent" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- DropTable
DROP TABLE "public"."payment";

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'unpaid',

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
