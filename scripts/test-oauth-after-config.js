const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOAuthAfterConfig() {
  try {
    console.log("🧪 Testando Google OAuth após configuração...");

    console.log("📋 Configuração:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);

    const redirectUris = [
      "http://localhost:3000/auth/callback",
      "https://falachefe-v4.vercel.app/auth/callback",
    ];

    console.log("\n🔍 Testando redirect URIs...");

    for (const redirectUri of redirectUris) {
      console.log(`\n📍 Testando: ${redirectUri}`);

      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUri,
          },
        });

        if (error) {
          console.log(`❌ Erro para ${redirectUri}:`);
          console.log(`   ${error.message}`);

          if (error.message.includes("redirect_uri_mismatch")) {
            console.log(
              `   💡 Esta URL ainda precisa estar configurada no Google Console`
            );
            console.log(
              `   🔗 Acesse: https://console.cloud.google.com/apis/credentials`
            );
          }
        } else {
          console.log(`✅ Sucesso para ${redirectUri}`);
          console.log(`   - URL gerada: ${data.url}`);

          // Extrair informações da URL
          const url = new URL(data.url);
          const extractedRedirectUri = url.searchParams.get("redirect_uri");

          if (extractedRedirectUri) {
            console.log(`   - Redirect URI extraído: ${extractedRedirectUri}`);
          }

          console.log(`   🎯 Teste esta URL no navegador:`);
          console.log(`   ${data.url}`);
        }
      } catch (oauthError) {
        console.log(
          `❌ Erro inesperado para ${redirectUri}: ${oauthError.message}`
        );
      }
    }

    console.log("\n📋 STATUS ATUAL:");
    console.log("✅ Servidor local: http://localhost:3000");
    console.log("✅ Supabase configurado");
    console.log("✅ Google OAuth configurado no backend");
    console.log(
      "❌ Redirect URIs no Google Console (PRECISAM SER CONFIGURADOS)"
    );

    console.log("\n🔗 PRÓXIMOS PASSOS:");
    console.log(
      "1. Acesse o Google Console: https://console.cloud.google.com/apis/credentials"
    );
    console.log("2. Encontre o OAuth 2.0 Client ID");
    console.log("3. Adicione os redirect URIs:");
    redirectUris.forEach((uri, index) => {
      console.log(`   ${index + 1}. ${uri}`);
    });
    console.log("4. Salve as alterações");
    console.log("5. Aguarde a propagação (5-10 minutos)");
    console.log("6. Execute este script novamente para testar");

    console.log("\n🔗 Links úteis:");
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

testOAuthAfterConfig().catch(console.error);
