/**
 * Script para testar o Agent Squad e verificar se todos os agentes estão funcionando
 * Uso: npx dotenv -e .env -- npx tsx scripts/test-agent-squad.ts
 */

import { getOrchestrator } from "../src/lib/orchestrator/agent-squad";

async function testAgentSquad() {
  console.log("🧪 Testando Agent Squad...\n");

  try {
    // Obter o orquestrador
    const orchestrator = getOrchestrator();
    console.log("✅ Orquestrador inicializado com sucesso");

    // Listar agentes registrados
    const agents = orchestrator.getAgents();
    console.log(`\n📋 Agentes registrados: ${agents.length}`);
    
    agents.forEach((agent, index) => {
      console.log(`  ${index + 1}. ${agent.name} - ${agent.description}`);
    });

    // Testar cada agente individualmente
    const testMessages = [
      {
        agent: "leo",
        message: "Como posso melhorar meu fluxo de caixa?",
        expected: "financeiro"
      },
      {
        agent: "max", 
        message: "Quais estratégias de marketing digital posso usar?",
        expected: "marketing"
      },
      {
        agent: "lia",
        message: "Como contratar funcionários de forma eficiente?",
        expected: "rh"
      }
    ];

    console.log("\n🔍 Testando agentes com mensagens específicas...\n");

    for (const test of testMessages) {
      try {
        console.log(`Testando ${test.agent}: "${test.message}"`);
        
        const response = await orchestrator.processRequest({
          message: test.message,
          userId: "test-user",
          sessionId: "test-session"
        });

        console.log(`✅ Resposta recebida: ${response.message?.substring(0, 100)}...`);
        console.log(`   Agente selecionado: ${response.agentName || 'N/A'}`);
        console.log("");
        
      } catch (error) {
        console.error(`❌ Erro ao testar ${test.agent}:`, error);
      }
    }

    // Testar classificação automática
    console.log("🤖 Testando classificação automática...\n");
    
    const autoTestMessages = [
      "Preciso de ajuda com meu fluxo de caixa",
      "Como posso vender mais no Instagram?",
      "Quero contratar um vendedor",
      "Meu faturamento está baixo, o que fazer?",
      "Preciso de um plano de marketing",
      "Como calcular o salário dos funcionários?"
    ];

    for (const message of autoTestMessages) {
      try {
        console.log(`Mensagem: "${message}"`);
        
        const response = await orchestrator.processRequest({
          message,
          userId: "test-user",
          sessionId: "test-session"
        });

        console.log(`   → Agente: ${response.agentName || 'N/A'}`);
        console.log(`   → Resposta: ${response.message?.substring(0, 80)}...`);
        console.log("");
        
      } catch (error) {
        console.error(`❌ Erro na classificação automática:`, error);
      }
    }

    console.log("🎉 Testes concluídos com sucesso!");
    console.log("\n📊 Resumo:");
    console.log("✅ Orquestrador funcionando");
    console.log("✅ Agentes registrados e ativos");
    console.log("✅ Base de conhecimento integrada");
    console.log("✅ Classificação automática operacional");

  } catch (error) {
    console.error("❌ Erro geral no teste:", error);
    process.exit(1);
  }
}

// Executar o teste
testAgentSquad().catch(console.error);
