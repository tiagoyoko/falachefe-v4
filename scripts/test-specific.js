/**
 * Teste específico para "registre 150 reais de materiais de escritorio"
 */

const message = "registre 150 reais de materiais de escritorio";

console.log(`Testando: "${message}"`);
console.log("");

// Testar cada padrão individualmente
const patterns = [
  {
    name: "Padrão 1: registre X reais de Y",
    regex: /(?:registrar|registre|adicionar|criar|inserir)\s+(?:de\s+)?(?:R\$\s*)?[\d.,]+\s*reais?\s+de\s+(.+)/i
  },
  {
    name: "Padrão 2: X reais de Y",
    regex: /(?:R\$\s*)?[\d.,]+\s*reais?\s+de\s+(.+)/i
  },
  {
    name: "Padrão 3: registre Y",
    regex: /(?:registrar|registre|adicionar|criar|inserir)\s+(?:de\s+)?(.+?)(?:\s+(?:de|para|como)|$)/i
  },
  {
    name: "Padrão 4: aspas",
    regex: /[""]([^""]+)[""]/
  }
];

patterns.forEach((pattern, index) => {
  console.log(`${index + 1}. ${pattern.name}`);
  const match = message.match(pattern.regex);
  console.log(`   Regex: ${pattern.regex}`);
  console.log(`   Match: ${match ? `"${match[1]}"` : "null"}`);
  console.log("");
});

// Testar extração de valor
const amountMatch = message.match(/(?:R\$\s*)?([\d.,]+)\s*(?:reais?|real)/i) || 
                   message.match(/R\$\s*([\d.,]+)/) ||
                   message.match(/(\d+(?:[.,]\d+)?)\s*(?:reais?|real)/i);

console.log("Extração de valor:");
console.log(`   Match: ${amountMatch ? amountMatch[1] : "null"}`);
console.log(`   Valor: ${amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : "undefined"}`);
console.log("");

// Testar extração após valor
if (amountMatch) {
  const amount = parseFloat(amountMatch[1].replace(",", "."));
  const afterAmount = message.replace(new RegExp(`(?:R\\$\\s*)?${amount}(?:\\s*reais?)?\\s*`, 'i'), '').trim();
  console.log("Extração após valor:");
  console.log(`   Após ${amount}: "${afterAmount}"`);
}
