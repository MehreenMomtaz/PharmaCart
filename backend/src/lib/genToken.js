import jwt from "jsonwebtoken";

export const genToken = (userId, res) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in backend/.env");

  const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  return token;
};

export const clearToken = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
};
