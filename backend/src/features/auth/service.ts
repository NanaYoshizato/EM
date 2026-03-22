import { findUserByEmail, createUser, findUserById } from "./repository";
import { User } from "./domain/user";
import { generateToken, verifyToken } from "@/lib/jwt";

export const loginService = async (email: string, password: string) => {
  const userData = await findUserByEmail(email);
  if (!userData) return null;

  const user = new User(userData);

  const isValid = await user.verifyPassword(password);
  if (!isValid) return null;

  const token = generateToken(user.id);

  return {
    token,
  };
};

export const registerService = async (email: string, password: string) => {
  const existing = await findUserByEmail(email);
  if (existing) return null;

  const userData = await createUser(email, password);
  const token = generateToken(userData.id);

  return { token };
};

export const meService = async (token: string) => {
  const payload = verifyToken(token);
  if (!payload) return null;

  return findUserById(payload.sub);
};
