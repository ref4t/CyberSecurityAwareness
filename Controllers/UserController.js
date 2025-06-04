import userModel from "../Models/UserModel.js";

export const getUserData = async (req, res) => {
  try {
    // `req.user` should be populated by userAuth middleware
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });


    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const { _id, name, email, isAccountVerified, verifyOtp } = user;

    return res.json({
      user: { _id, name, email, isAccountVerified, hasOtp: !!verifyOtp }
    });
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.status(500).json({ message: "Server error" });
  }
};