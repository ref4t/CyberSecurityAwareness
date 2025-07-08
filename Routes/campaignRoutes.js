import express from "express";
import multer from "multer";
import userAuth from "../Middleware/userAuth.js";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../Controllers/CampaignController.js";

const router = express.Router();

// multer setup: store uploads in ./uploads/ and use original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

router.get("/", getAllCampaigns);
router.get("/:id", getCampaignById);

// Add upload.single('image') before your controller
router.post("/", userAuth, upload.single("image"), createCampaign);

router.put("/:id", userAuth, upload.single("image"), updateCampaign);
router.delete("/:id", userAuth, deleteCampaign);

export default router;
