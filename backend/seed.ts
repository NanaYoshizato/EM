import { prisma } from "./src/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const hashed = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      email: "test@example.com",
      password: hashed,
    },
  });

  console.log("User created");
}

main();
