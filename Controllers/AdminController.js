import userModel from "../Models/UserModel.js";
import Campaign from "../Models/campaignModel.js";
import Blog from "../Models/blogModel.js";

export const getAllUsers = async (_req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    console.error("getAllUsers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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

export const approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    campaign.status = "active";
    await campaign.save();
    res.json({ success: true, campaign });
  } catch (err) {
    console.error("approveCampaign:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    blog.status = "approved";
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    console.error("approveBlog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
