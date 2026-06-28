import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import { readdirSync } from "fs"
import prisma from "./lib/prisma.ts"

const app = express()

// Apply middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}))
app.use(express.json())
app.use(morgan("dev"))

const loadRoutes = async () => {
    const routes = readdirSync("./routes")
    for (const route of routes) {
        const module = await import(`./routes/${route}`)
        app.use("/api", module.default)
    }
}

const start = async () => {
    await prisma.$connect()
    console.log("Database connected")
    await loadRoutes()
    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start().catch(console.error)