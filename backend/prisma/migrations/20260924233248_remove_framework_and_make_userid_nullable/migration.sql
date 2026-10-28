/*
  Warnings:

  - You are about to drop the `employee_available_framework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employee_studied_framework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `framework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_assignment_framework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_framework` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "employee" DROP CONSTRAINT "employee_user_id_fkey";

-- DropForeignKey
ALTER TABLE "employee_available_framework" DROP CONSTRAINT "employee_available_framework_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "employee_available_framework" DROP CONSTRAINT "employee_available_framework_framework_id_fkey";

-- DropForeignKey
ALTER TABLE "employee_studied_framework" DROP CONSTRAINT "employee_studied_framework_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "employee_studied_framework" DROP CONSTRAINT "employee_studied_framework_framework_id_fkey";

-- DropForeignKey
ALTER TABLE "project_assignment_framework" DROP CONSTRAINT "project_assignment_framework_framework_id_fkey";

-- DropForeignKey
ALTER TABLE "project_assignment_framework" DROP CONSTRAINT "project_assignment_framework_project_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "project_framework" DROP CONSTRAINT "project_framework_framework_id_fkey";

-- DropForeignKey
ALTER TABLE "project_framework" DROP CONSTRAINT "project_framework_project_id_fkey";

-- AlterTable
ALTER TABLE "employee" ALTER COLUMN "user_id" DROP NOT NULL;

-- DropTable
DROP TABLE "employee_available_framework";

-- DropTable
DROP TABLE "employee_studied_framework";

-- DropTable
DROP TABLE "framework";

-- DropTable
DROP TABLE "project_assignment_framework";

-- DropTable
DROP TABLE "project_framework";

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
