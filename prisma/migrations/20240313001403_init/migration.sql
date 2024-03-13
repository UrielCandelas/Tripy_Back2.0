-- CreateTable
CREATE TABLE `Users` (
    `id` VARCHAR(191) NOT NULL,
    `email` CHAR(100) NOT NULL,
    `name` CHAR(20) NOT NULL,
    `lastName` CHAR(20) NOT NULL,
    `secondLastName` CHAR(20) NULL,
    `userName` CHAR(15) NOT NULL,
    `password` CHAR(65) NULL,
    `idOTP` CHAR(50) NOT NULL,
    `idProfile_img` CHAR(50) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OTP` (
    `id` VARCHAR(191) NOT NULL,
    `otp` INTEGER NOT NULL,
    `token` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Travels` (
    `id` VARCHAR(191) NOT NULL,
    `id_user1` CHAR(50) NOT NULL,
    `id_user2` CHAR(50) NULL,
    `id_location` CHAR(50) NOT NULL,
    `id_transportation` INTEGER NOT NULL,
    `id_extras` CHAR(50) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `travel_date` DATE NOT NULL,
    `companions` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cat_Locations` (
    `id` VARCHAR(191) NOT NULL,
    `id_locationImage1` CHAR(50) NOT NULL,
    `id_locationImage2` CHAR(50) NOT NULL,
    `location_name` CHAR(20) NOT NULL,
    `location` CHAR(50) NOT NULL,
    `description` CHAR(125) NOT NULL,
    `rate` DECIMAL NULL,
    `cost` DECIMAL NOT NULL,
    `schedule` CHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location_Comments` (
    `id` VARCHAR(191) NOT NULL,
    `id_user` CHAR(50) NOT NULL,
    `id_location` CHAR(50) NOT NULL,
    `comment` CHAR(125) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `det_Extras` (
    `id` VARCHAR(191) NOT NULL,
    `extra_commentary` CHAR(125) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cat_Transport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transport` CHAR(10) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `img_Locations` (
    `id` VARCHAR(191) NOT NULL,
    `image` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `img_Users` (
    `id` VARCHAR(191) NOT NULL,
    `image` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat_Messages` (
    `id` VARCHAR(191) NOT NULL,
    `id_user1` CHAR(50) NOT NULL,
    `id_user2` CHAR(50) NOT NULL,
    `users` JSON NOT NULL,
    `message` CHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `det_Expenses` (
    `id` VARCHAR(191) NOT NULL,
    `id_user1` CHAR(50) NOT NULL,
    `id_user2` CHAR(50) NULL,
    `id_travel` CHAR(50) NULL,
    `expense` CHAR(20) NOT NULL,
    `quantity` DECIMAL NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_Comments` (
    `id` VARCHAR(191) NOT NULL,
    `id_userComented` CHAR(50) NOT NULL,
    `id_userComent` CHAR(50) NOT NULL,
    `comentary_text` CHAR(125) NOT NULL,
    `rate` DECIMAL NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Travel_Request` (
    `id` VARCHAR(191) NOT NULL,
    `id_user1` CHAR(50) NOT NULL,
    `id_user2` CHAR(50) NOT NULL,
    `id_travel` CHAR(50) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `cat_Locations` ADD CONSTRAINT `cat_Locations_id_locationImage1_fkey` FOREIGN KEY (`id_locationImage1`) REFERENCES `img_Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cat_Locations` ADD CONSTRAINT `cat_Locations_id_locationImage2_fkey` FOREIGN KEY (`id_locationImage2`) REFERENCES `img_Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
