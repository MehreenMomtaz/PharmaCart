import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./lib/db.js";

dotenv.config();

const checks = [];
const addCheck = (name, ok, detail) => checks.push({ name, ok, detail });

const uri = process.env.MONGODB_URI?.trim();
const jwtSecret = process.env.JWT_SECRET?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim() || "pharmacart";
const clientUrl = process.env.CLIENT_URL?.trim() || "http://localhost:5173";

addCheck("MONGODB_URI", Boolean(uri && /^(mongodb|mongodb\+srv):\/\//.test(uri)), uri ? "set" : "missing");
addCheck("MONGODB_DB_NAME", Boolean(dbName), dbName);
addCheck("JWT_SECRET", Boolean(jwtSecret && jwtSecret.length >= 16), jwtSecret ? "set" : "missing");
addCheck("CLIENT_URL", Boolean(clientUrl), clientUrl);

console.log("\nPharmaCart setup check\n----------------------");
for (const check of checks) {
  console.log(`${check.ok ? "OK" : "FAIL"}  ${check.name}: ${check.detail}`);
}

if (checks.some((check) => !check.ok)) {
  console.error("\nFix the failed values in backend/.env, then run `npm run check` again.");
  process.exit(1);
}

try {
  console.log("\nTesting MongoDB Atlas connection...");
  await connectDB();
  console.log("OK  MongoDB Atlas connection successful.");
  await disconnectDB();
  process.exit(0);
} catch (error) {
  console.error(`FAIL  ${error.message}`);
  console.error("\nAtlas-side checks: Database Access user, Network Access IP, and Drivers connection string.");
  process.exit(1);
}
