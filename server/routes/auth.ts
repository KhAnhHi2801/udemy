import express from "express"
import { register } from "../controllers/auth.ts"

const router = express.Router()

// Define a simple route for the root URL
router.post("/register", register)

export default router