import userModel from "../Models/UserModel.js";

const adminOnly = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    req.user.role = user.role;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default adminOnly;
