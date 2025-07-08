import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Role replaces isBusiness flag and allows admin users
  role: {
    type: String,
    enum: ["general", "business", "admin"],
    default: "general"
  },

  // Business-specific fields (only required when role === 'business')
  businessName: {
    type: String,
    required: function() { return this.role === "business"; }
  },
  businessAddress: {
    type: String,
    required: function() { return this.role === "business"; }
  },
  businessAbn: {
    type: String,
    required: function() { return this.role === "business"; }
  },

  // OTP & verification
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Date },
  isAccountVerified: { type: Boolean, default: false },

  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Date }
}, {
  timestamps: true
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
