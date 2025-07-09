import Campaign from "../Models/campaignModel.js";
import userModel from "../Models/UserModel.js";

/**
 * GET /api/campaigns
 * Public: list all campaigns
 */
export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");
    res.json({ success: true, campaigns });
  } catch (err) {
    console.error("getAllCampaigns:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/campaigns/:id
 * Public: get one campaign by ID
 */
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("createdBy", "name email");
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, campaign });
  } catch (err) {
    console.error("getCampaignById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/campaigns
 * Protected: create a new campaign
 */
export const createCampaign = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // grab fields from body
    const { title, description, startTime, endTime, imageUrl: bodyImageUrl } = req.body;

    // validate required text fields
    if (!title || !description || !startTime || !endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Title, description, startTime & endTime are required" });
    }

    // determine imageUrl either from file upload or JSON body
    let imageUrl;
    if (req.file) {
      // multer saved file to uploads/
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (bodyImageUrl) {
      imageUrl = bodyImageUrl.trim();
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Either upload an image or provide an imageUrl" });
    }

    const businessName = user.businessName || user.name;

    const campaign = await Campaign.create({
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      createdBy: user._id,
      businessName: businessName.trim(),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    res.status(201).json({ success: true, campaign });
  } catch (err) {
    console.error("createCampaign:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/campaigns/:id
 * Protected: update a campaign (owner only)
 */
export const updateCampaign = async (req, res) => {
  console.log("REQ.BODY:", req.body);
  console.log("REQ.FILE:", req.file);
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (campaign.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your campaign" });
    }

    // Destructure text fields from req.body
    const { title, description, startTime, endTime, status } = req.body;

    // 1) Update text fields if provided
    if (title !== undefined)           campaign.title       = title.trim();
    if (description !== undefined)     campaign.description = description.trim();
    if (startTime !== undefined)       campaign.startTime   = new Date(startTime);
    if (endTime !== undefined)         campaign.endTime     = new Date(endTime);

    // 2) Update status if valid
    if (status && ["active", "pending", "archived"].includes(status)) {
      campaign.status = status;
    }

    // 3) Handle image: either uploaded file or imageUrl in JSON
    if (req.file) {
      // multer saved the file under uploads/
      campaign.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      campaign.imageUrl = req.body.imageUrl.trim();
    }

    await campaign.save();
    return res.json({ success: true, campaign });
  } catch (err) {
    console.error("updateCampaign:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /api/campaigns/:id
 * Protected: delete a campaign (owner only)
 */
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (campaign.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not your campaign" });
    }

    await campaign.remove();
    res.json({ success: true, message: "Campaign deleted" });
  } catch (err) {
    console.error("deleteCampaign:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
