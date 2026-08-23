import dotenv from "dotenv";
import dns from "node:dns/promises";
import mongoose from "mongoose";
import { classifyMongoError } from "./lib/db.js";

dotenv.config();

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim() || "pharmacart";

const maskUri = (value = "") => value.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@)/, "$1********$2");

const fail = (message) => {
  console.error(`FAIL  ${message}`);
  process.exitCode = 1;
};

console.log("\nPharmaCart MongoDB Atlas diagnostic\n===================================");

if (!uri) {
  fail("MONGODB_URI is missing in backend/.env");
  process.exit();
}

console.log(`URI: ${maskUri(uri)}`);
console.log(`Database: ${dbName}`);

let host = "";
try {
  const parsed = new URL(uri);
  host = parsed.hostname;
  console.log(`Cluster host: ${host}`);
} catch {
  fail("MONGODB_URI is not a valid MongoDB URI.");
  process.exit();
}

if (uri.startsWith("mongodb+srv://")) {
  try {
    const records = await dns.resolveSrv(`_mongodb._tcp.${host}`);
    console.log(`OK    DNS SRV lookup: ${records.length} server record(s) found.`);
    for (const record of records.slice(0, 3)) {
      console.log(`      ${record.name}:${record.port}`);
    }
  } catch (error) {
    fail(`DNS SRV lookup failed: ${error.code || error.name}: ${error.message}`);
    console.error("      Try another network/DNS, turn off VPN, or re-copy the Atlas Drivers URI.");
    process.exit();
  }
}

try {
  console.log("\nConnecting to Atlas...");
  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 45000,
  });
  console.log(`OK    Connected successfully to database: ${mongoose.connection.name}`);
  await mongoose.disconnect();
} catch (error) {
  const diagnosis = classifyMongoError(error);
  console.error(`FAIL  Type: ${diagnosis.type}`);
  console.error(`      ${diagnosis.message}`);
  console.error(`\nRaw error name: ${error.name || "unknown"}`);
  if (error.code) console.error(`Raw error code: ${error.code}`);
  console.error(`Raw error: ${error.message}`);

  const servers = error?.reason?.servers;
  if (servers && typeof servers.values === "function") {
    console.error("\nServer details:");
    for (const server of servers.values()) {
      console.error(`  ${server.address} | ${server.type}`);
      if (server.error) {
        console.error(`    ${server.error.name || "Error"}${server.error.code ? ` (${server.error.code})` : ""}: ${server.error.message}`);
      }
    }
  }

  console.error("\nRecommended order:");
  console.error("1) Atlas -> Network Access: temporarily allow 0.0.0.0/0 for testing, then wait until Active.");
  console.error("2) Atlas -> Database Access: reset/create a database user and update MONGODB_URI.");
  console.error("3) Atlas -> Database -> Connect -> Drivers: copy a fresh Node.js URI.");
  console.error("4) Turn off VPN/proxy and run this diagnostic again.");
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect().catch(() => {});
  }
}
