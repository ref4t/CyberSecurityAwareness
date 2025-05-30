import express from 'express'
import { registration,login, logout, emailVerifyOtp, verifyOtp } from '../Controllers/AuthController.js'
import userAuth from '../Middleware/UserAuth.js'

const authRouter = express.Router()


authRouter.post('/login',login)
authRouter.post('/register',registration)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, emailVerifyOtp)
authRouter.post('/verify-otp', userAuth, verifyOtp)
authRouter.post('/logout', logout)

export default authRouter;