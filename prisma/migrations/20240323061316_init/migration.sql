/*
  Warnings:

  - You are about to alter the column `rate` on the `User_Comments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to drop the column `idIDImage` on the `UsersRequest` table. All the data in the column will be lost.
  - You are about to alter the column `rate` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `cost` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `quantity` on the `det_Expenses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - Added the required column `idIDImageBack` to the `UsersRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idIDImageFront` to the `UsersRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `UsersRequest` DROP FOREIGN KEY `UsersRequest_idIDImage_fkey`;

-- AlterTable
ALTER TABLE `User_Comments` MODIFY `rate` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `Users` MODIFY `isVerified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `UsersRequest` DROP COLUMN `idIDImage`,
    ADD COLUMN `idIDImageBack` CHAR(50) NOT NULL,
    ADD COLUMN `idIDImageFront` CHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `cat_Locations` MODIFY `rate` DECIMAL NULL,
    MODIFY `cost` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `det_Expenses` MODIFY `quantity` DECIMAL NOT NULL;

-- AddForeignKey
ALTER TABLE `UsersRequest` ADD CONSTRAINT `UsersRequest_idIDImageFront_fkey` FOREIGN KEY (`idIDImageFront`) REFERENCES `img_Documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsersRequest` ADD CONSTRAINT `UsersRequest_idIDImageBack_fkey` FOREIGN KEY (`idIDImageBack`) REFERENCES `img_Documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
