import type { Request, Response } from "express"
import { z } from "zod"
import prisma from "../lib/prisma.ts"
import { hashPassword } from "../utils/auth.ts"
import asyncHandler from "../lib/async-handler.ts"

const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").max(64, "Password must be at most 64 characters long"),
})

const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body
    const { success, data, error } = registerSchema.safeParse({ name, email, password })

    if (!success) {
        res.status(400).json({ errors: error.issues })
        return
    }

    // Hash the password before storing it in the database
    const hashedPassword = await hashPassword(data.password)

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
    },)

    res.status(201).json({ message: "User registered successfully", user })
})

export { register }