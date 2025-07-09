-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "editedUntil" SET DEFAULT now() + interval '15 minutes';
