/*
  Warnings:

  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeAvailableFramework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeStudiedFramework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Framework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Employee";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmployeeAvailableFramework";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmployeeStudiedFramework";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Framework";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employee_code" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "furigana" TEXT,
    "email" TEXT,
    "birth_date" DATETIME,
    "gender" TEXT,
    "phone" TEXT,
    "join_date" DATETIME,
    "training_end_date" DATETIME,
    "previous_company1_name" TEXT,
    "previous_company1_start_date" DATETIME,
    "previous_company1_end_date" DATETIME,
    "previous_company2_name" TEXT,
    "previous_company2_start_date" DATETIME,
    "previous_company2_end_date" DATETIME,
    "previous_company3_name" TEXT,
    "previous_company3_start_date" DATETIME,
    "previous_company3_end_date" DATETIME,
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "framework" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "framework_name" TEXT NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "employee_studied_framework" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employee_id" INTEGER NOT NULL,
    "framework_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "employee_studied_framework_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "employee_studied_framework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "framework" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employee_available_framework" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employee_id" INTEGER NOT NULL,
    "framework_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "employee_available_framework_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "employee_available_framework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "framework" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "client_company_name" TEXT,
    "client_address" TEXT,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "min_work_hours" INTEGER,
    "max_work_hours" INTEGER,
    "excess_unit_price" INTEGER,
    "deduction_unit_price" INTEGER,
    "settlement_unit" TEXT,
    "min_price" INTEGER,
    "max_price" INTEGER,
    "work_style" TEXT,
    "nearest_station" TEXT,
    "remarks" TEXT,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "project_framework" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project_id" INTEGER NOT NULL,
    "framework_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "project_framework_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_framework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "framework" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_assignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "contract_price" INTEGER,
    "excess_unit_price" INTEGER,
    "deduction_unit_price" INTEGER,
    "remarks" TEXT,
    "mentor_id" INTEGER,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "project_assignment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_assignment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_assignment_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "framework_framework_name_key" ON "framework"("framework_name");

-- CreateIndex
CREATE UNIQUE INDEX "employee_studied_framework_employee_id_framework_id_key" ON "employee_studied_framework"("employee_id", "framework_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_available_framework_employee_id_framework_id_key" ON "employee_available_framework"("employee_id", "framework_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_framework_project_id_framework_id_key" ON "project_framework"("project_id", "framework_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_assignment_project_id_employee_id_key" ON "project_assignment"("project_id", "employee_id");
