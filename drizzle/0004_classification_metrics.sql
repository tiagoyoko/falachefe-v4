CREATE TABLE IF NOT EXISTS "classificationResults" (
    "id" text PRIMARY KEY,
    "query" text NOT NULL,
    "agentId" text NOT NULL,
    "confidence" numeric(5, 4) NOT NULL,
    "reasoning" json NOT NULL,
    "responseTime" numeric(10, 3) NOT NULL,
    "cacheHit" boolean DEFAULT false NOT NULL,
    "success" boolean DEFAULT true NOT NULL,
    "timestamp" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "classificationResults_agentId_idx"
    ON "classificationResults" ("agentId");

CREATE INDEX IF NOT EXISTS "classificationResults_timestamp_idx"
    ON "classificationResults" ("timestamp");

CREATE TABLE IF NOT EXISTS "classificationStats" (
    "id" text PRIMARY KEY,
    "totalClassifications" integer DEFAULT 0 NOT NULL,
    "accuracyRate" numeric(5, 4) DEFAULT '0' NOT NULL,
    "averageConfidence" numeric(5, 4) DEFAULT '0' NOT NULL,
    "averageResponseTime" numeric(10, 3) DEFAULT '0' NOT NULL,
    "errorRate" numeric(5, 4) DEFAULT '0' NOT NULL,
    "cacheHitRate" numeric(5, 4) DEFAULT '0' NOT NULL,
    "lastUpdated" timestamp DEFAULT now() NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "abTestConfigs" (
    "id" text PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS "abTestConfigs_isActive_idx"
    ON "abTestConfigs" ("isActive");

CREATE TABLE IF NOT EXISTS "abTestResults" (
    "id" text PRIMARY KEY,
    "testId" text NOT NULL REFERENCES "abTestConfigs" ("id") ON DELETE CASCADE,
    "variant" text NOT NULL,
    "userId" text REFERENCES "user" ("id") ON DELETE SET NULL,
    "sessionId" text,
    "metrics" json NOT NULL,
    "timestamp" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "abTestResults_testId_idx"
    ON "abTestResults" ("testId");

CREATE INDEX IF NOT EXISTS "abTestResults_timestamp_idx"
    ON "abTestResults" ("timestamp");

