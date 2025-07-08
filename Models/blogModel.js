// src/Models/blogModel.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  // Rename createdBy to author for clarity
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "archived"],
    default: "pending",
  },
}, {
  timestamps: true,
});

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
