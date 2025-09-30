ALTER TABLE "conversationSessions" ADD COLUMN "chatId" text;--> statement-breakpoint
ALTER TABLE "conversationSessions" ADD COLUMN "lastActivity" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "conversationSessions" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;