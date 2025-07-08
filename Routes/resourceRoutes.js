// routes/resourceRoutes.js

import express from "express";
import userAuth from "../Middleware/userAuth.js";
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from "../Controllers/ResourceController.js";

const router = express.Router();

// Public: List all resources
router.get("/", getAllResources);

// Public: Get a single resource by ID
router.get("/:id", getResourceById);

// Protected: Create a new resource (any authenticated user)
router.post("/", userAuth, createResource);

// Protected: Update an existing resource (only uploader or admin)
router.put("/:id", userAuth, updateResource);

// Protected: Delete a resource (only uploader or admin)
router.delete("/:id", userAuth, deleteResource);

export default router;
