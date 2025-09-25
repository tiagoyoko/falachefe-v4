/**
 * Script para atualizar usuário específico para admin
 * Uso: npx tsx scripts/update-user-to-admin.ts
 */

import { db } from "../src/lib/db";
import { user } from "../src/lib/schema";
import { eq } from "drizzle-orm";

async function updateUserToAdmin() {
  const targetEmail = "tiagoyoko@gmail.com";
  
  console.log(`🔄 Atualizando usuário ${targetEmail} para admin...\n`);

  try {
    // 1. Verificar se o usuário existe
    console.log("1. Verificando se o usuário existe...");
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, targetEmail))
      .limit(1);

    if (existingUser.length === 0) {
      console.log(`❌ Usuário com email ${targetEmail} não encontrado!`);
      console.log("📋 Usuários existentes:");
      
      const allUsers = await db.select().from(user);
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.role})`);
      });
      
      process.exit(1);
    }

    const currentUser = existingUser[0];
    console.log(`✅ Usuário encontrado: ${currentUser.name} (${currentUser.email})`);
    console.log(`   Role atual: ${currentUser.role}`);
    console.log(`   Status: ${currentUser.isActive ? 'Ativo' : 'Inativo'}`);

    // 2. Atualizar para admin
    console.log("\n2. Atualizando para admin...");
    const result = await db
      .update(user)
      .set({
        role: "admin",
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(user.email, targetEmail));

    console.log(`✅ Usuário atualizado com sucesso!`);
    console.log(`   Linhas afetadas: ${result.length || 0}`);

    // 3. Verificar a atualização
    console.log("\n3. Verificando atualização...");
    const updatedUser = await db
      .select()
      .from(user)
      .where(eq(user.email, targetEmail))
      .limit(1);

    if (updatedUser.length > 0) {
      const userData = updatedUser[0];
      console.log(`✅ Verificação concluída:`);
      console.log(`   Nome: ${userData.name}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Status: ${userData.isActive ? 'Ativo' : 'Inativo'}`);
      console.log(`   Atualizado em: ${userData.updatedAt}`);
    }

    console.log("\n🎉 Usuário atualizado para admin com sucesso!");
    console.log("🔐 Agora você pode acessar o painel administrativo em /admin");

  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error);
    process.exit(1);
  } finally {
    // Não é necessário desconectar explicitamente com 'postgres'
    // O pool de conexão é gerenciado automaticamente.
  }
}

// Executar o script
updateUserToAdmin().catch(console.error);
