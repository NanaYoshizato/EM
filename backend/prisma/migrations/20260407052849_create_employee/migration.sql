-- CreateTable
CREATE TABLE "Employee" (
    "employee_id" TEXT NOT NULL PRIMARY KEY,
    "birthday" TEXT NOT NULL,
    "gender" TEXT,
    "tel" TEXT,
    "email" TEXT,
    "joining_date" DATETIME,
    "training_end_date" DATETIME,
    "scheduled_working_hours" TEXT,
    "salary" INTEGER,
    "post_code" TEXT,
    "prefectures" TEXT,
    "municipalities" TEXT,
    "building" TEXT,
    "emergency_contact_name" TEXT,
    "relationship" TEXT,
    "emergency_contact_tel" TEXT,
    "is_spouse" BOOLEAN,
    "is_child" BOOLEAN,
    "is_dependents" BOOLEAN,
    "personal_number" TEXT,
    "employment_insurance_number" TEXT,
    "basic_pension_number" TEXT,
    "bank_account" TEXT,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "create_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "update_date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Framework" (
    "framework_id" TEXT NOT NULL PRIMARY KEY,
    "framework_name" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "create_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "update_date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeFramework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "EmployeeFramework_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeeFramework_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework" ("framework_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_personal_number_key" ON "Employee"("personal_number");

-- CreateIndex
CREATE UNIQUE INDEX "Framework_framework_name_key" ON "Framework"("framework_name");
