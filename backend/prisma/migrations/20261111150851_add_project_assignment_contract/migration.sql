-- CreateTable
CREATE TABLE "project_assignment_contract" (
    "id" SERIAL NOT NULL,
    "project_assignment_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_assignment_contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_assignment_contract_project_assignment_id_idx" ON "project_assignment_contract"("project_assignment_id");

-- AddForeignKey
ALTER TABLE "project_assignment_contract" ADD CONSTRAINT "project_assignment_contract_project_assignment_id_fkey" FOREIGN KEY ("project_assignment_id") REFERENCES "project_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: 既存のcontract_price（単一値）を、適用開始日=アサイン開始日とした履歴の初回エントリとして複製する
INSERT INTO "project_assignment_contract" ("project_assignment_id", "start_date", "unit_price", "updated_at")
SELECT "id", COALESCE("start_date", CURRENT_TIMESTAMP), "contract_price", CURRENT_TIMESTAMP
FROM "project_assignment"
WHERE "contract_price" IS NOT NULL;
