import express from "express";
import { register, login } from "../controllers/auth.ts";

const router = express.Router();

// Define a simple route for the root URL
router.post("/register", register);
router.post("/login", login);

export default router;
