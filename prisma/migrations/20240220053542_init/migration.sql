/*
  Warnings:

  - You are about to alter the column `rate` on the `User_Comments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to drop the column `id_locationImage` on the `cat_Locations` table. All the data in the column will be lost.
  - You are about to alter the column `rate` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `cost` on the `cat_Locations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - You are about to alter the column `quantity` on the `det_Expenses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,0)` to `Decimal`.
  - A unique constraint covering the columns `[id_locationImage1]` on the table `cat_Locations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_locationImage2]` on the table `cat_Locations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_locationImage1` to the `cat_Locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_locationImage2` to the `cat_Locations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cat_Locations` DROP FOREIGN KEY `cat_Locations_id_locationImage_fkey`;

-- AlterTable
ALTER TABLE `User_Comments` MODIFY `rate` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `cat_Locations` DROP COLUMN `id_locationImage`,
    ADD COLUMN `id_locationImage1` CHAR(50) NOT NULL,
    ADD COLUMN `id_locationImage2` CHAR(50) NOT NULL,
    MODIFY `rate` DECIMAL NULL,
    MODIFY `cost` DECIMAL NOT NULL;

-- AlterTable
ALTER TABLE `det_Expenses` MODIFY `quantity` DECIMAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `cat_Locations_id_locationImage1_key` ON `cat_Locations`(`id_locationImage1`);

-- CreateIndex
CREATE UNIQUE INDEX `cat_Locations_id_locationImage2_key` ON `cat_Locations`(`id_locationImage2`);

-- AddForeignKey
ALTER TABLE `cat_Locations` ADD CONSTRAINT `cat_Locations_id_locationImage1_fkey` FOREIGN KEY (`id_locationImage1`) REFERENCES `img_Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cat_Locations` ADD CONSTRAINT `cat_Locations_id_locationImage2_fkey` FOREIGN KEY (`id_locationImage2`) REFERENCES `img_Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
