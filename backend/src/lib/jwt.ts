import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};
