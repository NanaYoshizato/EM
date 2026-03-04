import { findUserByEmail } from "./repository";
import { User } from "./domain/user";
import { generateToken } from "@/lib/jwt";

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
