import { Prisma } from "../generated/prisma/client.ts"

const FIELD_MESSAGES: Record<string, string> = {
    email: "Email already registered",
    name: "Name already taken",
}

const handlePrismaError = (error: unknown): { message: string; status: number } => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002": {
                const field = (error.meta?.target as string[])?.[0]
                const message = field ? (FIELD_MESSAGES[field] ?? `${field} already exists`) : "Data already exists"
                return { message, status: 409 }  // 409 Conflict
            }
            case "P2025":
                return { message: "Record not found", status: 404 }
            default:
                return { message: "Database error", status: 400 }
        }
    }
    return { message: "Something went wrong", status: 500 }
}

export { handlePrismaError }
