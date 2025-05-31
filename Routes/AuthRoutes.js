import express from 'express';
import {
    registration,
    login,
    logout,
    emailVerifyOtp,
    verifyOtp,
    sendResetOtp,
    resetPassword,
    verifyT
} from '../Controllers/AuthController.js';
import userAuth from '../Middleware/UserAuth.js';
import otpRateLimiter from '../Middleware/otpRateLimiter.js';

const authRouter = express.Router();

// Authentication Routes
authRouter.post('/register', registration);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

// OTP Verification Routes
authRouter.post('/send-verify-otp', userAuth, otpRateLimiter, emailVerifyOtp);
authRouter.post('/verify-otp', userAuth, otpRateLimiter, verifyOtp);

//Password reset
authRouter.post('/send-reset-otp', otpRateLimiter, sendResetOtp);
authRouter.post('/reset-password', otpRateLimiter, resetPassword);

//verify authentication
authRouter.get('/verify', verifyT);

export default authRouter;
