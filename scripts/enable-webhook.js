// Script para habilitar o webhook na UAZAPI
const UAZAPI_BASE_URL =
  process.env.UAZAPI_BASE_URL || "https://falachefe.uazapi.com";
const UAZAPI_TOKEN =
  process.env.UAZAPI_TOKEN || "6818e86e-ddf2-436c-952c-0d190b627624";
const WEBHOOK_URL = "https://falachefe-v4.vercel.app/api/uazapi/webhook";

async function enableWebhook() {
  console.log("🔧 Habilitando webhook na UAZAPI...\n");
  console.log(`📡 URL do webhook: ${WEBHOOK_URL}`);
  console.log(`🔑 Token: ${UAZAPI_TOKEN.substring(0, 8)}...`);

  const webhookConfig = {
    url: WEBHOOK_URL,
    events: ["messages", "connection", "messages_update"],
    addUrlEvents: false,
    addUrlTypesMessages: false,
    enabled: true,
  };

  try {
    const response = await fetch(`${UAZAPI_BASE_URL}/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: UAZAPI_TOKEN,
      },
      body: JSON.stringify(webhookConfig),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Webhook habilitado com sucesso!");
      console.log(`   URL: ${WEBHOOK_URL}`);
      console.log(`   Status: ${data[0]?.enabled ? "ATIVO" : "INATIVO"}`);
      console.log(`   Eventos: ${data[0]?.events?.join(", ")}`);
      console.log("\n🎯 O webhook agora está configurado para:");
      console.log("   - Receber mensagens do WhatsApp");
      console.log("   - Processar com agentes específicos (Leo, Max, Lia)");
      console.log("   - Responder automaticamente");
    } else {
      const errorText = await response.text();
      console.log(
        "❌ Erro ao habilitar webhook:",
        response.status,
        response.statusText
      );
      console.log("📋 Detalhes:", errorText);
    }
  } catch (error) {
    console.log("❌ Erro ao habilitar webhook:", error.message);
  }
}

// Verificar se o webhook está funcionando
async function testWebhook() {
  console.log("\n🧪 Testando webhook...");

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Webhook está respondendo:", data);
    } else {
      console.log("❌ Webhook não está respondendo:", response.status);
    }
  } catch (error) {
    console.log("❌ Erro ao testar webhook:", error.message);
  }
}

async function main() {
  await enableWebhook();
  await testWebhook();
}

main().catch(console.error);
