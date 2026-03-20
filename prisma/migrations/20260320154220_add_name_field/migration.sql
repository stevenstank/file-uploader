-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- Backfill existing users so we can safely enforce NOT NULL
UPDATE "User"
SET "name" = COALESCE(NULLIF(split_part("email", '@', 1), ''), 'User')
WHERE "name" IS NULL;

ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
