/**
 * Teste rápido para verificar se a OpenAI API key está funcionando
 */

async function testOpenAIKey() {
  console.log("🔑 Testando OpenAI API Key...\n");
  
  try {
    // Teste via nossa API local
    console.log("📡 Testando via API local...");
    
    const response = await fetch('http://localhost:3000/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: "5Ghh_4K8yIjnW2s-QymLO",
        chatId: "test_openai_key",
        command: "Teste simples de classificação",
        useMultiLayer: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log("✅ Resposta recebida:");
    console.log(`   Success: ${result.success}`);
    console.log(`   Agent: ${result.metadata?.agent}`);
    console.log(`   Classification:`, result.metadata?.classification);
    console.log(`   Processing Time: ${result.metadata?.processingTime}ms`);
    console.log(`   Confidence: ${result.metadata?.confidence}`);
    
    // Verificar se está usando fallback ou OpenAI real
    if (result.metadata?.classification?.reasoning?.includes("fallback")) {
      console.log("⚠️  Usando classificação de fallback (OpenAI API não disponível)");
      console.log("🔧 Para usar OpenAI real, configure OPENAI_API_KEY no .env.local");
    } else {
      console.log("✅ Usando OpenAI API real!");
    }
    
  } catch (error) {
    console.log("❌ Erro no teste:", error.message);
  }
  
  console.log("\n📋 Para configurar a OpenAI API Key:");
  console.log("1. Crie um arquivo .env.local na raiz do projeto");
  console.log("2. Adicione: OPENAI_API_KEY=sk-proj-sua-chave-aqui");
  console.log("3. Reinicie o servidor de desenvolvimento");
}

// Executar teste
testOpenAIKey().catch(console.error);


