import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

// Import routes
import authRouter from "./Routes/AuthRoutes.js";
import connectDB from "./Config/MongoDB.js";
import userRoutes from "./Routes/UserRoutes.js";
import resourceRoutes from "./Routes/resourceRoutes.js";
import campaignRoutes from "./Routes/campaignRoutes.js";
import blogRoutes from "./Routes/blogRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";

// Init app and define port
const app = express();
const PORT = process.env.PORT || 3000;

// Recreate __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 1. CONNECT DATABASE ─────────────────────────────────────
connectDB();

// ── 2. CREATE UPLOADS FOLDER IF MISSING ─────────────────────
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── 3. MIDDLEWARE ───────────────────────────────────────────

// CORS config
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  "https://cyber-awareness-frontend.onrender.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Apply general CORS for APIs
app.use(cors(corsOptions));

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "http://localhost:5173", "http://localhost:3000", "https://cyber-awareness-frontend.onrender.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: false, // Allow cross-origin image loading
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." },
  })
);

// JSON and form parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// ── 4. STATIC FILES ──────────────────────────────────────────

// Serve /uploads with proper CORS headers
app.use(
  "/uploads",
  cors(corsOptions), // allow cross-origin image access
  express.static(path.join(__dirname, "uploads"))
);

// ── 5. ROUTES ────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).send("Hey team");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);

// ── 6. ERROR HANDLING ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── 7. START SERVER ─────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`⚡️ Server running: http://localhost:${PORT}`)
);
