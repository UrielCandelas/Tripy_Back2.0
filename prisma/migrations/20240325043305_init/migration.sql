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
ALTER TABLE `Users` MODIFY `userName` CHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `cat_Locations` MODIFY `rate` DECIMAL NULL,
    MODIFY `cost` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `det_Expenses` MODIFY `quantity` DECIMAL NOT NULL;
