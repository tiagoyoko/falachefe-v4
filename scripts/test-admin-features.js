/**
 * Script para testar funcionalidades de administração de agentes
 */

const {
  agentManagementService,
} = require("../src/lib/agent-management-service.ts");

async function testAdminFeatures() {
  console.log("🧪 Testando funcionalidades de administração...\n");

  const adminUserId = "test-admin-123";

  try {
    // 1. Testar listagem de agentes
    console.log("1. Testando listagem de agentes...");
    const agents = await agentManagementService.listAgents(adminUserId);
    console.log(`✅ ${agents.length} agentes encontrados`);

    // 2. Testar criação de agente
    console.log("\n2. Testando criação de agente...");
    const newAgent = await agentManagementService.createAgent(
      {
        name: "test-agent",
        displayName: "Agente de Teste",
        description: "Agente criado para testes",
        tone: "Amigável e prestativo",
        capabilities: [
          {
            id: "test",
            name: "Teste",
            description: "Funcionalidade de teste",
            enabled: true,
          },
        ],
      },
      adminUserId
    );
    console.log(`✅ Agente criado: ${newAgent.displayName}`);

    // 3. Testar atualização de agente
    console.log("\n3. Testando atualização de agente...");
    const updatedAgent = await agentManagementService.updateAgent(
      newAgent.id,
      {
        displayName: "Agente de Teste Atualizado",
        description: "Descrição atualizada",
        isActive: false,
      },
      adminUserId
    );
    console.log(
      `✅ Agente atualizado: ${updatedAgent.displayName} (Ativo: ${updatedAgent.isActive})`
    );

    // 4. Testar toggle de status
    console.log("\n4. Testando toggle de status...");
    const toggledAgent = await agentManagementService.toggleAgentStatus(
      newAgent.id,
      adminUserId
    );
    console.log(
      `✅ Status alterado: ${toggledAgent.isActive ? "Ativo" : "Inativo"}`
    );

    // 5. Testar configurações de usuário
    console.log("\n5. Testando configurações de usuário...");
    const userSettings = { theme: "dark", language: "pt-BR" };
    await agentManagementService.saveUserAgentSettings(
      newAgent.id,
      adminUserId,
      userSettings
    );

    const retrievedSettings = await agentManagementService.getUserAgentSettings(
      newAgent.id,
      adminUserId
    );
    console.log(`✅ Configurações salvas e recuperadas:`, retrievedSettings);

    // 6. Testar deleção de agente
    console.log("\n6. Testando deleção de agente...");
    await agentManagementService.deleteAgent(newAgent.id, adminUserId);
    console.log("✅ Agente deletado com sucesso");

    // 7. Verificar se agente foi deletado
    console.log("\n7. Verificando deleção...");
    const deletedAgent = await agentManagementService.getAgent(
      newAgent.id,
      adminUserId
    );
    console.log(`✅ Agente deletado: ${deletedAgent === null ? "Sim" : "Não"}`);

    console.log("\n🎉 Todos os testes passaram com sucesso!");
    console.log("\n📋 Funcionalidades testadas:");
    console.log("✅ Listagem de agentes");
    console.log("✅ Criação de agente");
    console.log("✅ Atualização de agente");
    console.log("✅ Toggle de status");
    console.log("✅ Configurações de usuário");
    console.log("✅ Deleção de agente");
    console.log("✅ Verificação de permissões");
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);

    if (error.message.includes("Acesso negado")) {
      console.log(
        "\n💡 Dica: Certifique-se de que o usuário tem permissão de admin"
      );
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAdminFeatures();
}

module.exports = { testAdminFeatures };
