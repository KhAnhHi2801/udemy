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
    select: {
      name: true,
      email: true,
    },
  });

  res.status(201).json({ message: "User registered successfully", user });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  // Check if our database has user with that password
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    res.status(400).json({ message: "No user found" });
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
    // secure: true, // Only works on https
  });

  // Return user to client, exclude hashed password
  const { password: _password, ...userWithoutPassword } = user;

  res
    .status(200)
    .json({ message: "User login successfully", user: userWithoutPassword });
});

const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ user });
});

export { register, login, getMe };
