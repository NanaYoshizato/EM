-- CreateEnum
CREATE TYPE "Specialty" AS ENUM ('FE', 'BE', 'UNDECIDED');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('ASSIGNED', 'WAITING', 'TRAINING', 'IN_OFFICE', 'CONTRACT_ENDED');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('LANGUAGE', 'LIBRARY', 'FRAMEWORK', 'CLOUD', 'OTHER');

-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "git_hub" TEXT,
ADD COLUMN     "specialty" "Specialty" NOT NULL DEFAULT 'UNDECIDED',
ADD COLUMN     "work_status" "WorkStatus" NOT NULL DEFAULT 'WAITING';

-- CreateTable
CREATE TABLE "skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_skill" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "years" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_project_history" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "project_name" TEXT NOT NULL,
    "factory" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_project_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_project_history_skill" (
    "id" SERIAL NOT NULL,
    "project_history_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_project_history_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_project_contract" (
    "id" SERIAL NOT NULL,
    "project_history_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "unit_price" INTEGER,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_project_contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skill_name_key" ON "skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employee_skill_employee_id_skill_id_key" ON "employee_skill"("employee_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_project_history_skill_project_history_id_skill_id_key" ON "employee_project_history_skill"("project_history_id", "skill_id");

-- AddForeignKey
ALTER TABLE "employee_skill" ADD CONSTRAINT "employee_skill_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skill" ADD CONSTRAINT "employee_skill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_project_history" ADD CONSTRAINT "employee_project_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_project_history_skill" ADD CONSTRAINT "employee_project_history_skill_project_history_id_fkey" FOREIGN KEY ("project_history_id") REFERENCES "employee_project_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_project_history_skill" ADD CONSTRAINT "employee_project_history_skill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_project_contract" ADD CONSTRAINT "employee_project_contract_project_history_id_fkey" FOREIGN KEY ("project_history_id") REFERENCES "employee_project_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
