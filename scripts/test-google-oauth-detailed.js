const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGoogleOAuthDetailed() {
  try {
    console.log("🧪 Testando Google OAuth em detalhes...");

    console.log("📋 Configuração:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(`  - App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);

    // Testar diferentes configurações de redirectTo
    const redirectUrls = [
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      `http://localhost:3000/auth/callback`,
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/`,
    ];

    for (const redirectTo of redirectUrls) {
      console.log(`\n🔍 Testando redirectTo: ${redirectTo}`);

      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectTo,
          },
        });

        if (error) {
          console.log(`❌ Erro: ${error.message}`);

          // Analisar o tipo de erro
          if (error.message.includes("Invalid login credentials")) {
            console.log(
              "   💡 Erro de credenciais inválidas - verificar configuração no Supabase"
            );
          } else if (error.message.includes("redirect_uri_mismatch")) {
            console.log(
              "   💡 Erro de redirect URI - verificar configuração no Google Console"
            );
          } else if (error.message.includes("access_denied")) {
            console.log(
              "   💡 Acesso negado - verificar permissões no Google Console"
            );
          } else if (error.message.includes("invalid_client")) {
            console.log(
              "   💡 Cliente inválido - verificar Client ID no Google Console"
            );
          }
        } else {
          console.log(`✅ OAuth iniciado com sucesso para: ${redirectTo}`);
          console.log(`   - URL: ${data.url}`);
        }
      } catch (oauthError) {
        console.log(`❌ Erro inesperado: ${oauthError.message}`);
      }
    }

    console.log("\n📋 Checklist de configuração:");
    console.log("1. ✅ Google OAuth habilitado no Supabase Dashboard");
    console.log("2. ✅ Client ID e Secret configurados no Supabase");
    console.log(
      "3. ⚠️  Verificar se o redirect URI está configurado no Google Console:"
    );
    console.log(`   - ${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`);
    console.log(
      "4. ⚠️  Verificar se o domínio está autorizado no Google Console"
    );
    console.log(
      "5. ⚠️  Verificar se o Google OAuth está habilitado no Google Console"
    );

    console.log("\n🔗 Links úteis:");
    console.log(
      `- Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers`
    );
    console.log(
      `- Google Console: https://console.cloud.google.com/apis/credentials`
    );
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

testGoogleOAuthDetailed().catch(console.error);
