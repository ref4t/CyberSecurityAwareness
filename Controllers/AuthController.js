import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../Models/UserModel.js";
import transporter from "../Config/nodemailer.js";

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 * @access Public
 */
export const registration = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  try {
    // Prevent duplicate accounts
    const existingUser = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new userModel({ name: name.trim(), email: email.trim().toLowerCase(), password: hashedPass });
    await user.save();

    // Generate JWT and set cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "Prod",
      sameSite: process.env.NODE_ENV === "Prod" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Welcome to Cyber Security Awareness Website!",
      text: "Your account has been created successfully. Welcome aboard!",
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc   Authenticate user and issue JWT
 * @route  POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    // Find user
    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "Prod",
      sameSite: process.env.NODE_ENV === "Prod" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc   Logout user by clearing JWT cookie
 * @route  POST /api/auth/logout
 * @access Public
 */
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Prod",
    sameSite: process.env.NODE_ENV === "Prod" ? "none" : "strict",
  });
  return res.status(200).json({ success: true, message: "Logged out" });
};

/**
 * @desc   Send email verification OTP to authenticated user
 * @route  POST /api/auth/send-verify-otp
 * @access Private
 */
export const emailVerifyOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify Your Account",
      text: `Your OTP is ${otp}`,
    });

    return res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("Email Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc   Verify email OTP and activate account
 * @route  POST /api/auth/verify-otp
 * @access Public
 */
export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "User ID and OTP are required" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Validate OTP
    if (user.verifyOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(410).json({ success: false, message: "OTP expired" });
    }

    // Activate account
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc   Send password reset OTP via email
 * @route  POST /api/auth/send-reset-otp
 * @access Public
 */
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otp}`,
    });

    return res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send Reset OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc   Verify reset OTP and update password
 * @route  POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
  }

  try {
    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Validate OTP
    if (user.resetOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(410).json({ success: false, message: "OTP expired" });
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
