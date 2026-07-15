-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('WORKING', 'WAITING', 'TRAINING', 'BEFORE_JOIN', 'LEAVE');

-- CreateEnum
CREATE TYPE "SettlementUnit" AS ENUM ('MIN_1', 'MIN_10', 'MIN_15', 'MIN_30', 'MIN_60');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" SERIAL NOT NULL,
    "employee_code" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "furigana" TEXT,
    "email" TEXT,
    "birth_date" TIMESTAMP(3),
    "gender" "Gender",
    "phone" TEXT,
    "join_date" TIMESTAMP(3),
    "training_end_date" TIMESTAMP(3),
    "previous_company1_name" TEXT,
    "previous_company1_start_date" TIMESTAMP(3),
    "previous_company1_end_date" TIMESTAMP(3),
    "previous_company2_name" TEXT,
    "previous_company2_start_date" TIMESTAMP(3),
    "previous_company2_end_date" TIMESTAMP(3),
    "previous_company3_name" TEXT,
    "previous_company3_start_date" TIMESTAMP(3),
    "previous_company3_end_date" TIMESTAMP(3),
    "weekly_work_hours" TEXT,
    "monthly_estimated_salary" INTEGER,
    "postal_code" TEXT,
    "prefecture" TEXT,
    "city" TEXT,
    "street_address" TEXT,
    "nearest_station" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_relationship" TEXT,
    "emergency_contact_phone" TEXT,
    "has_spouse" BOOLEAN,
    "has_children" BOOLEAN,
    "has_dependents" BOOLEAN,
    "my_number" TEXT,
    "employment_insurance_number" TEXT,
    "basic_pension_number" TEXT,
    "salary_account" TEXT,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "framework" (
    "id" SERIAL NOT NULL,
    "framework_name" TEXT NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_studied_framework" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "framework_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_studied_framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_available_framework" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "framework_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_available_framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "client_company_name" TEXT,
    "client_address" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "min_work_hours" INTEGER,
    "max_work_hours" INTEGER,
    "excess_unit_price" INTEGER,
    "deduction_unit_price" INTEGER,
    "settlement_unit" "SettlementUnit",
    "min_price" INTEGER,
    "max_price" INTEGER,
    "work_style" TEXT,
    "nearest_station" TEXT,
    "remarks" TEXT,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_framework" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "framework_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_assignment" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "status" "EmployeeStatus" NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "contract_price" INTEGER,
    "excess_unit_price" INTEGER,
    "deduction_unit_price" INTEGER,
    "remarks" TEXT,
    "mentor_id" INTEGER,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_assignment_framework" (
    "id" SERIAL NOT NULL,
    "project_assignment_id" INTEGER NOT NULL,
    "framework_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_assignment_framework_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employee_employee_code_key" ON "employee"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "employee_user_id_key" ON "employee"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_my_number_key" ON "employee"("my_number");

-- CreateIndex
CREATE INDEX "employee_name_idx" ON "employee"("name");

-- CreateIndex
CREATE INDEX "employee_employee_code_idx" ON "employee"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "framework_framework_name_key" ON "framework"("framework_name");

-- CreateIndex
CREATE UNIQUE INDEX "employee_studied_framework_employee_id_framework_id_key" ON "employee_studied_framework"("employee_id", "framework_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_available_framework_employee_id_framework_id_key" ON "employee_available_framework"("employee_id", "framework_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_framework_project_id_framework_id_key" ON "project_framework"("project_id", "framework_id");

-- CreateIndex
CREATE INDEX "project_assignment_status_idx" ON "project_assignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_assignment_project_id_employee_id_key" ON "project_assignment"("project_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_assignment_framework_project_assignment_id_framewor_key" ON "project_assignment_framework"("project_assignment_id", "framework_id");

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_studied_framework" ADD CONSTRAINT "employee_studied_framework_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_studied_framework" ADD CONSTRAINT "employee_studied_framework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_available_framework" ADD CONSTRAINT "employee_available_framework_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_available_framework" ADD CONSTRAINT "employee_available_framework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_framework" ADD CONSTRAINT "project_framework_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_framework" ADD CONSTRAINT "project_framework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignment_framework" ADD CONSTRAINT "project_assignment_framework_project_assignment_id_fkey" FOREIGN KEY ("project_assignment_id") REFERENCES "project_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignment_framework" ADD CONSTRAINT "project_assignment_framework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
