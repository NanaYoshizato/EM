import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

export const verifyToken = (token: string): { sub: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
  } catch {
    return null;
  }
};
