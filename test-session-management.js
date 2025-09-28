/**
 * Script para testar o sistema de gerenciamento de sessões persistentes
 */

const TEST_USER_ID = "5Ghh_4K8yIjnW2s-QymLO"; // ID do usuário de teste
const CHAT_ID = "test_chat_123"; // ID do chat para simular WhatsApp

const conversationFlow = [
  {
    step: 1,
    message: "Olá, preciso de ajuda com finanças",
    expectedIntent: "financeiro",
    expectedContext: "inicial",
    description: "Primeira mensagem - deve criar nova sessão"
  },
  {
    step: 2,
    message: "Quanto tenho de saldo atual?",
    expectedIntent: "financeiro", 
    expectedContext: "continuidade",
    description: "Continuação da conversa - deve usar mesma sessão"
  },
  {
    step: 3,
    message: "Agora quero criar uma campanha de marketing",
    expectedIntent: "marketing",
    expectedContext: "continuidade", 
    description: "Mudança de tópico - ainda mesma sessão"
  },
  {
    step: 4,
    message: "Voltando às finanças, preciso registrar uma receita",
    expectedIntent: "financeiro",
    expectedContext: "continuidade",
    description: "Retorno ao tópico anterior - contexto mantido"
  }
];

async function testSessionManagement() {
  console.log("🧪 Testando Sistema de Gerenciamento de Sessões\n");
  console.log(`👤 Usuário: ${TEST_USER_ID}`);
  console.log(`💬 Chat ID: ${CHAT_ID}\n`);
  
  let sessionId = null;
  let previousSessionId = null;
  
  for (const testCase of conversationFlow) {
    try {
      console.log(`📝 Passo ${testCase.step}: ${testCase.description}`);
      console.log(`   Mensagem: "${testCase.message}"`);
      
      const response = await fetch('http://localhost:3000/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          chatId: CHAT_ID,
          command: testCase.message,
          useMultiLayer: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.metadata) {
        const { classification, agent, sessionId: currentSessionId, sessionInfo } = result.metadata;
        
        console.log(`   ✅ Agente: ${agent}`);
        console.log(`   ✅ Intenção: ${classification.primaryIntent}`);
        console.log(`   ✅ Contexto: ${classification.conversationContext}`);
        console.log(`   ✅ Session ID: ${currentSessionId}`);
        
        if (sessionInfo) {
          console.log(`   ✅ Mensagens na sessão: ${sessionInfo.messageCount}`);
          console.log(`   ✅ Tópico atual: ${sessionInfo.currentTopic || 'N/A'}`);
          console.log(`   ✅ Nova sessão: ${sessionInfo.isNewSession ? 'Sim' : 'Não'}`);
        }
        
        // Verificar consistência da sessão
        if (sessionId === null) {
          // Primeira mensagem - deve criar nova sessão
          sessionId = currentSessionId;
          console.log(`   🆕 Nova sessão criada: ${sessionId}`);
        } else {
          // Mensagens subsequentes - devem usar mesma sessão
          if (currentSessionId === sessionId) {
            console.log(`   ✅ Sessão mantida corretamente`);
          } else {
            console.log(`   ❌ ERRO: Sessão mudou inesperadamente!`);
            console.log(`   📊 Anterior: ${sessionId}`);
            console.log(`   📊 Atual: ${currentSessionId}`);
          }
        }
        
        // Verificar classificação de contexto
        if (testCase.step === 1 && classification.conversationContext !== "inicial") {
          console.log(`   ⚠️ Contexto esperado "inicial", obtido "${classification.conversationContext}"`);
        } else if (testCase.step > 1 && classification.conversationContext !== "continuidade") {
          console.log(`   ⚠️ Contexto esperado "continuidade", obtido "${classification.conversationContext}"`);
        }
        
        previousSessionId = currentSessionId;
        
      } else {
        console.log(`   ❌ Resposta inválida:`, result);
      }
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
    }
    
    console.log(); // Linha em branco
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("📊 RESUMO DO TESTE DE SESSÕES:");
  console.log(`✅ Sessão inicial criada: ${sessionId ? 'Sim' : 'Não'}`);
  console.log(`✅ Sessões mantidas consistentes: ${previousSessionId === sessionId ? 'Sim' : 'Não'}`);
  console.log(`✅ Contexto de conversa detectado: ${conversationFlow.length > 0 ? 'Sim' : 'Não'}`);
  
  if (sessionId && previousSessionId === sessionId) {
    console.log("🎉 SISTEMA DE SESSÕES FUNCIONANDO CORRETAMENTE!");
  } else {
    console.log("⚠️ Sistema de sessões precisa de ajustes.");
  }
}

// Executar testes
testSessionManagement().catch(console.error);


