import User from "../models/user.model.js";
import { genToken, clearToken } from "../lib/genToken.js";
import { hashPassword, verifyPassword } from "../lib/password.js";

const publicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  profilePic: user.profilePic,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const signup = async (req, res) => {
  try {
    const userData = req.userData;
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(userData.password);
    const newUser = await User.create({
      fullName: userData.fullName,
      email: userData.email,
      password: hashedPassword,
    });

    genToken(newUser._id, res);
    return res.status(201).json(publicUser(newUser));
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    genToken(user._id, res);
    return res.status(200).json(publicUser(user));
  } catch (error) {
    console.error("Error in login controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    clearToken(res);
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profilePic = String(req.body?.profilePic || "");
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture not found" });
    }

    const isDataImage = /^data:image\/(png|jpe?g|webp);base64,/i.test(profilePic);
    const isRemoteImage = /^https?:\/\//i.test(profilePic);

    if (!isDataImage && !isRemoteImage) {
      return res.status(400).json({ message: "Profile picture must be an image file or image URL" });
    }

    if (profilePic.length > 2_000_000) {
      return res.status(413).json({ message: "Profile image is too large. Use an image under about 1.5 MB." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  return res.status(200).json(req.user);
};
