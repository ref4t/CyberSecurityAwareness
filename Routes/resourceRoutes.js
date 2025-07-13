import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import userAuth from "../Middleware/UserAuth.js";
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from "../Controllers/ResourceController.js";

const router = express.Router();

// ✅ Ensure uploads/ directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Multer storage setup with unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

// ✅ (Optional) File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WEBP) are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes

// Public: List all resources
router.get("/", getAllResources);

// Public: Get single resource
router.get("/:id", getResourceById);

// Protected: Create
router.post("/", userAuth, upload.single("image"), createResource);

// Protected: Update
router.put("/:id", userAuth, upload.single("image"), updateResource);

// Protected: Delete
router.delete("/:id", userAuth, deleteResource);

export default router;
