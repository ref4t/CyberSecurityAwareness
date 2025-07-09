// routes/resourceRoutes.js

import express from "express";
import multer from "multer";
import userAuth from "../Middleware/UserAuth.js";
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from "../Controllers/ResourceController.js";

const router = express.Router();

// multer setup: store uploads in ./uploads/ and use original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Public: List all resources
router.get("/", getAllResources);

// Public: Get a single resource by ID
router.get("/:id", getResourceById);

// Protected: Create a new resource (any authenticated user)
router.post("/", userAuth, upload.single("image"), createResource);

// Protected: Update an existing resource (only uploader or admin)
router.put("/:id", userAuth, upload.single("image"), updateResource);

// Protected: Delete a resource (only uploader or admin)
router.delete("/:id", userAuth, deleteResource);

export default router;
