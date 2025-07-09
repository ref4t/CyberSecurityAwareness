// controllers/resourceController.js

import Resource from "../Models/resourceModel.js";
import userModel from "../Models/UserModel.js";

/**
 * GET /api/resources
 * Public: List all resources
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
 * Public: Get a single resource by ID
 */
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "uploadedBy",
      "name email"
    );
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }
    return res.json({ success: true, resource });
  } catch (err) {
    console.error("getResourceById Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/resources
 * Protected: Create a new resource
 */
export const createResource = async (req, res) => {
  try {
    const { title, description, category, link, imageUrl } = req.body;

    if (!title || !link) {
      return res
        .status(400)
        .json({ success: false, message: "Title and link are required" });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: (description || "").trim(),
      category,
      link: link.trim(),
      imageUrl: imageUrl?.trim() || "",
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
 * Protected: Update a resource (uploader or admin only)
 */
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    // Only uploader or admin may update
    if (
      resource.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: cannot edit this resource" });
    }

    const { title, description, category, link, imageUrl } = req.body;
    if (title !== undefined) resource.title = title.trim();
    if (description !== undefined) resource.description = description.trim();
    if (category !== undefined) resource.category = category;
    if (link !== undefined) resource.link = link.trim();
    if (imageUrl !== undefined) resource.imageUrl = imageUrl.trim();

    await resource.save();
    return res.json({ success: true, resource });
  } catch (err) {
    console.error("updateResource Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /api/resources/:id
 * Protected: Delete a resource (uploader or admin only)
 */
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    // Only uploader or admin may delete
    if (
      resource.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: cannot delete this resource" });
    }

    await resource.deleteOne(); 
    return res.json({ success: true, message: "Resource deleted" });
  } catch (err) {
    console.error("deleteResource Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
