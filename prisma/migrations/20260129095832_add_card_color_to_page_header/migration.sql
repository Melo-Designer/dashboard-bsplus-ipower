/*
  Warnings:

  - You are about to drop the column `subtitle` on the `PageHeader` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PageHeader" DROP COLUMN "subtitle",
ADD COLUMN     "cardColor" TEXT;
