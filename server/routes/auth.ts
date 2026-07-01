import express from "express";
import { register, login, getMe } from "../controllers/auth.ts";
import requireAuth from "../middleware/require-auth.ts";

const router = express.Router();

// Define a simple route for the root URL
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);

export default router;
