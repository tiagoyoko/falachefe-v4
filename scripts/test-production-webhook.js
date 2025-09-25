const https = require("https");
require("dotenv").config();

// Configuração da UAZAPI
const UAZAPI_BASE_URL = "https://falachefe.uazapi.com";
const UAZAPI_TOKEN = "6818e86e-ddf2-436c-952c-0d190b627624";

// URL do webhook de produção
const WEBHOOK_URL = "https://falachefe-v4.vercel.app/api/uazapi/webhook";

async function testProductionWebhook() {
  console.log("🚀 Testando Webhook em Produção - FalaChefe v4\n");
  console.log("=".repeat(60));

  // 1. Verificar se o webhook está acessível
  console.log("\n1️⃣ Testando acessibilidade do webhook...");
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FalaChefe-Test/1.0",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Webhook acessível");
      console.log(`   Status: ${response.status}`);
      console.log(`   Resposta: ${JSON.stringify(data)}`);
    } else {
      console.log("❌ Webhook retornou erro");
      console.log(`   Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log("❌ Erro ao acessar webhook:", error.message);
    // Prosseguir com os demais testes mesmo com falha de acessibilidade
  }

  // 2. Verificar configuração na UAZAPI
  console.log("\n2️⃣ Verificando configuração na UAZAPI...");
  try {
    const response = await fetch(`${UAZAPI_BASE_URL}/webhook`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: UAZAPI_TOKEN,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Configuração obtida com sucesso");

      if (data.length > 0) {
        const webhook = data[0];
        console.log(`   URL: ${webhook.url}`);
        console.log(`   Habilitado: ${webhook.enabled ? "✅ SIM" : "❌ NÃO"}`);
        console.log(`   Eventos: ${webhook.events.join(", ")}`);
        console.log(`   ID: ${webhook.id}`);

        if (!webhook.enabled) {
          console.log("\n⚠️  ATENÇÃO: Webhook está DESABILITADO!");
          console.log("   Execute: node scripts/enable-webhook.js");
        }
      } else {
        console.log("❌ Nenhum webhook configurado");
      }
    } else {
      console.log(
        "❌ Erro ao obter configuração:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.log("❌ Erro ao verificar configuração:", error.message);
  }

  // 3. Teste de mensagem de texto
  console.log("\n3️⃣ Testando recebimento de mensagem de texto...");
  const textMessage = {
    event: "message",
    instance: "test-instance",
    data: {
      text: "Olá! Este é um teste do webhook FalaChefe.",
      from: "5511999999999",
      chatid: "5511999999999@s.whatsapp.net",
      messageType: "text",
      wasSentByApi: false,
      messageid: "test-msg-" + Date.now(),
    },
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FalaChefe-Test/1.0",
      },
      body: JSON.stringify(textMessage),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Mensagem de texto processada com sucesso!");
      console.log(`   Resposta: ${JSON.stringify(data)}`);
    } else {
      console.log("❌ Erro ao processar mensagem de texto");
      console.log(`   Status: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Erro: ${errorText}`);
    }
  } catch (error) {
    console.log("❌ Erro ao testar mensagem de texto:", error.message);
  }

  // 4. Teste de evento de conexão
  console.log("\n4️⃣ Testando evento de conexão...");
  const connectionEvent = {
    event: "connection",
    instance: "test-instance",
    data: {
      status: "connected",
      qr: null,
      battery: 100,
    },
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FalaChefe-Test/1.0",
      },
      body: JSON.stringify(connectionEvent),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Evento de conexão processado com sucesso!");
      console.log(`   Resposta: ${JSON.stringify(data)}`);
    } else {
      console.log("❌ Erro ao processar evento de conexão");
      console.log(`   Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log("❌ Erro ao testar evento de conexão:", error.message);
  }

  // 5. Teste de mensagem de mídia
  console.log("\n5️⃣ Testando mensagem de mídia...");
  const mediaMessage = {
    event: "message",
    instance: "test-instance",
    data: {
      text: "Imagem de teste",
      from: "5511999999999",
      chatid: "5511999999999@s.whatsapp.net",
      messageType: "image",
      wasSentByApi: false,
      file: "https://via.placeholder.com/300x200/0066CC/FFFFFF?text=Teste+FalaChefe",
      mediaType: "image/jpeg",
      messageid: "test-media-" + Date.now(),
    },
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FalaChefe-Test/1.0",
      },
      body: JSON.stringify(mediaMessage),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Mensagem de mídia processada com sucesso!");
      console.log(`   Resposta: ${JSON.stringify(data)}`);
    } else {
      console.log("❌ Erro ao processar mensagem de mídia");
      console.log(`   Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log("❌ Erro ao testar mensagem de mídia:", error.message);
  }

  // 6. Verificar logs no banco de dados
  console.log("\n6️⃣ Verificando mensagens no banco de dados...");
  try {
    const postgres = require("postgres");
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      console.log(
        "⚠️  POSTGRES_URL não configurado - não foi possível verificar o banco"
      );
    } else {
      const sql = postgres(connectionString, { prepare: true });
      const rows = await sql`
        SELECT id, direction, "createdAt", "messageText"
        FROM "whatsappMessages"
        ORDER BY "createdAt" DESC
        LIMIT 5;
      `;

      console.log(`✅ Encontradas ${rows.length} mensagens recentes no banco`);
      rows.forEach((msg, index) => {
        const date = new Date(msg.createdAt).toLocaleString("pt-BR");
        const direction = msg.direction === "in" ? "📥" : "📤";
        const preview = (msg.messageText || "Sem texto").slice(0, 50);
        console.log(`   ${index + 1}. ${direction} ${date} - ${preview}...`);
      });

      await sql.end({ timeout: 5 });
    }
  } catch (error) {
    console.log("❌ Erro ao verificar banco de dados:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎯 Teste de Produção Concluído!");
  console.log("\n📋 Próximos passos:");
  console.log("   1. Envie uma mensagem real para o WhatsApp conectado");
  console.log("   2. Verifique se a mensagem aparece no banco de dados");
  console.log("   3. Teste o fluxo completo de resposta automática");
  console.log("\n🔗 URLs importantes:");
  console.log(`   Webhook: ${WEBHOOK_URL}`);
  console.log(`   Dashboard: https://falachefe-v4.vercel.app/dashboard`);
  console.log(`   Chat: https://falachefe-v4.vercel.app/chat`);
}

// Executar teste
testProductionWebhook().catch(console.error);
