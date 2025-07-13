import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../Models/UserModel.js";
import transporter from "../Config/Nodemailer.js";
import { emailVerify, welcomeEmail, passReset } from "../Config/emailTemplates.js";

/**
 * @desc   Register a new user
 * @route  POST /api/auth/register
 * @access Public
 */
export const registration = async (req, res) => {
  const {
    name,
    email,
    password,
    role = "general",
    businessName,
    businessAddress,
    businessAbn
  } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required"
    });
  }

  // If business role, validate business details
  if (role === "business" && (!businessName || !businessAddress || !businessAbn)) {
    return res.status(400).json({
      success: false,
      message: "Business name, address, and ABN are required for business registration"
    });
  }

  try {
    // Prevent duplicate accounts
    const existingUser = await userModel.findOne({
      email: email.trim().toLowerCase()
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Create new user document
    const user = new userModel({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPass,
      role,
      ...(role === "business" && {
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        businessAbn: businessAbn.trim()
      })
    });
    await user.save();

    // Generate JWT and set cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure:true,
      sameSite:"none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send welcome email
    const compiledWelcomeEmail = welcomeEmail.replace("{{name}}", user.name);
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Welcome to CyberShield!",
      html: compiledWelcomeEmail
    });

    return res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
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
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure:true,
      sameSite:"none",
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
    secure:true,
    sameSite:"none",
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
    const compiledHtml = emailVerify
        .replace("{{name}}", user.name)
        .replace("{{otp}}", otp);

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify Your Account - CyberShield",
      html: compiledHtml,
    })

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

    // Send OTP email passReset
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Your CyberShield Password",
      html: passReset
        .replace("{{name}}", user.name)
        .replace("{{resetOtp}}", otp),
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

export const verifyT = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.sendStatus(403);
  }
}

/**
 * Update user profile/details
 */
export const updateUserDetails = async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    email,
    role,
    businessName,
    businessAddress,
    businessAbn
  } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update basics
    user.name = name || user.name;
    user.email = email?.trim().toLowerCase() || user.email;

    // If converting or editing business fields
    if (role === "business") {
      if (!businessName || !businessAddress || !businessAbn) {
        return res
          .status(400)
          .json({ message: "Incomplete business details" });
      }
      user.role = "business";
      user.businessName = businessName;
      user.businessAddress = businessAddress;
      user.businessAbn = businessAbn;
    }

    await user.save();
    return res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessAddress: user.businessAddress,
        businessAbn: user.businessAbn
      }
    });
  } catch (err) {
    console.error("UpdateDetails Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new password required" });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash & save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("UpdatePassword Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
