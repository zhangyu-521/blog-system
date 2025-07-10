-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `role` ENUM('USER', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `emailVerifyToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `metaTitle` VARCHAR(255) NULL,
    `metaDescription` TEXT NULL,
    `metaKeywords` TEXT NULL,
    `publishedAt` DATETIME(3) NULL,
    `allowComments` BOOLEAN NOT NULL DEFAULT true,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `authorId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `articles_slug_key`(`slug`),
    INDEX `articles_status_idx`(`status`),
    INDEX `articles_publishedAt_idx`(`publishedAt`),
    INDEX `articles_authorId_idx`(`authorId`),
    INDEX `articles_categoryId_idx`(`categoryId`),
    INDEX `articles_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(7) NULL,
    `icon` VARCHAR(50) NULL,
    `metaTitle` VARCHAR(255) NULL,
    `metaDescription` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `slug` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(7) NULL,
    `useCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    UNIQUE INDEX `tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article_tags` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `article_tags_articleId_tagId_key`(`articleId`, `tagId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SPAM') NOT NULL DEFAULT 'PENDING',
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `comments_articleId_idx`(`articleId`),
    INDEX `comments_authorId_idx`(`authorId`),
    INDEX `comments_status_idx`(`status`),
    INDEX `comments_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
