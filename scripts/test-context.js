/**
 * Script para testar o sistema de contexto
 */

const testUserId = "test-user-123";

async function testContext() {
  console.log("🧪 Testando sistema de contexto...\n");

  const testCases = [
    {
      step: 1,
      message: "registre 150 reais de materiais de escritorio",
      expected: "deve detectar comando de transação e criar contexto"
    },
    {
      step: 2,
      message: "ontem",
      expected: "deve detectar como resposta de data e atualizar contexto"
    },
    {
      step: 3,
      message: "categorizar automaticamente",
      expected: "deve detectar como resposta de categoria e finalizar contexto"
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Teste ${testCase.step}: "${testCase.message}"`);
    console.log(`   Esperado: ${testCase.expected}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/test-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: testUserId,
          message: testCase.message
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`   ✅ Sucesso: ${result.data.message.substring(0, 100)}...`);
        console.log(`   🔧 Ação: ${result.data.action}`);
      } else {
        console.log(`   ❌ Erro: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro de conexão: ${error.message}`);
    }
    
    console.log("");
    
    // Aguardar um pouco entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testContext().catch(console.error);
}

module.exports = { testContext };
