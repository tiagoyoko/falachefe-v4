const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAuthWebhook() {
  try {
    console.log("🔧 Configurando webhook de autenticação...");

    // URL do webhook (ajuste conforme sua URL de produção)
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth-webhook`
      : "http://localhost:3000/api/auth-webhook";

    console.log("📡 URL do webhook:", webhookUrl);

    // Configurar webhook para eventos de usuário
    const webhookConfig = {
      url: webhookUrl,
      events: [
        "auth.users.created",
        "auth.users.updated",
        "auth.users.deleted",
      ],
      secret: process.env.WEBHOOK_SECRET || "your-webhook-secret-here",
    };

    console.log("⚙️ Configuração do webhook:");
    console.log(JSON.stringify(webhookConfig, null, 2));

    // Nota: A configuração do webhook precisa ser feita manualmente no dashboard do Supabase
    console.log("\n📋 INSTRUÇÕES PARA CONFIGURAR O WEBHOOK:");
    console.log("1. Acesse o dashboard do Supabase");
    console.log("2. Vá para Database > Webhooks");
    console.log('3. Clique em "Create a new hook"');
    console.log("4. Configure:");
    console.log(`   - URL: ${webhookUrl}`);
    console.log(
      "   - Events: auth.users.created, auth.users.updated, auth.users.deleted"
    );
    console.log(`   - Secret: ${webhookConfig.secret}`);
    console.log("5. Salve a configuração");

    // Testar o webhook
    console.log("\n🧪 Testando webhook...");

    try {
      const response = await fetch(webhookUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Webhook está funcionando:", data);
      } else {
        console.log("⚠️ Webhook retornou status:", response.status);
      }
    } catch (error) {
      console.log("❌ Erro ao testar webhook:", error.message);
    }

    // Sincronizar usuários órfãos existentes
    console.log("\n🔄 Sincronizando usuários órfãos existentes...");

    try {
      const syncResponse = await fetch(
        `${webhookUrl.replace("/auth-webhook", "/user-sync")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "sync-orphaned" }),
        }
      );

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log("✅ Sincronização concluída:", syncData);
      } else {
        console.log("⚠️ Erro na sincronização:", syncResponse.status);
      }
    } catch (error) {
      console.log("❌ Erro ao sincronizar usuários:", error.message);
    }

    console.log("\n✅ Configuração do webhook concluída!");
  } catch (error) {
    console.error("❌ Erro na configuração:", error.message);
  }
}

setupAuthWebhook().catch(console.error);
