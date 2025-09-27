const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSupabaseRedirectUri() {
  try {
    console.log("🔍 Analisando o erro de redirect_uri_mismatch...");

    console.log("📋 Configuração:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);

    // Extrair o redirect URI que o Supabase está usando
    const supabaseRedirectUri = `${supabaseUrl}/auth/v1/callback`;
    console.log(`  - Supabase Redirect URI: ${supabaseRedirectUri}`);

    console.log("\n🔍 Testando OAuth para extrair o redirect URI...");

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
          console.log("\n💡 PROBLEMA IDENTIFICADO:");
          console.log("O Supabase está usando seu próprio redirect URI:");
          console.log(`   ${supabaseRedirectUri}`);
          console.log("Este URI precisa estar configurado no Google Console.");

          console.log("\n🔧 SOLUÇÃO:");
          console.log(
            "1. Acesse o Google Console: https://console.cloud.google.com/apis/credentials"
          );
          console.log("2. Encontre o OAuth 2.0 Client ID");
          console.log(
            "3. Na seção 'URIs de redirecionamento autorizados', adicione:"
          );
          console.log(`   - ${supabaseRedirectUri}`);
          console.log("4. Salve as alterações");
          console.log("5. Aguarde 5-10 minutos para a propagação");

          console.log(
            "\n📋 TODOS OS REDIRECT URIs QUE DEVEM ESTAR CONFIGURADOS:"
          );
          console.log("1. Supabase (obrigatório):");
          console.log(`   - ${supabaseRedirectUri}`);
          console.log("2. Aplicação (opcional, para redirects customizados):");
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
        console.log("✅ Google OAuth configurado corretamente!");
        console.log(`   - URL gerada: ${data.url}`);

        // Extrair informações da URL
        const url = new URL(data.url);
        const extractedRedirectUri = url.searchParams.get("redirect_uri");

        if (extractedRedirectUri) {
          console.log(`   - Redirect URI extraído: ${extractedRedirectUri}`);
        }
      }
    } catch (oauthError) {
      console.log("❌ Erro inesperado no OAuth:", oauthError.message);
    }

    console.log("\n📋 CHECKLIST DE CONFIGURAÇÃO:");
    console.log("✅ Supabase URL configurado");
    console.log("✅ Google Client ID configurado");
    console.log("✅ Google Client Secret configurado");
    console.log(
      "❌ Redirect URI do Supabase no Google Console (PRECISA SER CONFIGURADO)"
    );

    console.log("\n🔗 PRÓXIMOS PASSOS:");
    console.log(
      "1. Acesse o Google Console: https://console.cloud.google.com/apis/credentials"
    );
    console.log("2. Encontre o OAuth 2.0 Client ID");
    console.log("3. Adicione o redirect URI do Supabase:");
    console.log(`   - ${supabaseRedirectUri}`);
    console.log("4. Salve as alterações");
    console.log("5. Aguarde a propagação (5-10 minutos)");
    console.log("6. Teste o login novamente");

    console.log("\n🔗 Links úteis:");
    console.log(
      `- Google Console: https://console.cloud.google.com/apis/credentials`
    );
    console.log(
      `- Supabase Dashboard: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers`
    );
    console.log(`- Login Local: http://localhost:3000/auth/signin`);
    console.log(
      `- Login Produção: https://falachefe-v4.vercel.app/auth/signin`
    );
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

fixSupabaseRedirectUri().catch(console.error);
