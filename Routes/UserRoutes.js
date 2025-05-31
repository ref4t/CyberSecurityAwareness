import express from "express";
import { getUserData } from "../Controllers/UserController.js";
import userAuth from '../Middleware/UserAuth.js';

const router = express.Router();

// GET /api/user/me
router.get("/data", userAuth, getUserData);

export default router;