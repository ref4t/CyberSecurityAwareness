import userModel from "../Models/UserModel.js";
import Campaign from "../Models/campaignModel.js";
import Blog from "../Models/blogModel.js";

// Get all users (excluding passwords)
export const getAllUsers = async (_req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    console.error("getAllUsers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["general", "business", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.role = role;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    console.error("updateUserRole:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("deleteUser:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all campaigns
export const getAllCampaigns = async (_req, res) => {
  try {
    const campaigns = await Campaign.find().populate("createdBy", "name email");
    res.json({ success: true, campaigns });
  } catch (err) {
    console.error("getAllCampaigns:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all pending campaigns
export const getPendingCampaigns = async (_req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "pending" })
      .populate("createdBy", "name email");
    res.json({ success: true, campaigns });
  } catch (err) {
    console.error("getPendingCampaigns:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Approve a single campaign
export const approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    campaign.status = "active";
    await campaign.save();
    res.json({ success: true, campaign });
  } catch (err) {
    console.error("approveCampaign:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update campaign status
export const updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "active", "archived"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    campaign.status = status;
    await campaign.save();
    res.json({ success: true, campaign });
  } catch (err) {
    console.error("updateCampaignStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all blogs
export const getAllBlogs = async (_req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name email");
    res.json({ success: true, blogs });
  } catch (err) {
    console.error("getAllBlogs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all pending blogs
export const getPendingBlogs = async (_req, res) => {
  try {
    const blogs = await Blog.find({ status: "pending" })
      .populate("author", "name email");
    res.json({ success: true, blogs });
  } catch (err) {
    console.error("getPendingBlogs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Approve a single blog
export const approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    blog.status = "approved";
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    console.error("approveBlog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update blog status
export const updateBlogStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "archived"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    blog.status = status;
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    console.error("updateBlogStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};