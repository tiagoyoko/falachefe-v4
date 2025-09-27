const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseOAuthConfig() {
  try {
    console.log("🔍 Verificando configuração do Google OAuth no Supabase...");

    console.log("📋 Configuração:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(
      `  - Service Role Key: ${supabaseKey ? "✅ configurado" : "❌ não configurado"}`
    );
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
    console.log(
      `  - Google Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? "✅ configurado" : "❌ não configurado"}`
    );

    if (!supabaseKey) {
      console.log(
        "❌ Service Role Key não configurado. Não é possível verificar a configuração do OAuth."
      );
      return;
    }

    // Verificar se conseguimos acessar o Supabase
    console.log("\n🔍 Testando acesso ao Supabase...");
    try {
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.log("⚠️ Erro ao acessar Supabase:", sessionError.message);
      } else {
        console.log("✅ Acesso ao Supabase OK");
      }
    } catch (error) {
      console.log("❌ Erro inesperado ao acessar Supabase:", error.message);
    }

    // Verificar configuração do Google OAuth
    console.log("\n🔍 Verificando configuração do Google OAuth...");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      });

      if (error) {
        console.log("❌ Erro no OAuth:", error.message);

        if (error.message.includes("redirect_uri_mismatch")) {
          console.log("\n💡 SOLUÇÃO:");
          console.log(
            "1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers"
          );
          console.log("2. Vá para Authentication > Providers");
          console.log("3. Encontre o Google Provider");
          console.log("4. Verifique se está habilitado");
          console.log("5. Configure o Client ID e Secret");
          console.log("6. Adicione os redirect URIs:");
          console.log("   - http://localhost:3000/auth/callback");
          console.log("   - https://falachefe-v4.vercel.app/auth/callback");
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
    console.log(
      "❌ Google OAuth no Supabase Dashboard (PRECISA SER CONFIGURADO)"
    );

    console.log("\n🔗 PRÓXIMOS PASSOS:");
    console.log(
      "1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers"
    );
    console.log("2. Vá para Authentication > Providers");
    console.log("3. Encontre o Google Provider");
    console.log("4. Habilite o Google OAuth");
    console.log("5. Configure:");
    console.log(`   - Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
    console.log(`   - Client Secret: ${process.env.GOOGLE_CLIENT_SECRET}`);
    console.log("6. Adicione os redirect URIs:");
    console.log("   - http://localhost:3000/auth/callback");
    console.log("   - https://falachefe-v4.vercel.app/auth/callback");
    console.log("7. Salve as configurações");

    console.log("\n🔗 Links úteis:");
    console.log(
      `- Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers`
    );
    console.log(
      `- Google Console: https://console.cloud.google.com/apis/credentials`
    );
    console.log(`- Login Local: http://localhost:3000/auth/signin`);
    console.log(
      `- Login Produção: https://falachefe-v4.vercel.app/auth/signin`
    );
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

checkSupabaseOAuthConfig().catch(console.error);
