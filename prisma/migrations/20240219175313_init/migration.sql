/*
  Warnings:

  - You are about to alter the column `rate` on the `User_Comments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `rate` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `cost` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `quantity` on the `det_Expenses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - A unique constraint covering the columns `[id_user1]` on the table `Chat_Messages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user2]` on the table `Chat_Messages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user]` on the table `Location_Comments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_location]` on the table `Location_Comments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user1]` on the table `Travel_Request` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user2]` on the table `Travel_Request` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_travel]` on the table `Travel_Request` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_userComented]` on the table `User_Comments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_userComent]` on the table `User_Comments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_locationImage]` on the table `cat_Locations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user1]` on the table `det_Expenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user2]` on the table `det_Expenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_travel]` on the table `det_Expenses` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Chat_Messages` DROP FOREIGN KEY `Chat_Messages_id_user1_fkey`;

-- DropForeignKey
ALTER TABLE `Chat_Messages` DROP FOREIGN KEY `Chat_Messages_id_user2_fkey`;

-- DropForeignKey
ALTER TABLE `Location_Comments` DROP FOREIGN KEY `Location_Comments_id_location_fkey`;

-- DropForeignKey
ALTER TABLE `Location_Comments` DROP FOREIGN KEY `Location_Comments_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `Travel_Request` DROP FOREIGN KEY `Travel_Request_id_travel_fkey`;

-- DropForeignKey
ALTER TABLE `Travel_Request` DROP FOREIGN KEY `Travel_Request_id_user1_fkey`;

-- DropForeignKey
ALTER TABLE `Travel_Request` DROP FOREIGN KEY `Travel_Request_id_user2_fkey`;

-- DropForeignKey
ALTER TABLE `Travels` DROP FOREIGN KEY `Travels_id_extras_fkey`;

-- DropForeignKey
ALTER TABLE `Travels` DROP FOREIGN KEY `Travels_id_location_fkey`;

-- DropForeignKey
ALTER TABLE `Travels` DROP FOREIGN KEY `Travels_id_transportation_fkey`;

-- DropForeignKey
ALTER TABLE `Travels` DROP FOREIGN KEY `Travels_id_user1_fkey`;

-- DropForeignKey
ALTER TABLE `Travels` DROP FOREIGN KEY `Travels_id_user2_fkey`;

-- DropForeignKey
ALTER TABLE `User_Comments` DROP FOREIGN KEY `User_Comments_id_userComent_fkey`;

-- DropForeignKey
ALTER TABLE `User_Comments` DROP FOREIGN KEY `User_Comments_id_userComented_fkey`;

-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_idOTP_fkey`;

-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_idProfile_img_fkey`;

-- DropForeignKey
ALTER TABLE `cat_Locations` DROP FOREIGN KEY `cat_Locations_id_locationImage_fkey`;

-- DropForeignKey
ALTER TABLE `det_Expenses` DROP FOREIGN KEY `det_Expenses_id_travel_fkey`;

-- DropForeignKey
ALTER TABLE `det_Expenses` DROP FOREIGN KEY `det_Expenses_id_user1_fkey`;

-- DropForeignKey
ALTER TABLE `det_Expenses` DROP FOREIGN KEY `det_Expenses_id_user2_fkey`;

-- AlterTable
ALTER TABLE `Chat_Messages` MODIFY `id_user1` CHAR(50) NOT NULL,
    MODIFY `id_user2` CHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `Location_Comments` MODIFY `id_user` CHAR(50) NOT NULL,
    MODIFY `id_location` CHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `Travel_Request` MODIFY `id_user1` CHAR(50) NOT NULL,
    MODIFY `id_user2` CHAR(50) NOT NULL,
    MODIFY `id_travel` CHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `Travels` MODIFY `id_user1` CHAR(50) NOT NULL,
    MODIFY `id_user2` CHAR(50) NULL,
    MODIFY `id_location` CHAR(50) NOT NULL,
    MODIFY `id_transportation` CHAR(50) NOT NULL,
    MODIFY `id_extras` CHAR(50) NULL;

-- AlterTable
ALTER TABLE `User_Comments` MODIFY `rate` DECIMAL NOT NULL,
    MODIFY `id_userComented` CHAR(50) NOT NULL,
    MODIFY `id_userComent` CHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `Users` MODIFY `idOTP` CHAR(50) NOT NULL,
    MODIFY `idProfile_img` CHAR(50) NULL;

-- AlterTable
ALTER TABLE `cat_Locations` MODIFY `id_locationImage` CHAR(50) NOT NULL,
    MODIFY `rate` DECIMAL NULL,
    MODIFY `cost` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `det_Expenses` MODIFY `id_user1` CHAR(50) NOT NULL,
    MODIFY `id_user2` CHAR(50) NULL,
    MODIFY `id_travel` CHAR(50) NULL,
    MODIFY `quantity` DECIMAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Chat_Messages_id_user1_key` ON `Chat_Messages`(`id_user1`);

-- CreateIndex
CREATE UNIQUE INDEX `Chat_Messages_id_user2_key` ON `Chat_Messages`(`id_user2`);

-- CreateIndex
CREATE UNIQUE INDEX `Location_Comments_id_user_key` ON `Location_Comments`(`id_user`);

-- CreateIndex
CREATE UNIQUE INDEX `Location_Comments_id_location_key` ON `Location_Comments`(`id_location`);

-- CreateIndex
CREATE UNIQUE INDEX `Travel_Request_id_user1_key` ON `Travel_Request`(`id_user1`);

-- CreateIndex
CREATE UNIQUE INDEX `Travel_Request_id_user2_key` ON `Travel_Request`(`id_user2`);

-- CreateIndex
CREATE UNIQUE INDEX `Travel_Request_id_travel_key` ON `Travel_Request`(`id_travel`);

-- CreateIndex
CREATE UNIQUE INDEX `User_Comments_id_userComented_key` ON `User_Comments`(`id_userComented`);

-- CreateIndex
CREATE UNIQUE INDEX `User_Comments_id_userComent_key` ON `User_Comments`(`id_userComent`);

-- CreateIndex
CREATE UNIQUE INDEX `cat_Locations_id_locationImage_key` ON `cat_Locations`(`id_locationImage`);

-- CreateIndex
CREATE UNIQUE INDEX `det_Expenses_id_user1_key` ON `det_Expenses`(`id_user1`);

-- CreateIndex
CREATE UNIQUE INDEX `det_Expenses_id_user2_key` ON `det_Expenses`(`id_user2`);

-- CreateIndex
CREATE UNIQUE INDEX `det_Expenses_id_travel_key` ON `det_Expenses`(`id_travel`);

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_idOTP_fkey` FOREIGN KEY (`idOTP`) REFERENCES `OTP`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_idProfile_img_fkey` FOREIGN KEY (`idProfile_img`) REFERENCES `img_Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Travels` ADD CONSTRAINT `Travels_id_user1_fkey` FOREIGN KEY (`id_user1`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Travels` ADD CONSTRAINT `Travels_id_user2_fkey` FOREIGN KEY (`id_user2`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Travels` ADD CONSTRAINT `Travels_id_location_fkey` FOREIGN KEY (`id_location`) REFERENCES `cat_Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Travels` ADD CONSTRAINT `Travels_id_transportation_fkey` FOREIGN KEY (`id_transportation`) REFERENCES `cat_Transport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Travels` ADD CONSTRAINT `Travels_id_extras_fkey` FOREIGN KEY (`id_extras`) REFERENCES `det_Extras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cat_Locations` ADD CONSTRAINT `cat_Locations_id_locationImage_fkey` FOREIGN KEY (`id_locationImage`) REFERENCES `img_Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location_Comments` ADD CONSTRAINT `Location_Comments_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location_Comments` ADD CONSTRAINT `Location_Comments_id_location_fkey` FOREIGN KEY (`id_location`) REFERENCES `cat_Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat_Messages` ADD CONSTRAINT `Chat_Messages_id_user1_fkey` FOREIGN KEY (`id_user1`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat_Messages` ADD CONSTRAINT `Chat_Messages_id_user2_fkey` FOREIGN KEY (`id_user2`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `det_Expenses` ADD CONSTRAINT `det_Expenses_id_user1_fkey` FOREIGN KEY (`id_user1`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `det_Expenses` ADD CONSTRAINT `det_Expenses_id_user2_fkey` FOREIGN KEY (`id_user2`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `det_Expenses` ADD CONSTRAINT `det_Expenses_id_travel_fkey` FOREIGN KEY (`id_travel`) REFERENCES `Travels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Comments` ADD CONSTRAINT `User_Comments_id_userComented_fkey` FOREIGN KEY (`id_userComented`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Comments` ADD CONSTRAINT `User_Comments_id_userComent_fkey` FOREIGN KEY (`id_userComent`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Travel_Request` ADD CONSTRAINT `Travel_Request_id_user1_fkey` FOREIGN KEY (`id_user1`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Travel_Request` ADD CONSTRAINT `Travel_Request_id_user2_fkey` FOREIGN KEY (`id_user2`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Travel_Request` ADD CONSTRAINT `Travel_Request_id_travel_fkey` FOREIGN KEY (`id_travel`) REFERENCES `Travels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
