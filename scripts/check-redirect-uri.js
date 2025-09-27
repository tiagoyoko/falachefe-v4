const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRedirectUri() {
  try {
    console.log("🔍 Verificando redirect URI do Google OAuth...");

    console.log("📋 Configuração atual:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(`  - App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);

    // Testar diferentes URLs de redirect
    const redirectUrls = [
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      `https://falachefe-v4.vercel.app/auth/callback`,
      `http://localhost:3000/auth/callback`,
    ];

    console.log(
      "\n🔗 URLs de redirect que devem estar configuradas no Google Console:"
    );
    redirectUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    // Testar qual URL está sendo gerada pelo Supabase
    console.log("\n🧪 Testando geração de URL OAuth...");

    for (const redirectTo of redirectUrls) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectTo,
          },
        });

        if (error) {
          console.log(`❌ Erro para ${redirectTo}:`);
          console.log(`   ${error.message}`);

          if (error.message.includes("redirect_uri_mismatch")) {
            console.log(
              `   💡 Esta URL precisa estar configurada no Google Console`
            );
          }
        } else {
          console.log(`✅ URL gerada para ${redirectTo}:`);
          console.log(`   ${data.url}`);

          // Extrair o redirect_uri da URL
          const url = new URL(data.url);
          const redirectUri = url.searchParams.get("redirect_uri");
          if (redirectUri) {
            console.log(`   📍 Redirect URI extraído: ${redirectUri}`);
          }
        }
      } catch (oauthError) {
        console.log(
          `❌ Erro inesperado para ${redirectTo}: ${oauthError.message}`
        );
      }
    }

    console.log("\n📋 INSTRUÇÕES PARA CORRIGIR:");
    console.log(
      "1. Acesse o Google Console: https://console.cloud.google.com/apis/credentials"
    );
    console.log("2. Encontre o OAuth 2.0 Client ID do seu projeto");
    console.log("3. Clique em 'Editar'");
    console.log(
      "4. Na seção 'URIs de redirecionamento autorizados', adicione:"
    );
    redirectUrls.forEach((url, index) => {
      console.log(`   - ${url}`);
    });
    console.log("5. Salve as alterações");
    console.log("6. Aguarde alguns minutos para a propagação");

    console.log("\n🔗 Links úteis:");
    console.log(
      `- Google Console: https://console.cloud.google.com/apis/credentials`
    );
    console.log(
      `- Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers`
    );
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

checkRedirectUri().catch(console.error);
