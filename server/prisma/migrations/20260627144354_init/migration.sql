-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Subscriber', 'Instructor', 'Admin');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Subscriber',
    "picture" TEXT DEFAULT '/avatar.png',
    "stripe_account_id" TEXT DEFAULT '',
    "stripe_seller" JSONB DEFAULT '{}',
    "stripeSession" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
