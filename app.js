import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";               // Add basic security headers
import rateLimit from "express-rate-limit"; // Protect against brute-force
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRouter from "./Routes/AuthRoutes.js";
import connectDB from "./Config/MongoDB.js";
import userRoutes from "./Routes/serRoutes.js";
import resourceRoutes from "./Routes/resourceRoutes.js";
import campaignRoutes from "./Routes/campaignRoutes.js";
import blogRoutes from "./Routes/blogRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// ── 1. CONNECT DATABASE ───────────────────────────────────────────────────────
connectDB();

// ── 2. GLOBAL MIDDLEWARE ──────────────────────────────────────────────────────
// Security headers
app.use(helmet());

// recreate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// serve static files from uploads
app.use("/uploads", express.static(uploadDir));

// Rate limiting (e.g. 100 requests per 15 minutes per IP)
app.use(
  rateLimit({
    windowMs:  60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." },
  })
);

// Body parser (with reasonable size limit)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// CORS (lock down origin in production)
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:4000",
    credentials: true,
  })
);

// ── 3. HEALTHCHECK / BASE ROUTE ────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).send("Hey team");
});

// ── 4. ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/user", userRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);

// ── 5. GLOBAL ERROR HANDLER ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── 6. START SERVER ────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`⚡️ Server running: http://localhost:${PORT}`)
);
