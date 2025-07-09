import bcrypt from "bcryptjs";
import userModel from "../Models/UserModel.js";

/**
 * GET /api/user/me
 */
export const getUserData = async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
  const user = await userModel.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const { _id, name, email, role, isAccountVerified, businessName, businessAddress, businessAbn, createdAt } = user;
  return res.json({
    success: true,
    user: { _id, name, email, role, isAccountVerified, businessName, businessAddress, businessAbn, createdAt }
  });
};

/**
 * PUT /api/user/update
 */
export const updateUserDetails = async (req, res) => {
  try {
    const { name, email, role, businessName, businessAddress, businessAbn } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update basic fields
    if (name) user.name = name.trim();
    if (email) {
      const normalized = email.trim().toLowerCase();
      // ensure email isn't taken by someone else
      const exists = await userModel.findOne({ email: normalized, _id: { $ne: user._id } });
      if (exists) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
      user.email = normalized;
    }

    // Role and business fields
    if (role === "business") {
      if (!businessName || !businessAddress || !businessAbn) {
        return res
          .status(400)
          .json({ success: false, message: "Complete all business fields" });
      }
      user.role = "business";
      user.businessName = businessName.trim();
      user.businessAddress = businessAddress.trim();
      user.businessAbn = businessAbn.trim();
    } else {
      // If switching back to general, you may want to clear business info:
      if (user.role === "business" && role === "general") {
        user.businessName = undefined;
        user.businessAddress = undefined;
        user.businessAbn = undefined;
      }
      user.role = role || user.role;
    }

    await user.save();

    // Return fresh user data (omit password & sensitive fields)
    const { _id, name: n, email: e, role: r, businessName: bn, businessAddress: ba, businessAbn: abn, createdAt } = user;
    return res.json({
      success: true,
      message: "Profile updated",
      user: { _id, name: n, email: e, role: r, businessName: bn, businessAddress: ba, businessAbn: abn, createdAt },
    });
  } catch (err) {
    console.error("updateUserDetails Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * PUT /api/user/update-password
 */
export const updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Both passwords required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
  }

  const user = await userModel.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return res.status(401).json({ success: false, message: "Current password incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ success: true, message: "Password updated" });
};
