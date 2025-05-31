import express from "express";
import cors from "cors";
import helmet from "helmet";               // Add basic security headers
import rateLimit from "express-rate-limit"; // Protect against brute-force
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRouter from "./Routes/AuthRoutes.js";
import connectDB from "./Config/MongoDB.js";
import userRoutes from "./Routes/UserRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ── 1. CONNECT DATABASE ───────────────────────────────────────────────────────
connectDB();

// ── 2. GLOBAL MIDDLEWARE ──────────────────────────────────────────────────────
// Security headers
app.use(helmet());

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
