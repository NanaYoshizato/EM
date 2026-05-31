import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (email: string, password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, password: hashed },
  });
};

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};
