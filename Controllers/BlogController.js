import Blog from "../Models/blogModel.js";

export const getAllBlogs = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { status: "approved" };
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");
    res.json({ success: true, blogs });
  } catch (err) {
    console.error("getAllBlogs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!blog) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (blog.status !== "approved" && req.query.all !== "true") {
      return res.status(403).json({ success: false, message: "Not approved" });
    }
    res.json({ success: true, blog });
  } catch (err) {
    console.error("getBlogById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required" });
    }
    const blog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl?.trim() || "",
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, blog });
  } catch (err) {
    console.error("createBlog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (blog.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your blog" });
    }
    const { title, content, imageUrl, status } = req.body;
    if (title !== undefined) blog.title = title.trim();
    if (content !== undefined) blog.content = content.trim();
    if (imageUrl !== undefined) blog.imageUrl = imageUrl.trim();
    if (status && req.user.role === "admin") blog.status = status;
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    console.error("updateBlog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (blog.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your blog" });
    }
    await blog.remove();
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    console.error("deleteBlog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
