export const welcomeEmail = `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h2 style="color: #10b981;">Welcome to CyberShield!</h2>
      <p>Hi {{name}},</p>
      <p>We're excited to have you onboard. Your journey to making your business more secure starts now.</p>
      <p>You can explore resources, publish campaigns, and learn best practices to stay safe online.</p>
      <p>Need help? <a href="mailto:support@cybershield.com" style="color: #3b82f6;">Contact our team</a>.</p>
      <p>Stay safe,<br/>The CyberShield Team</p>
    </div>
  </body>
</html>
`;

export const emailVrify=`<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h2 style="color: #10b981;">Verify Your Email Address</h2>
      <p>Hi {{name}},</p>
      <p>Thanks for signing up with CyberShield. To activate your account, please verify your email.</p>

      <!-- For OTP -->
      <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">Your OTP Code: <span style="color: #ef4444;">{{otp}}</span></p>

      <!-- OR for link-based -->
      <!-- <a href="{{verifyLink}}" style="background-color: #10b981; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Verify Email</a> -->

      <p>This code is valid for 10 minutes.</p>
      <p>If you didn’t request this, you can safely ignore this message.</p>
      <p>— CyberShield Team</p>
    </div>
  </body>
</html>
`;

export const passReset=`<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h2 style="color: #f59e0b;">Reset Your Password</h2>
      <p>Hi {{name}},</p>
      <p>We received a request to reset your CyberShield account password.</p>

      <!-- OTP version -->
      <p style="font-size: 18px; font-weight: bold;">Your Reset OTP: <span style="color: #ef4444;">{{resetOtp}}</span></p>

      <!-- OR link version -->
      <!-- <a href="{{resetLink}}" style="background-color: #f59e0b; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Reset Password</a> -->

      <p>This code will expire in 10 minutes.</p>
      <p>If you didn’t request this, just ignore this email.</p>
      <p>Stay secure,<br/>CyberShield Support</p>
    </div>
  </body>
</html>
`;