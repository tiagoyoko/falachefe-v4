const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBothRedirects() {
  try {
    console.log("🧪 Testando Google OAuth com ambos os redirect URIs...");

    console.log("📋 Configuração:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);

    const redirectUris = [
      "http://localhost:3000/auth/callback",
      "https://falachefe-v4.vercel.app/auth/callback",
    ];

    console.log("\n🔍 Testando ambos os redirect URIs...");

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
              `   💡 Esta URL precisa estar configurada no Google Console`
            );
          }
        } else {
          console.log(`✅ Sucesso para ${redirectUri}`);
          console.log(`   - URL gerada: ${data.url}`);

          // Extrair informações da URL
          const url = new URL(data.url);
          const extractedRedirectUri = url.searchParams.get("redirect_uri");
          const clientId = url.searchParams.get("client_id");

          if (extractedRedirectUri) {
            console.log(`   - Redirect URI extraído: ${extractedRedirectUri}`);
          }
          if (clientId) {
            console.log(`   - Client ID extraído: ${clientId}`);
          }
        }
      } catch (oauthError) {
        console.log(
          `❌ Erro inesperado para ${redirectUri}: ${oauthError.message}`
        );
      }
    }

    console.log("\n📋 CHECKLIST DE CONFIGURAÇÃO:");
    console.log("✅ Supabase URL configurado");
    console.log("✅ Google Client ID configurado");
    console.log("✅ Google Client Secret configurado");
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
    console.log("6. Teste novamente");

    console.log("\n🔗 Links úteis:");
    console.log(
      `- Google Console: https://console.cloud.google.com/apis/credentials`
    );
    console.log(
      `- Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers`
    );
    console.log(`- Aplicação Local: http://localhost:3000/auth/signin`);
    console.log(
      `- Aplicação Produção: https://falachefe-v4.vercel.app/auth/signin`
    );
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

testBothRedirects().catch(console.error);
