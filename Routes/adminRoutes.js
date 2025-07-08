import express from "express";
import userAuth from "../Middleware/userAuth.js";
import adminOnly from "../Middleware/adminOnly.js";
import {
  getAllUsers,
  deleteUser,
  approveCampaign,
  approveBlog,
} from "../Controllers/AdminController.js";

const router = express.Router();

router.get("/users", userAuth, adminOnly, getAllUsers);
router.delete("/users/:id", userAuth, adminOnly, deleteUser);
router.put("/campaigns/:id/approve", userAuth, adminOnly, approveCampaign);
router.put("/blogs/:id/approve", userAuth, adminOnly, approveBlog);

export default router;
