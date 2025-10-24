/*
  Warnings:

  - Added the required column `rentAmount` to the `Office` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_rentalId_fkey";

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "rentAmount" DOUBLE PRECISION NOT NULL;
