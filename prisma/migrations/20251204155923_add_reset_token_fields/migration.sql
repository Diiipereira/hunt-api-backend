/*
  Warnings:

  - Made the column `refresh_token_hash` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expires" TIMESTAMP(3),
ALTER COLUMN "refresh_token_hash" SET NOT NULL;
