import mongoose from "mongoose";

const DEFAULT_DB_NAME = "pharmacart";

const collectServerErrors = (reason) => {
  const output = [];
  const servers = reason?.servers;
  if (!servers || typeof servers.values !== "function") return output;

  for (const server of servers.values()) {
    const error = server?.error;
    if (!error) continue;
    output.push({
      address: server.address,
      name: error.name,
      code: error.code,
      message: error.message,
    });
  }
  return output;
};

export const classifyMongoError = (error) => {
  const root = error?.cause || error;
  const message = String(root?.message || error?.message || "Unknown MongoDB connection error");
  const code = root?.code;
  const serverErrors = collectServerErrors(root?.reason);
  const combined = [message, ...serverErrors.map((item) => item.message)].join(" ");

  if (code === 18 || /bad auth|authentication failed|Authentication failed|SCRAM/i.test(combined)) {
    return {
      type: "AUTH",
      message: "MongoDB Atlas authentication failed. Create/reset the Database Access user and put that exact username/password in MONGODB_URI.",
    };
  }

  if (/querySrv|ENOTFOUND|EAI_AGAIN|DNS|SRV/i.test(combined)) {
    return {
      type: "DNS",
      message: "MongoDB Atlas DNS/SRV lookup failed. Re-copy the Drivers connection string and test your DNS/network.",
    };
  }

  if (/CERT|TLS|SSL|certificate/i.test(combined)) {
    return {
      type: "TLS",
      message: "TLS connection to MongoDB Atlas failed. Check system date/time, antivirus HTTPS inspection, VPN/proxy, and network restrictions.",
    };
  }

  if (/ETIMEDOUT|ECONNREFUSED|ECONNRESET|socket|Server selection timed out|Could not connect to any servers/i.test(combined)) {
    return {
      type: "NETWORK",
      message: "MongoDB Atlas could not be reached. Check Atlas Network Access, current public IP/VPN, DNS, firewall, and whether the cluster is running.",
    };
  }

  return { type: "UNKNOWN", message };
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim() || DEFAULT_DB_NAME;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add your MongoDB Atlas connection string to backend/.env");
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI is invalid. It must start with mongodb:// or mongodb+srv://");
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      dbName,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Atlas connected: ${connection.connection.name}`);
    return connection;
  } catch (error) {
    const diagnosis = classifyMongoError(error);
    const wrapped = new Error(`[${diagnosis.type}] ${diagnosis.message}`);
    wrapped.cause = error;
    throw wrapped;
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export const getDatabaseState = () => ({
  readyState: mongoose.connection.readyState,
  connected: mongoose.connection.readyState === 1,
  database: mongoose.connection.name || process.env.MONGODB_DB_NAME || DEFAULT_DB_NAME,
});
