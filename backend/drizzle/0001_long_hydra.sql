CREATE TABLE `memos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`isPublished` integer DEFAULT false NOT NULL,
	`authorId` integer,
	`deletedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `memosCreatedAtIdx` ON `memos` (`createdAt`);--> statement-breakpoint
CREATE INDEX `memosIsPublishedIdx` ON `memos` (`isPublished`);--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `type`;