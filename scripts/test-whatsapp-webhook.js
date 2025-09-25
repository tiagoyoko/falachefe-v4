// Script para testar o webhook do WhatsApp
const WEBHOOK_URL = "https://falachefe-v4.vercel.app/api/uazapi/webhook";

// Simular payload de webhook da UAZAPI
const mockWebhookPayload = {
  event: "message",
  instance: "test-instance-123",
  data: {
    messageid: "3EB0538DA65A59F6D8A251",
    chatid: "5511999999999@s.whatsapp.net",
    fromMe: false,
    isGroup: false,
    messageType: "text",
    text: "Olá! Preciso de ajuda com questões financeiras da minha empresa.",
    messageTimestamp: Date.now(),
    sender: "5511999999999@s.whatsapp.net",
    receiver: "5511888888888@s.whatsapp.net",
    instance_id: "test-instance-123",
  },
};

async function testWebhook() {
  console.log("🧪 Testando webhook do WhatsApp...\n");

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockWebhookPayload),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Webhook respondeu com sucesso!");
      console.log("📋 Resposta:", data);
    } else {
      console.log("❌ Erro no webhook:", response.status, response.statusText);
      const errorText = await response.text();
      console.log("📋 Detalhes do erro:", errorText);
    }
  } catch (error) {
    console.log("❌ Erro ao testar webhook:", error.message);
  }
}

// Testar diferentes tipos de mensagem
async function testDifferentMessageTypes() {
  console.log("\n🧪 Testando diferentes tipos de mensagem...\n");

  const testMessages = [
    {
      text: "Preciso de ajuda com marketing digital",
      expectedAgent: "Max (Marketing)",
    },
    {
      text: "Como calcular o fluxo de caixa da empresa?",
      expectedAgent: "Leo (Financeiro)",
    },
    {
      text: "Quero contratar um novo funcionário",
      expectedAgent: "Lia (RH)",
    },
    {
      text: "Olá, como posso ajudar?",
      expectedAgent: "Max (Padrão)",
    },
  ];

  for (const test of testMessages) {
    console.log(`📝 Testando: "${test.text}"`);
    console.log(`🎯 Agente esperado: ${test.expectedAgent}`);

    const payload = {
      ...mockWebhookPayload,
      data: {
        ...mockWebhookPayload.data,
        text: test.text,
        messageid: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("✅ Mensagem processada com sucesso");
      } else {
        console.log("❌ Erro ao processar mensagem:", response.status);
      }
    } catch (error) {
      console.log("❌ Erro:", error.message);
    }

    console.log("---");

    // Aguardar um pouco entre as mensagens
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Executar testes
async function runTests() {
  console.log("🚀 Iniciando testes do webhook WhatsApp\n");

  await testWebhook();
  await testDifferentMessageTypes();

  console.log("\n✅ Testes concluídos!");
}

runTests().catch(console.error);
