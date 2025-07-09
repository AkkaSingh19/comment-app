-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "editedUntil" SET DEFAULT now() + interval '15 minutes';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Unnamed User';
