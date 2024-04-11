/*
  Warnings:

  - You are about to alter the column `rate` on the `cat_locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `cost` on the `cat_locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `quantity` on the `det_expenses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `rate` on the `user_comments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.

*/
-- AlterTable
ALTER TABLE `cat_locations` MODIFY `rate` DECIMAL NULL,
    MODIFY `cost` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `det_expenses` MODIFY `quantity` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `user_comments` MODIFY `rate` DECIMAL NOT NULL;
