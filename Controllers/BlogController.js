// src/Controllers/BlogController.js
import Blog from "../Models/blogModel.js";

// Get all blogs (approved by default, or all if query all=true)
export const getAllBlogs = async (req, res) => {
  try {
    // const filter = req.query.all === "true" ? {} : { status: "approved" };
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate("author", "name email");
    res.json({ success: true, blogs });
  } catch (err) {
    console.error("getAllBlogs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!blog) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    // if (blog.status !== "approved" && req.query.all !== "true") {
    //   return res.status(403).json({ success: false, message: "Not approved" });
    // }
    res.json({ success: true, blog });
  } catch (err) {
    console.error("getBlogById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new blog (with optional image upload)
export const createBlog = async (req, res) => {
  try {
    // multer puts file in req.file
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required" });
    }
    // Determine imageUrl: use uploaded file if present, else any provided URL
    let imageUrl = "";
    if (req.file) {
      // store relative path, client should fetch from /uploads
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl.trim();
    }
    const blog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      imageUrl,
      author: req.user.id,
    });
    res.status(201).json({ success: true, blog });
  } catch (err) {
    console.error("createBlog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update an existing blog (fields and optional image)
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    // only author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your blog" });
    }
    const { title, content, status } = req.body;
    if (title !== undefined) blog.title = title.trim();
    if (content !== undefined) blog.content = content.trim();
    if (req.file) {
      blog.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      blog.imageUrl = req.body.imageUrl.trim();
    }
    // only admin can change status
    if (status && req.user.role === "admin") {
      if (["pending", "approved", "archived"].includes(status)) {
        blog.status = status;
      }
    }
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    console.error("updateBlog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // ✅ Only author or admin can delete
    const isAuthor = blog.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: only author or admin can delete",
      });
    }

    await blog.deleteOne(); // safer than .remove()
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    console.error("deleteBlog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

