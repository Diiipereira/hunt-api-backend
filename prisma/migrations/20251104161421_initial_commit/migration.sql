-- CreateEnum
CREATE TYPE "SlotVolatility" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "HuntStatus" AS ENUM ('DRAFT', 'ACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "password_hash" TEXT NOT NULL,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "code" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "rtp" DECIMAL(5,2),
    "volatility" "SlotVolatility" NOT NULL,
    "max_multiplier" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hunts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "currency_code" VARCHAR(3) NOT NULL,
    "start_balance" DECIMAL(10,2) NOT NULL,
    "status" "HuntStatus" NOT NULL,
    "total_slots" INTEGER NOT NULL,
    "total_bet" DECIMAL(10,2) NOT NULL,
    "total_win" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "saved_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "hunts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hunt_slots" (
    "id" TEXT NOT NULL,
    "hunt_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "bet_amount" DECIMAL(10,2) NOT NULL,
    "win_amount" DECIMAL(10,2) NOT NULL,
    "is_opened" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hunt_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_slots" (
    "user_id" TEXT NOT NULL,
    "slot_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_slots_pkey" PRIMARY KEY ("user_id","slot_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunts" ADD CONSTRAINT "hunts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunts" ADD CONSTRAINT "hunts_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunt_slots" ADD CONSTRAINT "hunt_slots_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunt_slots" ADD CONSTRAINT "hunt_slots_hunt_id_fkey" FOREIGN KEY ("hunt_id") REFERENCES "hunts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_slots" ADD CONSTRAINT "favorite_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_slots" ADD CONSTRAINT "favorite_slots_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
