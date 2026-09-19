-- AlterTable
ALTER TABLE "user" DROP COLUMN "password",
ADD COLUMN "firebase_uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_firebase_uid_key" ON "user"("firebase_uid");
