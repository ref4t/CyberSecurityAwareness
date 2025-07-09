import express from "express";
import {
  getUserData,
  updateUserDetails,
  updateUserPassword,
} from "../Controllers/UserController.js"
import userAuth from "../Middleware/UserAuth.js";

const userRouter = express.Router();

// GET   /api/user/data            → returns current user data
userRouter.get("/data", userAuth, getUserData);

// PUT   /api/user/update        → update name, email, (business fields if role is business)
userRouter.put("/update", userAuth, updateUserDetails);

// PUT   /api/user/update-password → update currentPassword → newPassword
userRouter.put("/update-password", userAuth, updateUserPassword);

export default userRouter;
