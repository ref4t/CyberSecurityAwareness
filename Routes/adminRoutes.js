import express from "express";
import userAuth from "../Middleware/userAuth.js";
import adminOnly from "../Middleware/adminOnly.js";
import {
  getAllUsers,
  deleteUser,
  getAllCampaigns,
  getPendingCampaigns,
  approveCampaign,
  updateCampaignStatus,
  getAllBlogs,
  getPendingBlogs,
  approveBlog,
  updateBlogStatus,
  updateUserRole
} from "../Controllers/AdminController.js";

const router = express.Router();

// User management
router.get("/users", userAuth, adminOnly, getAllUsers);
router.delete("/users/:id", userAuth, adminOnly, deleteUser);
router.put(
  "/users/:id/role",
  userAuth,
  adminOnly,
  updateUserRole
);

// Campaigns listing and status
router.get("/campaigns", userAuth, adminOnly, getAllCampaigns);
router.get(
  "/campaigns/pending",
  userAuth,
  adminOnly,
  getPendingCampaigns
);
router.put(
  "/campaigns/:id/approve",
  userAuth,
  adminOnly,
  approveCampaign
);
router.put(
  "/campaigns/:id/status",
  userAuth,
  adminOnly,
  updateCampaignStatus
);

// Blogs listing and status
router.get("/blogs", userAuth, adminOnly, getAllBlogs);
router.get(
  "/blogs/pending",
  userAuth,
  adminOnly,
  getPendingBlogs
);
router.put(
  "/blogs/:id/approve",
  userAuth,
  adminOnly,
  approveBlog
);
router.put(
  "/blogs/:id/status",
  userAuth,
  adminOnly,
  updateBlogStatus
);

export default router;