/*
  Warnings:

  - You are about to drop the `favorite_slots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "favorite_slots" DROP CONSTRAINT "favorite_slots_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "favorite_slots" DROP CONSTRAINT "favorite_slots_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token_hash" TEXT;

-- DropTable
DROP TABLE "favorite_slots";

-- CreateTable
CREATE TABLE "user_favorite_slots" (
    "user_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_slots_pkey" PRIMARY KEY ("user_id","slot_id")
);

-- AddForeignKey
ALTER TABLE "user_favorite_slots" ADD CONSTRAINT "user_favorite_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_slots" ADD CONSTRAINT "user_favorite_slots_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
