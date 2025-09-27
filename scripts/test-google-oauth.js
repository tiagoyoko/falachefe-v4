const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGoogleOAuth() {
  try {
    console.log("🧪 Testando configuração do Google OAuth...");

    console.log("📋 Configuração atual:");
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(`  - App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    console.log(`  - Google Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
    console.log(
      `  - Google Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? "***configurado***" : "❌ não configurado"}`
    );

    // Testar se o Supabase está acessível
    console.log("\n🔍 Testando conexão com Supabase...");
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log("❌ Erro ao conectar com Supabase:", sessionError.message);
    } else {
      console.log("✅ Conexão com Supabase OK");
    }

    // Verificar se o Google OAuth está configurado no Supabase
    console.log("\n🔍 Verificando configuração do Google OAuth...");

    // Tentar fazer uma requisição OAuth (isso vai falhar, mas nos dará informações sobre a configuração)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        console.log("❌ Erro no OAuth:", error.message);

        if (error.message.includes("Invalid login credentials")) {
          console.log("\n💡 Possíveis soluções:");
          console.log(
            "1. Verificar se o Google OAuth está habilitado no Supabase Dashboard"
          );
          console.log(
            "2. Verificar se as credenciais do Google estão corretas"
          );
          console.log(
            "3. Verificar se o redirectTo está configurado corretamente"
          );
          console.log(
            "4. Verificar se o domínio está autorizado no Google Console"
          );
        }
      } else {
        console.log("✅ OAuth configurado corretamente");
      }
    } catch (oauthError) {
      console.log("❌ Erro ao testar OAuth:", oauthError.message);
    }

    console.log("\n📋 Instruções para configurar Google OAuth:");
    console.log("1. Acesse o Supabase Dashboard");
    console.log("2. Vá para Authentication > Providers");
    console.log("3. Habilite o Google Provider");
    console.log("4. Configure:");
    console.log(`   - Client ID: ${process.env.GOOGLE_CLIENT_ID}`);
    console.log(`   - Client Secret: ${process.env.GOOGLE_CLIENT_SECRET}`);
    console.log(
      `   - Redirect URL: ${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    );
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

testGoogleOAuth().catch(console.error);
