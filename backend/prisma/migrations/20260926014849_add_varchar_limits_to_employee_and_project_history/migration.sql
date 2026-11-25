/*
  Warnings:

  - You are about to alter the column `name` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `furigana` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `previous_company1_name` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `previous_company2_name` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `previous_company3_name` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `weekly_work_hours` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `prefecture` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `city` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `street_address` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `emergency_contact_name` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `emergency_contact_relationship` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `salary_account` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `git_hub` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(39)`.
  - You are about to alter the column `project_name` on the `employee_project_history` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `factory` on the `employee_project_history` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "employee" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "furigana" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "previous_company1_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "previous_company2_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "previous_company3_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "weekly_work_hours" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "prefecture" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "street_address" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "emergency_contact_name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "emergency_contact_relationship" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "salary_account" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "git_hub" SET DATA TYPE VARCHAR(39);

-- AlterTable
ALTER TABLE "employee_project_history" ALTER COLUMN "project_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "factory" SET DATA TYPE VARCHAR(100);
