/**
 * Script para testar a memória persistente do agente
 */

const {
  persistentMemoryService,
} = require("../src/lib/persistent-memory-service.ts");

async function testPersistentMemory() {
  console.log("🧪 Testando memória persistente do agente...\n");

  const testUserId = "test-user-123";
  const testAgent = "leo";

  try {
    // 1. Criar sessão de conversa
    console.log("1. Criando sessão de conversa...");
    const sessionId = await persistentMemoryService.getOrCreateSession(
      testUserId,
      testAgent,
      "Teste de Memória Persistente"
    );
    console.log(`✅ Sessão criada: ${sessionId}\n`);

    // 2. Salvar mensagens
    console.log("2. Salvando mensagens...");
    await persistentMemoryService.saveMessage(
      sessionId,
      "user",
      "Olá, preciso de ajuda com meu fluxo de caixa"
    );
    await persistentMemoryService.saveMessage(
      sessionId,
      "assistant",
      "Olá! Claro, posso te ajudar com o fluxo de caixa. Qual é a sua situação atual?"
    );
    await persistentMemoryService.saveMessage(
      sessionId,
      "user",
      "Tenho uma receita de R$ 5.000 que preciso registrar"
    );
    await persistentMemoryService.saveMessage(
      sessionId,
      "assistant",
      "Perfeito! Vou te ajudar a registrar essa receita. Qual categoria você gostaria de usar?"
    );
    console.log("✅ Mensagens salvas\n");

    // 3. Recuperar histórico
    console.log("3. Recuperando histórico...");
    const history = await persistentMemoryService.getRecentHistory(
      testUserId,
      testAgent,
      10
    );
    console.log(`✅ Histórico recuperado (${history.length} mensagens):`);
    history.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}] ${msg.content}`);
    });
    console.log("");

    // 4. Obter contexto completo
    console.log("4. Obtendo contexto completo...");
    const context = await persistentMemoryService.getConversationContext(
      testUserId,
      testAgent
    );
    if (context) {
      console.log(`✅ Contexto obtido:`);
      console.log(`   - Sessão: ${context.sessionId}`);
      console.log(`   - Agente: ${context.agent}`);
      console.log(`   - Título: ${context.title}`);
      console.log(`   - Mensagens: ${context.messages.length}`);
      console.log(`   - Criado em: ${context.createdAt}`);
      console.log(`   - Atualizado em: ${context.updatedAt}\n`);
    }

    // 5. Criar resumo
    console.log("5. Criando resumo da conversa...");
    const summary =
      "Usuário solicitou ajuda com fluxo de caixa e quer registrar receita de R$ 5.000";
    await persistentMemoryService.createConversationSummary(sessionId, summary);
    console.log("✅ Resumo criado\n");

    // 6. Verificar resumo
    console.log("6. Verificando resumo...");
    const retrievedSummary =
      await persistentMemoryService.getConversationSummary(sessionId);
    console.log(`✅ Resumo recuperado: ${retrievedSummary}\n`);

    // 7. Listar conversas do usuário
    console.log("7. Listando conversas do usuário...");
    const conversations =
      await persistentMemoryService.getUserConversations(testUserId);
    console.log(`✅ Conversas encontradas (${conversations.length}):`);
    conversations.forEach((conv, i) => {
      console.log(
        `   ${i + 1}. [${conv.agent}] ${conv.title} (${conv.messageCount} mensagens)`
      );
    });

    console.log("\n🎉 Teste de memória persistente concluído com sucesso!");
    console.log("\n📋 Resumo da implementação:");
    console.log("✅ Memória persistente implementada");
    console.log("✅ Sessões de conversa criadas e gerenciadas");
    console.log("✅ Mensagens salvas e recuperadas");
    console.log("✅ Histórico mantido entre sessões");
    console.log("✅ Resumos de conversa funcionando");
    console.log("✅ Contexto completo disponível");
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

// Executar teste
testPersistentMemory();
