CREATE TABLE "abTestConfigs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"variants" json NOT NULL,
	"trafficAllocation" json NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"metrics" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "abTestResults" (
	"id" text PRIMARY KEY NOT NULL,
	"testId" text NOT NULL,
	"variant" text NOT NULL,
	"userId" text,
	"sessionId" text,
	"metrics" json NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classificationResults" (
	"id" text PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"agentId" text NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"reasoning" json NOT NULL,
	"responseTime" numeric(10, 3) NOT NULL,
	"cacheHit" boolean DEFAULT false NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classificationStats" (
	"id" text PRIMARY KEY NOT NULL,
	"totalClassifications" integer DEFAULT 0 NOT NULL,
	"accuracyRate" numeric(5, 4) DEFAULT '0' NOT NULL,
	"averageConfidence" numeric(5, 4) DEFAULT '0' NOT NULL,
	"averageResponseTime" numeric(10, 3) DEFAULT '0' NOT NULL,
	"errorRate" numeric(5, 4) DEFAULT '0' NOT NULL,
	"cacheHitRate" numeric(5, 4) DEFAULT '0' NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abTestResults" ADD CONSTRAINT "abTestResults_testId_abTestConfigs_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."abTestConfigs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abTestResults" ADD CONSTRAINT "abTestResults_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;