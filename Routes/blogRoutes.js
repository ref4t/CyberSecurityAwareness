import express from "express";
import multer from "multer";
import userAuth from "../Middleware/UserAuth.js";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../Controllers/BlogController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", userAuth, upload.single("image"), createBlog);
router.put("/:id", userAuth,upload.single("image"), updateBlog);
router.delete("/:id", userAuth, deleteBlog);

export default router;
