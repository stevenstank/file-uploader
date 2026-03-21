-- CreateTable
CREATE TABLE IF NOT EXISTS "ShareLink" (
    "id" TEXT NOT NULL,
    "fileId" TEXT,
    "folderId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ShareLink_fileId_idx" ON "ShareLink"("fileId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ShareLink_folderId_idx" ON "ShareLink"("folderId");

-- AddForeignKey (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ShareLink_folderId_fkey'
  ) THEN
    ALTER TABLE "ShareLink"
      ADD CONSTRAINT "ShareLink_folderId_fkey"
      FOREIGN KEY ("folderId") REFERENCES "Folder"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ShareLink_fileId_fkey'
  ) THEN
    ALTER TABLE "ShareLink"
      ADD CONSTRAINT "ShareLink_fileId_fkey"
      FOREIGN KEY ("fileId") REFERENCES "File"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
