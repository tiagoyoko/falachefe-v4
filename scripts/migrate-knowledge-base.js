#!/usr/bin/env node

/**
 * Script para migrar o banco de dados e adicionar as tabelas da base de conhecimento
 *
 * Este script:
 * 1. Verifica se as tabelas da base de conhecimento existem
 * 2. Cria as tabelas se não existirem
 * 3. Cria índices para otimização
 * 4. Valida a estrutura criada
 */

const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  try {
    console.log("🚀 Iniciando migração da base de conhecimento...");

    await client.connect();
    console.log("✅ Conectado ao banco de dados");

    // Verificar se as tabelas já existem
    const checkTables = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'knowledgeDocuments', 
        'knowledgeChunks', 
        'knowledgeEmbeddings', 
        'agentKnowledgeAssociations'
      );
    `;

    const existingTables = await client.query(checkTables);
    const tableNames = existingTables.rows.map((row) => row.table_name);

    console.log(`📋 Tabelas existentes: ${tableNames.join(", ") || "Nenhuma"}`);

    // Criar tabela knowledgeDocuments se não existir
    if (!tableNames.includes("knowledgeDocuments")) {
      console.log("📄 Criando tabela knowledgeDocuments...");
      await client.query(`
        CREATE TABLE "knowledgeDocuments" (
          "id" text PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "content" text NOT NULL,
          "filePath" text,
          "fileType" text NOT NULL,
          "fileSize" integer NOT NULL,
          "metadata" json DEFAULT '{}',
          "agentId" text,
          "isGlobal" boolean NOT NULL DEFAULT false,
          "status" text NOT NULL DEFAULT 'processing',
          "createdBy" text NOT NULL,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now(),
          CONSTRAINT "knowledgeDocuments_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE cascade,
          CONSTRAINT "knowledgeDocuments_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE cascade
        );
      `);
      console.log("✅ Tabela knowledgeDocuments criada");
    }

    // Criar tabela knowledgeChunks se não existir
    if (!tableNames.includes("knowledgeChunks")) {
      console.log("🧩 Criando tabela knowledgeChunks...");
      await client.query(`
        CREATE TABLE "knowledgeChunks" (
          "id" text PRIMARY KEY NOT NULL,
          "documentId" text NOT NULL,
          "content" text NOT NULL,
          "chunkIndex" integer NOT NULL,
          "tokenCount" integer,
          "metadata" json DEFAULT '{}',
          "createdAt" timestamp NOT NULL DEFAULT now(),
          CONSTRAINT "knowledgeChunks_documentId_knowledgeDocuments_id_fk" FOREIGN KEY ("documentId") REFERENCES "knowledgeDocuments"("id") ON DELETE cascade
        );
      `);
      console.log("✅ Tabela knowledgeChunks criada");
    }

    // Criar tabela knowledgeEmbeddings se não existir
    if (!tableNames.includes("knowledgeEmbeddings")) {
      console.log("🔍 Criando tabela knowledgeEmbeddings...");
      await client.query(`
        CREATE TABLE "knowledgeEmbeddings" (
          "id" text PRIMARY KEY NOT NULL,
          "chunkId" text NOT NULL,
          "embedding" json NOT NULL,
          "model" text NOT NULL DEFAULT 'text-embedding-ada-002',
          "createdAt" timestamp NOT NULL DEFAULT now(),
          CONSTRAINT "knowledgeEmbeddings_chunkId_knowledgeChunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "knowledgeChunks"("id") ON DELETE cascade
        );
      `);
      console.log("✅ Tabela knowledgeEmbeddings criada");
    }

    // Criar tabela agentKnowledgeAssociations se não existir
    if (!tableNames.includes("agentKnowledgeAssociations")) {
      console.log("🔗 Criando tabela agentKnowledgeAssociations...");
      await client.query(`
        CREATE TABLE "agentKnowledgeAssociations" (
          "id" text PRIMARY KEY NOT NULL,
          "agentId" text NOT NULL,
          "documentId" text NOT NULL,
          "priority" integer NOT NULL DEFAULT 1,
          "isActive" boolean NOT NULL DEFAULT true,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          CONSTRAINT "agentKnowledgeAssociations_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE cascade,
          CONSTRAINT "agentKnowledgeAssociations_documentId_knowledgeDocuments_id_fk" FOREIGN KEY ("documentId") REFERENCES "knowledgeDocuments"("id") ON DELETE cascade
        );
      `);
      console.log("✅ Tabela agentKnowledgeAssociations criada");
    }

    // Criar índices para otimização
    console.log("📊 Criando índices...");

    const indexes = [
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeDocuments_agentId" ON "knowledgeDocuments"("agentId");',
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeDocuments_status" ON "knowledgeDocuments"("status");',
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeDocuments_isGlobal" ON "knowledgeDocuments"("isGlobal");',
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeDocuments_createdBy" ON "knowledgeDocuments"("createdBy");',
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeDocuments_createdAt" ON "knowledgeDocuments"("createdAt");',
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeChunks_documentId" ON "knowledgeChunks"("documentId");',
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeChunks_chunkIndex" ON "knowledgeChunks"("chunkIndex");',
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeEmbeddings_chunkId" ON "knowledgeEmbeddings"("chunkId");',
      'CREATE INDEX IF NOT EXISTS "idx_knowledgeEmbeddings_model" ON "knowledgeEmbeddings"("model");',
      'CREATE INDEX IF NOT EXISTS "idx_agentKnowledgeAssociations_agentId" ON "agentKnowledgeAssociations"("agentId");',
      'CREATE INDEX IF NOT EXISTS "idx_agentKnowledgeAssociations_documentId" ON "agentKnowledgeAssociations"("documentId");',
      'CREATE INDEX IF NOT EXISTS "idx_agentKnowledgeAssociations_isActive" ON "agentKnowledgeAssociations"("isActive");',
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log("✅ Índices criados");

    // Validar estrutura
    console.log("🔍 Validando estrutura...");
    const validation = await client.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'knowledgeDocuments', 
        'knowledgeChunks', 
        'knowledgeEmbeddings', 
        'agentKnowledgeAssociations'
      )
      ORDER BY table_name, ordinal_position;
    `);

    console.log("📋 Estrutura das tabelas:");
    validation.rows.forEach((row) => {
      console.log(
        `  ${row.table_name}.${row.column_name}: ${row.data_type} ${row.is_nullable === "NO" ? "NOT NULL" : "NULL"}`
      );
    });

    // Verificar contagem de registros
    const counts = await client.query(`
      SELECT 
        'knowledgeDocuments' as table_name, COUNT(*) as count FROM "knowledgeDocuments"
      UNION ALL
      SELECT 
        'knowledgeChunks' as table_name, COUNT(*) as count FROM "knowledgeChunks"
      UNION ALL
      SELECT 
        'knowledgeEmbeddings' as table_name, COUNT(*) as count FROM "knowledgeEmbeddings"
      UNION ALL
      SELECT 
        'agentKnowledgeAssociations' as table_name, COUNT(*) as count FROM "agentKnowledgeAssociations";
    `);

    console.log("📊 Contagem de registros:");
    counts.rows.forEach((row) => {
      console.log(`  ${row.table_name}: ${row.count} registros`);
    });

    console.log("🎉 Migração da base de conhecimento concluída com sucesso!");
    console.log("");
    console.log("📝 Próximos passos:");
    console.log(
      "  1. Execute o script de inicialização dos agentes: npm run db:dev"
    );
    console.log("  2. Teste o upload de documentos na interface admin");
    console.log(
      "  3. Verifique se os agentes estão usando a base de conhecimento"
    );
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("🔌 Conexão com banco de dados encerrada");
  }
}

// Executar migração
runMigration().catch(console.error);
