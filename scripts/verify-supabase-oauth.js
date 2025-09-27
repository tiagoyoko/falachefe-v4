const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySupabaseOAuth() {
  try {
    console.log("🔍 Verificando configuração do Google OAuth no Supabase...");

    console.log("📋 Configuração:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(
      `  - Service Role Key: ${supabaseKey ? "***configurado***" : "❌ não configurado"}`
    );
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
    console.log(
      `  - Google Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? "***configurado***" : "❌ não configurado"}`
    );

    // Verificar se conseguimos acessar o Supabase
    console.log("\n🔍 Testando acesso ao Supabase...");
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log("❌ Erro ao acessar Supabase:", sessionError.message);
    } else {
      console.log("✅ Acesso ao Supabase OK");
    }

    // Verificar se o Google OAuth está configurado
    console.log("\n🔍 Verificando configuração do Google OAuth...");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://falachefe-v4.vercel.app/auth/callback",
        },
      });

      if (error) {
        console.log("❌ Erro no OAuth:", error.message);

        if (error.message.includes("redirect_uri_mismatch")) {
          console.log("\n💡 SOLUÇÃO:");
          console.log(
            "1. Acesse o Google Console: https://console.cloud.google.com/apis/credentials"
          );
          console.log("2. Encontre o OAuth 2.0 Client ID");
          console.log(
            "3. Adicione o redirect URI: https://falachefe-v4.vercel.app/auth/callback"
          );
          console.log("4. Salve e aguarde a propagação");
        } else if (error.message.includes("Invalid login credentials")) {
          console.log("\n💡 SOLUÇÃO:");
          console.log(
            "1. Verifique se o Google OAuth está habilitado no Supabase Dashboard"
          );
          console.log("2. Verifique se as credenciais estão corretas");
          console.log(
            "3. Verifique se o Client ID e Secret estão configurados"
          );
        }
      } else {
        console.log("✅ Google OAuth configurado corretamente no Supabase");
        console.log(`   - URL gerada: ${data.url}`);
      }
    } catch (oauthError) {
      console.log("❌ Erro inesperado no OAuth:", oauthError.message);
    }

    console.log("\n📋 CHECKLIST DE CONFIGURAÇÃO:");
    console.log("✅ Supabase URL configurado");
    console.log(`${supabaseKey ? "✅" : "❌"} Service Role Key configurado`);
    console.log(
      `${process.env.GOOGLE_CLIENT_ID ? "✅" : "❌"} Google Client ID configurado`
    );
    console.log(
      `${process.env.GOOGLE_CLIENT_SECRET ? "✅" : "❌"} Google Client Secret configurado`
    );
    console.log("❌ Redirect URI no Google Console (PRECISA SER CONFIGURADO)");

    console.log("\n🔗 PRÓXIMOS PASSOS:");
    console.log("1. Configure o redirect URI no Google Console");
    console.log("2. Aguarde a propagação (5-10 minutos)");
    console.log("3. Teste o login em produção");
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

verifySupabaseOAuth().catch(console.error);
