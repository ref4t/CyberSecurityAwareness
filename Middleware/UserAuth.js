import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js"; // Adjust path if needed

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    const user = await User.findById(decoded.id).select("-password"); // ✅ Fetch user with role
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // ✅ Now req.user contains id, role, etc.
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

export default userAuth;