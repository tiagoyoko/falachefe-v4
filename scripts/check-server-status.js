const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function checkServerStatus() {
  try {
    console.log("🔍 Verificando status do servidor e configuração...");

    // Verificar se o servidor local está rodando
    console.log("\n📡 Testando servidor local...");
    try {
      const response = await fetch("http://localhost:3000/auth/signin");
      if (response.ok) {
        console.log("✅ Servidor local está rodando (http://localhost:3000)");
      } else {
        console.log(`❌ Servidor local retornou status: ${response.status}`);
      }
    } catch (error) {
      console.log("❌ Servidor local não está acessível:", error.message);
      console.log("💡 Execute: npm run dev");
      return;
    }

    // Verificar configuração do Supabase
    console.log("\n🔧 Verificando configuração do Supabase...");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    console.log(
      `  - Supabase URL: ${supabaseUrl ? "✅ configurado" : "❌ não configurado"}`
    );
    console.log(
      `  - Supabase Key: ${supabaseKey ? "✅ configurado" : "❌ não configurado"}`
    );
    console.log(
      `  - Google Client ID: ${googleClientId ? "✅ configurado" : "❌ não configurado"}`
    );

    if (!supabaseUrl || !supabaseKey || !googleClientId) {
      console.log("❌ Configuração incompleta. Verifique o arquivo .env.local");
      return;
    }

    // Testar conexão com Supabase
    console.log("\n🔗 Testando conexão com Supabase...");
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.log("⚠️ Erro ao conectar com Supabase:", sessionError.message);
      } else {
        console.log("✅ Conexão com Supabase OK");
      }
    } catch (error) {
      console.log(
        "❌ Erro inesperado ao conectar com Supabase:",
        error.message
      );
    }

    // Testar Google OAuth
    console.log("\n🔐 Testando Google OAuth...");
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      });

      if (error) {
        console.log("❌ Erro no Google OAuth:", error.message);

        if (error.message.includes("redirect_uri_mismatch")) {
          console.log("\n💡 SOLUÇÃO:");
          console.log(
            "1. Acesse o Google Console: https://console.cloud.google.com/apis/credentials"
          );
          console.log("2. Encontre o OAuth 2.0 Client ID");
          console.log(
            "3. Adicione o redirect URI: http://localhost:3000/auth/callback"
          );
          console.log("4. Salve e aguarde a propagação");
        }
      } else {
        console.log("✅ Google OAuth configurado corretamente!");
        console.log(`   - URL gerada: ${data.url}`);
      }
    } catch (oauthError) {
      console.log("❌ Erro inesperado no Google OAuth:", oauthError.message);
    }

    console.log("\n📋 RESUMO:");
    console.log("✅ Servidor local: http://localhost:3000");
    console.log("✅ Página de login: http://localhost:3000/auth/signin");
    console.log("✅ Página de callback: http://localhost:3000/auth/callback");

    console.log("\n🔗 Links úteis:");
    console.log("- Login local: http://localhost:3000/auth/signin");
    console.log(
      "- Google Console: https://console.cloud.google.com/apis/credentials"
    );
    console.log(
      "- Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers"
    );
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

checkServerStatus().catch(console.error);
