-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "editedUntil" SET DEFAULT now() + interval '15 minutes';
