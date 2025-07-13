import fs from "fs";
import path from "path";
import Resource from "../Models/resourceModel.js";

/**
 * GET /api/resources
 */
export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email");
    return res.json({ success: true, resources });
  } catch (err) {
    console.error("getAllResources Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/resources/:id
 */
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate("uploadedBy", "name email");
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    return res.json({ success: true, resource });
  } catch (err) {
    console.error("getResourceById Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/resources
 */
export const createResource = async (req, res) => {
  try {
    const { title, description, category, link } = req.body;
    const bodyImageUrl = req.body.imageUrl;

    if (!title || !link) {
      return res.status(400).json({ success: false, message: "Title and link are required" });
    }

    let imageUrl;
    if (req.file?.filename) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (bodyImageUrl && typeof bodyImageUrl === "string") {
      imageUrl = bodyImageUrl.trim();
    } else {
      return res.status(400).json({ success: false, message: "Either upload an image or provide an imageUrl." });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: (description || "").trim(),
      category,
      link: link.trim(),
      imageUrl,
      uploadedBy: req.user.id,
    });

    return res.status(201).json({ success: true, resource });
  } catch (err) {
    console.error("createResource Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/resources/:id
 */
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const isUploader = resource.uploadedBy?.toString() === req.user.id;
    const isAdmin = req.user.role?.toLowerCase() === "admin";
    if (!isUploader && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot edit this resource" });
    }

    const { title, description, category, link } = req.body;
    const bodyImageUrl = req.body.imageUrl;

    if (title !== undefined) resource.title = title.trim();
    if (description !== undefined) resource.description = description.trim();
    if (category !== undefined) resource.category = category;
    if (link !== undefined) resource.link = link.trim();

    // 🧹 Replace uploaded image & remove old file
    if (req.file?.filename) {
      if (resource.imageUrl?.startsWith("/uploads/")) {
        const oldImagePath = path.join("uploads", path.basename(resource.imageUrl));
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn("Image cleanup failed:", err.message);
        });
      }
      resource.imageUrl = `/uploads/${req.file.filename}`;
    } else if (bodyImageUrl && typeof bodyImageUrl === "string") {
      resource.imageUrl = bodyImageUrl.trim();
    }

    await resource.save();
    return res.json({ success: true, resource });
  } catch (err) {
    console.error("updateResource Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /api/resources/:id
 */
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const isUploader = resource.uploadedBy?.toString() === req.user.id;
    const isAdmin = req.user.role?.toLowerCase() === "admin";
    if (!isUploader && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: cannot delete this resource" });
    }

    // 🧹 Delete uploaded image from server
    if (resource.imageUrl?.startsWith("/uploads/")) {
      const imagePath = path.join("uploads", path.basename(resource.imageUrl));
      fs.unlink(imagePath, (err) => {
        if (err) console.warn("Image deletion failed:", err.message);
      });
    }

    await resource.deleteOne();
    return res.json({ success: true, message: "Resource deleted" });
  } catch (err) {
    console.error("deleteResource Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
