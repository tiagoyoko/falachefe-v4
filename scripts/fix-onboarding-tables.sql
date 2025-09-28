-- Script para criar apenas as tabelas necessárias para o onboarding

-- Tabela companies (se não existir)
CREATE TABLE IF NOT EXISTS "companies" (
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

-- Tabela onboardingPreferences (se não existir)
CREATE TABLE IF NOT EXISTS "onboardingPreferences" (
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

-- Adicionar colunas role e isActive na tabela user (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'role') THEN
        ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'isActive') THEN
        ALTER TABLE "user" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;
    END IF;
END $$;

-- Remover constraint unique do userSettings se existir
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'userSettings_userId_unique') THEN
        ALTER TABLE "userSettings" DROP CONSTRAINT "userSettings_userId_unique";
    END IF;
END $$;

-- Adicionar foreign keys se não existirem
DO $$ 
BEGIN
    -- FK para companies
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'companies_userId_user_id_fk') THEN
        ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    
    -- FK para onboardingPreferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'onboardingPreferences_userId_user_id_fk') THEN
        ALTER TABLE "onboardingPreferences" ADD CONSTRAINT "onboardingPreferences_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Verificar se as tabelas foram criadas
SELECT 
    'companies' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'onboardingPreferences' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'onboardingPreferences') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'user (role)' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'role') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'user (isActive)' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'isActive') 
         THEN '✅ Existe' 
         ELSE '❌ Não existe' 
    END as status;
