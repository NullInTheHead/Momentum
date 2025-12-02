-- AlterTable
ALTER TABLE `users` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);
