-- AlterTable
ALTER TABLE "HomepageSection" ADD COLUMN IF NOT EXISTS "showInNavbar" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "HomepageSection" ADD COLUMN IF NOT EXISTS "navbarName" TEXT;
ALTER TABLE "HomepageSection" ADD COLUMN IF NOT EXISTS "navbarPosition" INTEGER;
