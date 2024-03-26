/*
  Warnings:

  - You are about to alter the column `rate` on the `User_Comments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to drop the column `email` on the `UsersRequest` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `UsersRequest` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `UsersRequest` table. All the data in the column will be lost.
  - You are about to drop the column `secondLastName` on the `UsersRequest` table. All the data in the column will be lost.
  - You are about to alter the column `rate` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `cost` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `quantity` on the `det_Expenses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - Added the required column `idUser` to the `UsersRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User_Comments` MODIFY `rate` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `UsersRequest` DROP COLUMN `email`,
    DROP COLUMN `lastName`,
    DROP COLUMN `name`,
    DROP COLUMN `secondLastName`,
    ADD COLUMN `idUser` CHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `cat_Locations` MODIFY `rate` DECIMAL NULL,
    MODIFY `cost` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `det_Expenses` MODIFY `quantity` DECIMAL NOT NULL;

-- AddForeignKey
ALTER TABLE `UsersRequest` ADD CONSTRAINT `UsersRequest_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
