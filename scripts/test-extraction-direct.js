/**
 * Teste direto da extração LLM (sem servidor)
 */

const { llmExtractionService } = require("../src/lib/llm-extraction-service");

async function testExtraction() {
  console.log("🧪 Testando extração LLM diretamente...\n");

  const testMessages = [
    "registre 150 reais de materiais de escritorio",
    "adicionar receita de R$ 500 da venda de produto",
    "criar despesa de 300 reais para fornecedor ontem",
    "ontem",
    "categorizar automaticamente",
    "sim",
    "olá, como você está?",
  ];

  for (const message of testMessages) {
    console.log(`📝 Testando: "${message}"`);

    try {
      // Testar extração de transação
      const transactionResult =
        await llmExtractionService.extractTransactionData(message);
      console.log(`   Transação:`, {
        isTransaction: transactionResult.isTransaction,
        description: transactionResult.description,
        amount: transactionResult.amount,
        type: transactionResult.type,
        confidence: transactionResult.confidence,
      });

      // Testar detecção de resposta de contexto
      const contextResult = await llmExtractionService.detectContextResponse(
        message,
        ["data", "categoria"]
      );
      console.log(`   Resposta:`, {
        isResponse: contextResult.isResponse,
        responseType: contextResult.responseType,
        confidence: contextResult.confidence,
      });
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }

    console.log("");

    // Aguardar um pouco entre os testes
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testExtraction().catch(console.error);
}

module.exports = { testExtraction };
