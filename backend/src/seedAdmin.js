import dotenv from "dotenv";
import User from "./models/user.model.js";
import { connectDB, disconnectDB } from "./lib/db.js";
import { hashPassword } from "./lib/password.js";

dotenv.config();

const main = async () => {
  const fullName = (process.env.ADMIN_NAME || "PharmaCart Admin").trim();
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || password.length < 6) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 6 characters) in backend/.env first.");
    process.exit(1);
  }

  try {
    await connectDB();
    const hashedPassword = await hashPassword(password);

    const admin = await User.findOneAndUpdate(
      { email },
      { fullName, email, password: hashedPassword, role: "admin" },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    console.log(`Admin ready: ${admin.email}`);
    await disconnectDB();
  } catch (error) {
    console.error("Could not create admin:", error.message);
    process.exit(1);
  }
};

main();
