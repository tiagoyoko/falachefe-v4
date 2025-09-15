/**
 * Script para testar detecção de comandos
 */

// Simular a função de detecção
function detectTransactionCommand(message) {
  const lowerMessage = message.toLowerCase();

  // Palavras-chave para registro de transações
  const registerKeywords = [
    "registrar",
    "registre",
    "adicionar",
    "criar",
    "inserir",
    "receita",
    "despesa",
    "gasto",
    "venda",
    "compra",
    "pagamento",
  ];

  const hasRegisterKeyword = registerKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  if (!hasRegisterKeyword) {
    return null;
  }

  // Extrair valor - melhorar regex para capturar mais formatos
  const amountMatch = message.match(/(?:R\$\s*)?([\d.,]+)\s*(?:reais?|real)/i) || 
                     message.match(/R\$\s*([\d.,]+)/) ||
                     message.match(/(\d+(?:[.,]\d+)?)\s*(?:reais?|real)/i);
  const amount = amountMatch
    ? parseFloat(amountMatch[1].replace(",", "."))
    : undefined;

  // Extrair descrição - melhorar regex para capturar mais formatos
  let description = null;
  
  // Tentar diferentes padrões de extração
  const patterns = [
    // Padrão: "registre X reais de Y"
    /(?:registrar|registre|adicionar|criar|inserir)\s+(?:de\s+)?(?:R\$\s*)?[\d.,]+\s*reais?\s+de\s+(.+)/i,
    // Padrão: "X reais de Y"
    /(?:R\$\s*)?[\d.,]+\s*reais?\s+de\s+(.+)/i,
    // Padrão: "registre Y"
    /(?:registrar|registre|adicionar|criar|inserir)\s+(?:de\s+)?(.+?)(?:\s+(?:de|para|como)|$)/i,
    // Padrão: aspas
    /[""]([^""]+)[""]/
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      description = match[1].trim();
      break;
    }
  }
  
  // Se não encontrou descrição, tentar extrair do final da mensagem
  if (!description && amount) {
    const afterAmount = message.replace(new RegExp(`(?:R\\$\\s*)?${amount}(?:\\s*reais?)?\\s*`, 'i'), '').trim();
    if (afterAmount && afterAmount.length > 3) {
      description = afterAmount;
    }
  }

  // Detectar tipo
  let transactionType = "despesa";
  if (
    lowerMessage.includes("receita") ||
    lowerMessage.includes("venda") ||
    lowerMessage.includes("vendas")
  ) {
    transactionType = "receita";
  } else if (
    lowerMessage.includes("despesa") ||
    lowerMessage.includes("gasto") ||
    lowerMessage.includes("compra")
  ) {
    transactionType = "despesa";
  }

  return {
    type: "register_transaction",
    description,
    amount,
    transactionType,
  };
}

// Testar diferentes mensagens
const testMessages = [
  "registre 150 reais de materiais de escritorio",
  "registrar R$ 500 da venda de produto",
  "adicionar despesa de 300 reais para fornecedor",
  "criar receita de R$ 1000 hoje",
  "ontem",
  "categorizar automaticamente"
];

console.log("🧪 Testando detecção de comandos...\n");

testMessages.forEach((message, index) => {
  console.log(`Teste ${index + 1}: "${message}"`);
  const result = detectTransactionCommand(message);
  console.log(`Resultado:`, result);
  console.log("");
});

console.log("✅ Teste concluído!");
