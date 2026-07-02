import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.ts";
import { comparePassword, hashPassword } from "../utils/auth.ts";
import asyncHandler from "../lib/async-handler.ts";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { AuthRequest } from "../middleware/require-auth.ts";

dotenv.config();

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(64, "Password must be at most 64 characters long"),
});

/**
 * Registers a new user in the system.
 * Validates the input data using Zod schema, hashes the password, and stores the user in the database.
 * Returns a success message and the created user (excluding the password) upon successful registration.
 * @param req - The Express request object containing the user registration data in the body.
 * @param res - The Express response object used to send back the response.
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body || {};
  const { success, data, error } = registerSchema.safeParse({
    name,
    email,
    password,
  });

  if (!success) {
    res.status(400).json({ errors: error.issues });
    return;
  }

  // Hash the password before storing it in the database
  const hashedPassword = await hashPassword(data.password);

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  res.status(201).json({ message: "User registered successfully", user });
});

/**
 * Logs in a user by validating their credentials.
 * Checks if the user exists, compares the provided password with the stored hashed password,
 * generates a JWT token upon successful authentication, and sends it in a cookie.
 * Returns a success message and the authenticated user (excluding the password) upon successful login.
 * @param req - The Express request object containing the user login data in the body.
 * @param res - The Express response object used to send back the response.
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  // Check if our database has user with that password
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("SOMETHING_WENT_WRONG");
  }

  // Check password
  const match = await comparePassword(password, user.password);

  if (!match) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  // Create signed jwt
  const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Send token in cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only works on https
  });

  // Return user to client, exclude hashed password
  const { password: _password, ...userWithoutPassword } = user;

  res
    .status(200)
    .json({ message: "User login successfully", user: userWithoutPassword });
});

/**
 * Logs out a user by clearing the authentication token cookie.
 * Returns a success message upon successful logout.
 * @param req - The Express request object (not used in this function).
 * @param res - The Express response object used to send back the response.
 */
const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully", user: null });
});

/**
 * Retrieves the currently authenticated user's information.
 * Checks if the user is authenticated and fetches their data from the database.
 * Returns the user information (excluding the password) upon successful retrieval.
 * @param req - The Express request object containing the authentication token.
 * @param res - The Express response object used to send back the response.
 */
const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { password: _password, ...userWithoutPassword } = user;
  res.status(200).json({ user: userWithoutPassword });
});

export { register, login, logout, getMe };
