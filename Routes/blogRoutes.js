import express from "express";
import userAuth from "../Middleware/userAuth.js";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../Controllers/BlogController.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", userAuth, createBlog);
router.put("/:id", userAuth, updateBlog);
router.delete("/:id", userAuth, deleteBlog);

export default router;
