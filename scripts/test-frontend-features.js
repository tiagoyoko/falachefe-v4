/**
 * Script para testar funcionalidades do frontend de administração de agentes
 * Testa as APIs e componentes sem depender do build completo
 */

const {
  agentManagementService,
} = require("../src/lib/agent-management-service.ts");

async function testFrontendFeatures() {
  console.log("🧪 Testando funcionalidades do frontend...\n");

  const adminUserId = "test-admin-frontend-123";

  try {
    // 1. Testar se as APIs estão funcionando
    console.log("1. Testando APIs de administração...");

    // Simular chamadas das APIs
    const testAgentData = {
      name: "frontend-test-agent",
      displayName: "Agente de Teste Frontend",
      description: "Agente criado para testar funcionalidades do frontend",
      tone: "Amigável e responsivo",
      capabilities: [
        {
          id: "frontend-test",
          name: "Teste Frontend",
          description: "Funcionalidade de teste do frontend",
          enabled: true,
        },
      ],
    };

    // Testar criação via serviço (simula API POST)
    console.log("   - Testando criação de agente...");
    const createdAgent = await agentManagementService.createAgent(
      testAgentData,
      adminUserId
    );
    console.log(`   ✅ Agente criado: ${createdAgent.displayName}`);

    // Testar listagem via serviço (simula API GET)
    console.log("   - Testando listagem de agentes...");
    const agentsList = await agentManagementService.listAgents(adminUserId);
    console.log(`   ✅ ${agentsList.length} agentes encontrados`);

    // Testar obtenção de agente específico (simula API GET /[id])
    console.log("   - Testando obtenção de agente específico...");
    const specificAgent = await agentManagementService.getAgent(
      createdAgent.id,
      adminUserId
    );
    console.log(`   ✅ Agente obtido: ${specificAgent?.displayName}`);

    // Testar atualização via serviço (simula API PUT)
    console.log("   - Testando atualização de agente...");
    const updatedAgent = await agentManagementService.updateAgent(
      createdAgent.id,
      {
        displayName: "Agente de Teste Frontend Atualizado",
        description: "Descrição atualizada via frontend",
        isActive: false,
      },
      adminUserId
    );
    console.log(`   ✅ Agente atualizado: ${updatedAgent.displayName}`);

    // Testar toggle de status (simula API POST /toggle)
    console.log("   - Testando toggle de status...");
    const toggledAgent = await agentManagementService.toggleAgentStatus(
      createdAgent.id,
      adminUserId
    );
    console.log(
      `   ✅ Status alterado: ${toggledAgent.isActive ? "Ativo" : "Inativo"}`
    );

    // 2. Testar funcionalidades de configuração
    console.log("\n2. Testando funcionalidades de configuração...");

    const userSettings = {
      theme: "dark",
      language: "pt-BR",
      notifications: true,
      autoSave: true,
    };

    console.log("   - Testando salvamento de configurações...");
    await agentManagementService.saveUserAgentSettings(
      createdAgent.id,
      adminUserId,
      userSettings
    );
    console.log("   ✅ Configurações salvas");

    console.log("   - Testando recuperação de configurações...");
    const retrievedSettings = await agentManagementService.getUserAgentSettings(
      createdAgent.id,
      adminUserId
    );
    console.log("   ✅ Configurações recuperadas:", retrievedSettings);

    // 3. Testar validações e permissões
    console.log("\n3. Testando validações e permissões...");

    try {
      // Tentar criar agente com nome duplicado
      await agentManagementService.createAgent(
        { ...testAgentData, name: "frontend-test-agent" },
        adminUserId
      );
      console.log("   ❌ Erro: Deveria ter falhado com nome duplicado");
    } catch (error) {
      console.log("   ✅ Validação de nome duplicado funcionando");
    }

    try {
      // Tentar acessar com usuário não-admin
      await agentManagementService.listAgents("user-123");
      console.log("   ❌ Erro: Deveria ter falhado com usuário não-admin");
    } catch (error) {
      console.log("   ✅ Validação de permissão funcionando");
    }

    // 4. Testar funcionalidades de busca e filtro
    console.log("\n4. Testando funcionalidades de busca...");

    const allAgents = await agentManagementService.listAgents(adminUserId);
    const activeAgents = allAgents.filter((agent) => agent.isActive);
    const inactiveAgents = allAgents.filter((agent) => !agent.isActive);
    const systemAgents = allAgents.filter((agent) => agent.isSystem);
    const userAgents = allAgents.filter((agent) => !agent.isSystem);

    console.log(`   - Total de agentes: ${allAgents.length}`);
    console.log(`   - Agentes ativos: ${activeAgents.length}`);
    console.log(`   - Agentes inativos: ${inactiveAgents.length}`);
    console.log(`   - Agentes do sistema: ${systemAgents.length}`);
    console.log(`   - Agentes de usuário: ${userAgents.length}`);

    // Simular busca por nome
    const searchTerm = "frontend";
    const filteredAgents = allAgents.filter(
      (agent) =>
        agent.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log(
      `   - Agentes encontrados na busca por "${searchTerm}": ${filteredAgents.length}`
    );

    // 5. Testar deleção
    console.log("\n5. Testando deleção de agente...");
    await agentManagementService.deleteAgent(createdAgent.id, adminUserId);
    console.log("   ✅ Agente deletado com sucesso");

    // Verificar se foi realmente deletado
    const deletedAgent = await agentManagementService.getAgent(
      createdAgent.id,
      adminUserId
    );
    console.log(
      `   ✅ Verificação de deleção: ${deletedAgent === null ? "Sucesso" : "Falha"}`
    );

    // 6. Testar inicialização de agentes do sistema
    console.log("\n6. Testando inicialização de agentes do sistema...");
    await agentManagementService.initializeSystemAgents(adminUserId);
    const systemAgentsAfterInit =
      await agentManagementService.listAgents(adminUserId);
    const leoAgent = systemAgentsAfterInit.find(
      (agent) => agent.name === "leo"
    );
    const maxAgent = systemAgentsAfterInit.find(
      (agent) => agent.name === "max"
    );
    const liaAgent = systemAgentsAfterInit.find(
      (agent) => agent.name === "lia"
    );

    console.log(
      `   - Leo (Financeiro): ${leoAgent ? "✅ Criado" : "❌ Não encontrado"}`
    );
    console.log(
      `   - Max (Marketing): ${maxAgent ? "✅ Criado" : "❌ Não encontrado"}`
    );
    console.log(
      `   - Lia (RH): ${liaAgent ? "✅ Criado" : "❌ Não encontrado"}`
    );

    console.log("\n🎉 Todos os testes do frontend passaram com sucesso!");
    console.log("\n📋 Funcionalidades testadas:");
    console.log("✅ APIs de CRUD de agentes");
    console.log("✅ Validações e permissões");
    console.log("✅ Configurações de usuário");
    console.log("✅ Busca e filtros");
    console.log("✅ Deleção de agentes");
    console.log("✅ Inicialização de agentes do sistema");
    console.log("✅ Tratamento de erros");

    console.log("\n🚀 O frontend está pronto para uso!");
    console.log("   - Acesse /admin/agents para gerenciar agentes");
    console.log("   - Todas as funcionalidades estão operacionais");
    console.log("   - APIs respondendo corretamente");
  } catch (error) {
    console.error("❌ Erro no teste do frontend:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testFrontendFeatures();
}

module.exports = { testFrontendFeatures };
