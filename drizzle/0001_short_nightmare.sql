CREATE TABLE "agentKnowledgeAssociations" (
	"id" text PRIMARY KEY NOT NULL,
	"agentId" text NOT NULL,
	"documentId" text NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentProfiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"agent" text NOT NULL,
	"settings" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"agentId" text NOT NULL,
	"userId" text NOT NULL,
	"settings" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"displayName" text NOT NULL,
	"description" text NOT NULL,
	"tone" text NOT NULL,
	"persona" json NOT NULL,
	"capabilities" json,
	"isActive" boolean DEFAULT true NOT NULL,
	"isSystem" boolean DEFAULT false NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agents_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"segment" text,
	"cnpj" text,
	"address" text,
	"city" text,
	"state" text,
	"phone" text,
	"businessSize" text,
	"monthlyRevenue" text,
	"employeeCount" text,
	"description" text,
	"website" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversationMessages" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversationSessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"agent" text NOT NULL,
	"title" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversationSummaries" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"summary" text NOT NULL,
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversationSummaries_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
CREATE TABLE "defaultCategories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"segment" text,
	"color" text,
	"icon" text,
	"isCommon" boolean DEFAULT true NOT NULL,
	"order" numeric(5, 2) DEFAULT '0',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledgeChunks" (
	"id" text PRIMARY KEY NOT NULL,
	"documentId" text NOT NULL,
	"content" text NOT NULL,
	"chunkIndex" integer NOT NULL,
	"tokenCount" integer,
	"metadata" json DEFAULT '{}'::json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledgeDocuments" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"filePath" text,
	"fileType" text NOT NULL,
	"fileSize" integer NOT NULL,
	"metadata" json DEFAULT '{}'::json,
	"agentId" text,
	"isGlobal" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledgeEmbeddings" (
	"id" text PRIMARY KEY NOT NULL,
	"chunkId" text NOT NULL,
	"embedding" json NOT NULL,
	"model" text DEFAULT 'text-embedding-ada-002' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboardingPreferences" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"mainGoals" json,
	"painPoints" json,
	"currentTools" json,
	"preferredCommunication" text DEFAULT 'whatsapp',
	"businessHours" json,
	"notificationPreferences" json,
	"onboardingCompleted" boolean DEFAULT false NOT NULL,
	"currentStep" text DEFAULT 'welcome',
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboardingTemplates" (
	"id" text PRIMARY KEY NOT NULL,
	"segment" text NOT NULL,
	"name" text NOT NULL,
	"categories" json,
	"goals" json,
	"tips" json,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ragChunks" (
	"id" text PRIMARY KEY NOT NULL,
	"documentId" text NOT NULL,
	"idx" integer NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ragDocuments" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceId" text,
	"title" text NOT NULL,
	"url" text,
	"lang" text,
	"tags" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ragEmbeddings" (
	"id" text PRIMARY KEY NOT NULL,
	"chunkId" text NOT NULL,
	"embedding" json NOT NULL,
	"model" text NOT NULL,
	"dims" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ragSources" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"url" text,
	"tags" json,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsappMessages" (
	"id" text PRIMARY KEY NOT NULL,
	"direction" text NOT NULL,
	"userId" text,
	"instanceId" text,
	"chatId" text,
	"sender" text,
	"receiver" text,
	"messageType" text,
	"messageText" text,
	"mediaType" text,
	"mediaUrl" text,
	"providerMessageId" text,
	"raw" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "userSettings" DROP CONSTRAINT "userSettings_userId_unique";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "agentKnowledgeAssociations" ADD CONSTRAINT "agentKnowledgeAssociations_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentKnowledgeAssociations" ADD CONSTRAINT "agentKnowledgeAssociations_documentId_knowledgeDocuments_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."knowledgeDocuments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentProfiles" ADD CONSTRAINT "agentProfiles_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentSettings" ADD CONSTRAINT "agentSettings_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentSettings" ADD CONSTRAINT "agentSettings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversationMessages" ADD CONSTRAINT "conversationMessages_sessionId_conversationSessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."conversationSessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversationSessions" ADD CONSTRAINT "conversationSessions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversationSummaries" ADD CONSTRAINT "conversationSummaries_sessionId_conversationSessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."conversationSessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledgeChunks" ADD CONSTRAINT "knowledgeChunks_documentId_knowledgeDocuments_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."knowledgeDocuments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledgeDocuments" ADD CONSTRAINT "knowledgeDocuments_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledgeDocuments" ADD CONSTRAINT "knowledgeDocuments_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledgeEmbeddings" ADD CONSTRAINT "knowledgeEmbeddings_chunkId_knowledgeChunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."knowledgeChunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboardingPreferences" ADD CONSTRAINT "onboardingPreferences_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ragChunks" ADD CONSTRAINT "ragChunks_documentId_ragDocuments_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."ragDocuments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ragDocuments" ADD CONSTRAINT "ragDocuments_sourceId_ragSources_id_fk" FOREIGN KEY ("sourceId") REFERENCES "public"."ragSources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ragEmbeddings" ADD CONSTRAINT "ragEmbeddings_chunkId_ragChunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."ragChunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ragSources" ADD CONSTRAINT "ragSources_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsappMessages" ADD CONSTRAINT "whatsappMessages_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;