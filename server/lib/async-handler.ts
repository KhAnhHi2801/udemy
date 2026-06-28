import type { Request, Response, NextFunction } from "express"
import { handlePrismaError } from "./prisma-error-handler.ts"

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>
type ErrorHandler = (error: unknown, req: Request, res: Response) => void

const defaultErrorHandler: ErrorHandler = (error, _req, res) => {
    const { message, status } = handlePrismaError(error)
    res.status(status).json({ error: message })
}

const asyncHandler = (fn: Handler, onError: ErrorHandler = defaultErrorHandler) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            onError(error, req, res)
        }
    }

export default asyncHandler
