import jwt from "jsonwebtoken";

export const generateToken = (userId: number) => {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

export const verifyToken = (token: string): { sub: number } | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: number | string;
    };
    return { sub: Number(decoded.sub) };
  } catch {
    return null;
  }
};
