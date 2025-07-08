export const welcomeEmail = `<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Arial, sans-serif; background-color: #ecfdf5; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #d1fae5;">
      <h2 style="color: #10b981;">🌿 Welcome to CyberShield!</h2>
      <p style="font-size: 16px;">Hi {{name}},</p>
      <p>We're thrilled to welcome you to the CyberShield community! Your journey to creating a safer digital environment starts now.</p>
      <p>You can now access security tips, publish awareness campaigns, and explore insightful resources to protect your data and users.</p>
      <p>Need help? <a href="mailto:support@cybershield.com" style="color: #059669; text-decoration: underline;">Contact our support team</a>.</p>
      <p style="margin-top: 20px;">Stay safe,<br/><strong>CyberShield Team</strong></p>
    </div>
  </body>
</html>`;
export const emailVerify = `<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Arial, sans-serif; background-color: #ecfdf5; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #d1fae5;">
      <h2 style="color: #10b981;">🔐 Verify Your Email Address</h2>
      <p>Hi {{name}},</p>
      <p>Thanks for signing up with CyberShield. Please verify your email address to activate your account.</p>
      <p style="font-size: 18px; font-weight: bold; color: #065f46; margin-top: 20px;">Your OTP Code:</p>
      <div style="font-size: 24px; font-weight: bold; background-color: #d1fae5; padding: 10px 20px; border-radius: 6px; display: inline-block; color: #064e3b;">
        {{otp}}
      </div>
      <p style="margin-top: 15px;">This code is valid for 10 minutes. If you didn’t request this, you can ignore the email.</p>
      <p>— CyberShield Team</p>
    </div>
  </body>
</html>`;
export const passReset = `<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Arial, sans-serif; background-color: #ecfdf5; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #d1fae5;">
      <h2 style="color: #059669;">🔑 Reset Your Password</h2>
      <p>Hi {{name}},</p>
      <p>We received a request to reset your CyberShield account password.</p>
      <p style="font-size: 18px; font-weight: bold; color: #065f46; margin-top: 20px;">Your Reset OTP:</p>
      <div style="font-size: 24px; font-weight: bold; background-color: #d1fae5; padding: 10px 20px; border-radius: 6px; display: inline-block; color: #064e3b;">
        {{resetOtp}}
      </div>
      <p style="margin-top: 15px;">This OTP is valid for 10 minutes. If you did not request this, you can safely ignore this message.</p>
      <p>Stay secure,<br/><strong>CyberShield Support</strong></p>
    </div>
  </body>
</html>`;
