/*
  Warnings:

  - You are about to drop the `EmployeeFramework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `bank_account` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `building` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `create_date` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact_tel` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `isDelete` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `is_child` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `is_dependents` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `is_spouse` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `joining_date` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `municipalities` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `personal_number` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `post_code` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `prefectures` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `relationship` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_working_hours` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `tel` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `update_date` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `create_date` on the `Framework` table. All the data in the column will be lost.
  - You are about to drop the column `update_date` on the `Framework` table. All the data in the column will be lost.
  - Added the required column `birth_date` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `furigana` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updateAt` to the `Framework` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmployeeFramework";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "EmployeeStudiedFramework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    CONSTRAINT "EmployeeStudiedFramework_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeeStudiedFramework_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework" ("framework_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeAvailableFramework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    CONSTRAINT "EmployeeAvailableFramework_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeeAvailableFramework_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework" ("framework_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "employee_id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "furigana" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birth_date" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
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
    "monthly_estimated_salary" TEXT,
    "postal_code" TEXT,
    "prefecture" TEXT,
    "city" TEXT,
    "street_address" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_relationship" TEXT,
    "emergency_contact_phone" TEXT,
    "has_spouse" TEXT,
    "has_children" TEXT,
    "has_dependents" TEXT,
    "my_number" TEXT,
    "employment_insurance_number" TEXT,
    "basic_pension_number" TEXT,
    "salary_account" TEXT,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "update_at" DATETIME NOT NULL,
    CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("basic_pension_number", "creater_id", "email", "emergency_contact_name", "employee_id", "employment_insurance_number", "gender", "training_end_date", "updater_id") SELECT "basic_pension_number", "creater_id", "email", "emergency_contact_name", "employee_id", "employment_insurance_number", "gender", "training_end_date", "updater_id" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_user_id_key" ON "Employee"("user_id");
CREATE UNIQUE INDEX "Employee_my_number_key" ON "Employee"("my_number");
CREATE INDEX "Employee_user_id_idx" ON "Employee"("user_id");
CREATE TABLE "new_Framework" (
    "framework_id" TEXT NOT NULL PRIMARY KEY,
    "framework_name" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updateAt" DATETIME NOT NULL
);
INSERT INTO "new_Framework" ("creater_id", "framework_id", "framework_name", "isDelete", "updater_id") SELECT "creater_id", "framework_id", "framework_name", "isDelete", "updater_id" FROM "Framework";
DROP TABLE "Framework";
ALTER TABLE "new_Framework" RENAME TO "Framework";
CREATE UNIQUE INDEX "Framework_framework_name_key" ON "Framework"("framework_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeStudiedFramework_employeeId_frameworkId_key" ON "EmployeeStudiedFramework"("employeeId", "frameworkId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAvailableFramework_employeeId_frameworkId_key" ON "EmployeeAvailableFramework"("employeeId", "frameworkId");
