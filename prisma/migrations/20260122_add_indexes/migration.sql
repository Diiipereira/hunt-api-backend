-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_user_name_idx" ON "users"("user_name");

-- CreateIndex
CREATE INDEX "users_reset_token_idx" ON "users"("reset_token");

-- CreateIndex
CREATE INDEX "slots_provider_id_idx" ON "slots"("provider_id");

-- CreateIndex
CREATE INDEX "slots_active_idx" ON "slots"("active");

-- CreateIndex
CREATE INDEX "hunts_user_id_idx" ON "hunts"("user_id");

-- CreateIndex
CREATE INDEX "hunts_status_idx" ON "hunts"("status");

-- CreateIndex
CREATE INDEX "hunt_slots_hunt_id_idx" ON "hunt_slots"("hunt_id");

-- CreateIndex
CREATE INDEX "hunt_slots_slot_id_idx" ON "hunt_slots"("slot_id");
