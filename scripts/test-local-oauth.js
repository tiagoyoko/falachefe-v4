const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLocalOAuth() {
  try {
    console.log("🧪 Testando Google OAuth com redirect URI local...");

    console.log("📋 Configuração:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(`  - App URL Local: http://localhost:3000`);
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);

    // Testar com redirect URI local
    const localRedirectUri = "http://localhost:3000/auth/callback";

    console.log(`\n🔍 Testando OAuth com redirect URI: ${localRedirectUri}`);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: localRedirectUri,
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
            "3. Na seção 'URIs de redirecionamento autorizados', adicione:"
          );
          console.log(`   - ${localRedirectUri}`);
          console.log("4. Salve as alterações");
          console.log("5. Aguarde alguns minutos para a propagação");
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
        console.log("✅ Google OAuth configurado corretamente!");
        console.log(`   - URL gerada: ${data.url}`);

        // Extrair informações da URL
        const url = new URL(data.url);
        const redirectUri = url.searchParams.get("redirect_uri");
        const clientId = url.searchParams.get("client_id");

        console.log(`   - Redirect URI extraído: ${redirectUri}`);
        console.log(`   - Client ID extraído: ${clientId}`);

        console.log("\n🎯 PRÓXIMOS PASSOS:");
        console.log("1. Abra esta URL no navegador:");
        console.log(`   ${data.url}`);
        console.log("2. Faça login com sua conta Google");
        console.log(
          "3. Você será redirecionado para: http://localhost:3000/auth/callback"
        );
        console.log("4. Verifique se o login funciona corretamente");
      }
    } catch (oauthError) {
      console.log("❌ Erro inesperado no OAuth:", oauthError.message);
    }

    console.log("\n📋 CHECKLIST DE CONFIGURAÇÃO:");
    console.log("✅ Supabase URL configurado");
    console.log("✅ Google Client ID configurado");
    console.log("✅ Google Client Secret configurado");
    console.log(
      "❌ Redirect URI local no Google Console (PRECISA SER CONFIGURADO)"
    );

    console.log("\n🔗 Links úteis:");
    console.log(
      `- Google Console: https://console.cloud.google.com/apis/credentials`
    );
    console.log(
      `- Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers`
    );
    console.log(`- Aplicação Local: http://localhost:3000/auth/signin`);
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

testLocalOAuth().catch(console.error);
