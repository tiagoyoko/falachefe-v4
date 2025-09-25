/**
 * Script para migrar usuários existentes e adicionar campo role
 * Também inicializa os agentes do sistema
 */

const { db } = require("../src/lib/db.ts");
const { user, agents } = require("../src/lib/schema.ts");
const {
  agentManagementService,
} = require("../src/lib/agent-management-service.ts");
const { eq, sql } = require("drizzle-orm");

async function migrateUserRoles() {
  console.log("🔄 Iniciando migração de roles de usuários...\n");

  try {
    // 1. Adicionar coluna role se não existir
    console.log("1. Adicionando coluna 'role' à tabela users...");
    try {
      await db.execute(
        sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user'`
      );
      console.log("✅ Coluna 'role' adicionada com sucesso");
    } catch (error) {
      console.log("ℹ️  Coluna 'role' já existe ou erro:", error.message);
    }

    // 2. Adicionar coluna isActive se não existir
    console.log("\n2. Adicionando coluna 'isActive' à tabela users...");
    try {
      await db.execute(
        sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true`
      );
      console.log("✅ Coluna 'isActive' adicionada com sucesso");
    } catch (error) {
      console.log("ℹ️  Coluna 'isActive' já existe ou erro:", error.message);
    }

    // 3. Atualizar usuários existentes sem role
    console.log("\n3. Atualizando usuários existentes...");
    const result = await db
      .update(user)
      .set({
        role: "user",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(sql`"role" IS NULL OR "isActive" IS NULL`);

    console.log(`✅ ${result.rowCount || 0} usuários atualizados`);

    // 4. Criar usuário admin se não existir
    console.log("\n4. Verificando/criando usuário admin...");
    const adminEmail = "admin@falachefe.com";
    const existingAdmin = await db
      .select()
      .from(user)
      .where(eq(user.email, adminEmail))
      .limit(1);

    if (existingAdmin.length === 0) {
      const adminId = "admin-" + Date.now();
      await db.insert(user).values({
        id: adminId,
        name: "Administrador",
        email: adminEmail,
        emailVerified: true,
        role: "super_admin",
        isActive: true,
      });
      console.log("✅ Usuário admin criado:", adminEmail);
    } else {
      // Atualizar usuário existente para admin
      await db
        .update(user)
        .set({
          role: "super_admin",
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(user.email, adminEmail));
      console.log("✅ Usuário admin atualizado:", adminEmail);
    }

    // 5. Inicializar agentes do sistema
    console.log("\n5. Inicializando agentes do sistema...");
    const adminUser = await db
      .select()
      .from(user)
      .where(eq(user.email, adminEmail))
      .limit(1);

    if (adminUser.length > 0) {
      await agentManagementService.initializeSystemAgents(adminUser[0].id);
      console.log("✅ Agentes do sistema inicializados");
    }

    // 6. Listar agentes criados
    console.log("\n6. Verificando agentes criados...");
    const agentsList = await agentManagementService.listAgents(adminUser[0].id);
    console.log(`📊 Total de agentes: ${agentsList.length}`);
    agentsList.forEach((agent) => {
      console.log(
        `   - ${agent.displayName} (${agent.name}) - ${agent.isActive ? "Ativo" : "Inativo"}`
      );
    });

    console.log("\n🎉 Migração concluída com sucesso!");
    console.log("\n📋 Resumo:");
    console.log("✅ Campo 'role' adicionado aos usuários");
    console.log("✅ Campo 'isActive' adicionado aos usuários");
    console.log("✅ Usuários existentes atualizados");
    console.log("✅ Usuário admin criado/atualizado");
    console.log("✅ Agentes do sistema inicializados");
  } catch (error) {
    console.error("❌ Erro na migração:", error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateUserRoles();
}

module.exports = { migrateUserRoles };
