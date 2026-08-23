import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routers/auth.router.js";
import medicineRouter from "./routers/medicine.router.js";
import adminRouter from "./routers/admin.router.js";
import orderRouter from "./routers/order.router.js";
import reviewRouter from "./routers/review.router.js";
import blogRouter from "./routers/blog.router.js";
import contactRouter from "./routers/contact.router.js";
import { connectDB, getDatabaseState } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsMiddleware = cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  });

app.use((req, res, next) => {
  if (req.path.startsWith("/api/orders/payment/sslcommerz/")) return next();
  return corsMiddleware(req, res, next);
});
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.get("/api/health", (req, res) => {
  const database = getDatabaseState();
  res.status(200).json({
    success: true,
    message: "PharmaCart API is running",
    database: database.connected ? "connected" : "disconnected",
    databaseName: database.database,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/blogs", blogRouter);
// Public contact messages are delivered through the server-side Brevo integration.
app.use("/api/contact", contactRouter);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((error, req, res, next) => {
  if (error?.message?.startsWith("CORS blocked origin:")) {
    return res.status(403).json({ message: error.message });
  }
  console.error("Unhandled server error:", error?.message || error);
  return res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`PharmaCart backend: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("\nFailed to start PharmaCart backend.");
    console.error(error.message);
    console.error("Run `npm run check` for a focused setup test.\n");
    process.exit(1);
  }
};

startServer();
