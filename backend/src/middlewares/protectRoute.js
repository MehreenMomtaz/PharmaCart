import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in backend/.env");
      return res.status(500).json({ message: "Server authentication is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found. Please login again." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }

    console.error("Error in protect middleware:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
