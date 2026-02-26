import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const findUserByEmail = async (email: string) => {
  if (email !== "test@example.com") return null;

  const hashed = await bcrypt.hash("password123", 10);

  //   return {
  //     id: "111111",
  //     email: "test@example.com",
  //     password: hashed,
  //   };
  return prisma.user.findUnique({
    where: { email },
  });
};
