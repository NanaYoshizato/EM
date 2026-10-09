import { prisma } from "@/lib/prisma";

/** userTableからidを取得する */
export const findUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

/** userTableからemailを取得する */
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/** userTableからfirebaseUidを取得する */
export const findUserByFirebaseUid = async (firebaseUid: string) => {
  return prisma.user.findUnique({
    where: { firebaseUid },
    include: { role: true },
  });
};

export const createUser = async (email: string, firebaseUid: string) => {
  return prisma.user.create({
    data: { email, firebaseUid },
  });
};
