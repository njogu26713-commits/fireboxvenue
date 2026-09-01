CREATE TABLE `supportChannels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('whatsapp','tiktok','telegram','facebook','instagram','youtube') NOT NULL,
	`label` varchar(120) NOT NULL,
	`value` varchar(512) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportChannels_id` PRIMARY KEY(`id`),
	CONSTRAINT `supportChannels_platform_unique` UNIQUE(`platform`)
);
--> statement-breakpoint
CREATE TABLE `supportMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supportMessages_id` PRIMARY KEY(`id`)
);
