-- CreateTable
CREATE TABLE "role" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- Seed master data
INSERT INTO "role" ("id", "name", "label", "updated_at") VALUES
  (1, 'admin', '管理者', CURRENT_TIMESTAMP),
  (2, 'employee', '一般社員', CURRENT_TIMESTAMP),
  (3, 'sales', '営業担当', CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role_id" INTEGER NOT NULL DEFAULT 2;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
