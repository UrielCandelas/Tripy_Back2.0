/*
  Warnings:

  - You are about to alter the column `rate` on the `User_Comments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `rate` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `cost` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `quantity` on the `det_Expenses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.

*/
-- AlterTable
ALTER TABLE `User_Comments` MODIFY `rate` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `cat_Locations` MODIFY `rate` DECIMAL NULL,
    MODIFY `cost` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `det_Expenses` MODIFY `quantity` DECIMAL NOT NULL;

-- CreateTable
CREATE TABLE `img_Documents` (
    `id` VARCHAR(191) NOT NULL,
    `image` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersRequest` (
    `id` VARCHAR(191) NOT NULL,
    `idUserImage` CHAR(50) NOT NULL,
    `idIDImage` CHAR(50) NOT NULL,
    `email` CHAR(100) NOT NULL,
    `name` CHAR(20) NOT NULL,
    `lastName` CHAR(20) NOT NULL,
    `secondLastName` CHAR(20) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UsersRequest` ADD CONSTRAINT `UsersRequest_idUserImage_fkey` FOREIGN KEY (`idUserImage`) REFERENCES `img_Documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersRequest` ADD CONSTRAINT `UsersRequest_idIDImage_fkey` FOREIGN KEY (`idIDImage`) REFERENCES `img_Documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
