// Script para habilitar o webhook na UAZAPI
const UAZAPI_BASE_URL = "https://falachefe.uazapi.com";
const UAZAPI_TOKEN = "6818e86e-ddf2-436c-952c-0d190b627624";
const WEBHOOK_URL = "https://falachefe-v4.vercel.app/api/uazapi/webhook";

async function enableWebhook() {
  console.log("🔧 Habilitando webhook na UAZAPI...\n");

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
    } else {
      console.log(
        "❌ Erro ao habilitar webhook:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.log("❌ Erro ao habilitar webhook:", error.message);
  }
}

enableWebhook().catch(console.error);
