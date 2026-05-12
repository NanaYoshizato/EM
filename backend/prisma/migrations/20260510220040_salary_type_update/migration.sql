/*
  Warnings:

  - You are about to alter the column `monthly_estimated_salary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
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
    "monthly_estimated_salary" INTEGER,
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
INSERT INTO "new_Employee" ("basic_pension_number", "birth_date", "city", "create_at", "creater_id", "email", "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship", "employee_id", "employment_insurance_number", "furigana", "gender", "has_children", "has_dependents", "has_spouse", "is_delete", "join_date", "monthly_estimated_salary", "my_number", "name", "phone", "postal_code", "prefecture", "previous_company1_end_date", "previous_company1_name", "previous_company1_start_date", "previous_company2_end_date", "previous_company2_name", "previous_company2_start_date", "previous_company3_end_date", "previous_company3_name", "previous_company3_start_date", "salary_account", "street_address", "training_end_date", "update_at", "updater_id", "user_id", "weekly_work_hours") SELECT "basic_pension_number", "birth_date", "city", "create_at", "creater_id", "email", "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship", "employee_id", "employment_insurance_number", "furigana", "gender", "has_children", "has_dependents", "has_spouse", "is_delete", "join_date", "monthly_estimated_salary", "my_number", "name", "phone", "postal_code", "prefecture", "previous_company1_end_date", "previous_company1_name", "previous_company1_start_date", "previous_company2_end_date", "previous_company2_name", "previous_company2_start_date", "previous_company3_end_date", "previous_company3_name", "previous_company3_start_date", "salary_account", "street_address", "training_end_date", "update_at", "updater_id", "user_id", "weekly_work_hours" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_user_id_key" ON "Employee"("user_id");
CREATE UNIQUE INDEX "Employee_my_number_key" ON "Employee"("my_number");
CREATE INDEX "Employee_user_id_idx" ON "Employee"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
