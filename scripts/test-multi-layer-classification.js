/**
 * Script para testar o sistema de classificação multi-camada
 * 
 * Uso: node scripts/test-multi-layer-classification.js
 */

const testCases = [
  // Casos financeiros
  {
    message: "Preciso registrar uma receita de R$ 500,00 da venda de hoje",
    expectedIntent: "financeiro",
    expectedSecondary: "registrar_transacao",
    expectedUrgency: "media"
  },
  {
    message: "Quanto eu tenho de saldo atual?",
    expectedIntent: "financeiro", 
    expectedSecondary: "consultar_saldo",
    expectedUrgency: "baixa"
  },
  {
    message: "URGENTE! Preciso saber se tenho dinheiro para pagar fornecedor amanhã!",
    expectedIntent: "financeiro",
    expectedSecondary: "consultar_saldo", 
    expectedUrgency: "critica"
  },
  
  // Casos marketing
  {
    message: "Como posso criar uma campanha no Instagram para vender mais?",
    expectedIntent: "marketing",
    expectedSecondary: "criar_campanha",
    expectedUrgency: "media"
  },
  {
    message: "Meus clientes não estão comprando, preciso de estratégias de vendas",
    expectedIntent: "marketing",
    expectedSecondary: "estrategia_vendas",
    expectedUrgency: "alta"
  },
  
  // Casos RH
  {
    message: "Preciso contratar um funcionário novo para minha loja",
    expectedIntent: "rh",
    expectedSecondary: "contratacao_funcionario",
    expectedUrgency: "media"
  },
  {
    message: "Tenho conflito na equipe, preciso de ajuda para resolver",
    expectedIntent: "rh",
    expectedSecondary: "gestao_conflitos",
    expectedUrgency: "alta"
  },
  
  // Casos gerais
  {
    message: "Olá, como você pode me ajudar?",
    expectedIntent: "geral",
    expectedSecondary: "orientacao_geral",
    expectedUrgency: "baixa"
  },
  {
    message: "Obrigado pela ajuda anterior, mas preciso esclarecer uma dúvida",
    expectedIntent: "geral",
    expectedSecondary: "esclarecimento",
    expectedUrgency: "baixa"
  }
];

async function testClassification() {
  console.log("🧪 Testando Sistema de Classificação Multi-camada\n");
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    try {
      console.log(`📝 Testando: "${testCase.message}"`);
      
      // Simular chamada para a API
      const response = await fetch('http://localhost:3000/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-id',
          command: testCase.message,
          useMultiLayer: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.metadata && result.metadata.classification) {
        const classification = result.metadata.classification;
        
        console.log(`   ✅ Intenção: ${classification.primaryIntent} (esperado: ${testCase.expectedIntent})`);
        console.log(`   ✅ Urgência: ${classification.urgency} (esperado: ${testCase.expectedUrgency})`);
        console.log(`   ✅ Confiança: ${(classification.confidence * 100).toFixed(1)}%`);
        console.log(`   ✅ Agente: ${result.metadata.agent}`);
        console.log(`   ✅ Tempo: ${result.metadata.processingTime}ms`);
        
        // Verificar se as classificações estão corretas
        const intentCorrect = classification.primaryIntent === testCase.expectedIntent;
        const urgencyCorrect = classification.urgency === testCase.expectedUrgency;
        
        if (intentCorrect && urgencyCorrect) {
          console.log(`   🎯 RESULTADO: PASSOU\n`);
          passedTests++;
        } else {
          console.log(`   ❌ RESULTADO: FALHOU\n`);
        }
      } else {
        console.log(`   ❌ RESULTADO: FALHOU - Resposta inválida\n`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}\n`);
    }
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("📊 RESUMO DOS TESTES:");
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log("🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente.");
  } else if (passedTests >= totalTests * 0.8) {
    console.log("👍 Sistema funcionando bem, mas pode ser otimizado.");
  } else {
    console.log("⚠️ Sistema precisa de ajustes na classificação.");
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  testClassification().catch(console.error);
}

module.exports = { testCases, testClassification };


