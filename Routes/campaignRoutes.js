import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import userAuth from "../Middleware/UserAuth.js";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../Controllers/CampaignController.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage with unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

// File filter (optional, only allow images)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes
router.get("/", getAllCampaigns);
router.get("/:id", getCampaignById);
router.post("/", userAuth, upload.single("image"), createCampaign);
router.put("/:id", userAuth, upload.single("image"), updateCampaign);
router.delete("/:id", userAuth, deleteCampaign);

export default router;
