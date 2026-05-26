-- CreateIndex
CREATE INDEX "employee_name_idx" ON "employee"("name");

-- CreateIndex
CREATE INDEX "employee_employee_code_idx" ON "employee"("employee_code");

-- CreateIndex
CREATE INDEX "project_assignment_status_idx" ON "project_assignment"("status");
