import { defineConfig } from "prisma/config";

export default defineConfig({
  migrate: {
    datasource: {
      url: "file:./dev.db",
    },
  },
});
