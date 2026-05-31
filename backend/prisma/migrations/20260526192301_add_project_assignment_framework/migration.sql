-- CreateTable
CREATE TABLE "project_assignment_framework" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project_assignment_id" INTEGER NOT NULL,
    "framework_id" INTEGER NOT NULL,
    "is_delete" BOOLEAN NOT NULL DEFAULT false,
    "creater_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updater_id" TEXT,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "project_assignment_framework_project_assignment_id_fkey" FOREIGN KEY ("project_assignment_id") REFERENCES "project_assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "project_assignment_framework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "framework" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "project_assignment_framework_project_assignment_id_framework_id_key" ON "project_assignment_framework"("project_assignment_id", "framework_id");
