/**
 * Script para inicializar agentes do sistema
 * Executa a criação dos agentes padrão (Leo, Max, Lia)
 */

const {
  agentManagementService,
} = require("../src/lib/agent-management-service.ts");

async function initializeSystemAgents() {
  console.log("🚀 Inicializando agentes do sistema...\n");

  try {
    // ID de um usuário admin (você pode ajustar conforme necessário)
    const adminUserId = "admin-user-id"; // Substitua por um ID real de admin

    await agentManagementService.initializeSystemAgents(adminUserId);

    console.log("✅ Agentes do sistema inicializados com sucesso!");
    console.log("\n📋 Agentes criados:");
    console.log("   - Leo (Financeiro)");
    console.log("   - Max (Marketing/Vendas)");
    console.log("   - Lia (RH)");

    // Listar agentes para verificar
    const agents = await agentManagementService.listAgents(adminUserId);
    console.log(`\n📊 Total de agentes: ${agents.length}`);

    agents.forEach((agent) => {
      console.log(
        `   - ${agent.displayName} (${agent.name}) - ${agent.isActive ? "Ativo" : "Inativo"}`
      );
    });
  } catch (error) {
    console.error("❌ Erro ao inicializar agentes:", error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeSystemAgents();
}

module.exports = { initializeSystemAgents };
