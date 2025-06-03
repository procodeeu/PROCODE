-- AlterTable
ALTER TABLE "users" ADD COLUMN     "preferredModels" TEXT[] DEFAULT ARRAY[]::TEXT[];
