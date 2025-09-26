const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserSync() {
  try {
    console.log("🧪 Testando sistema de sincronização de usuários...");

    // 1. Verificar status atual
    console.log("\n1️⃣ Verificando status atual...");
    const statusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/user-sync`
    );

    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log("📊 Status da sincronização:");
      console.log(`  - Total Auth Users: ${status.data.totalAuthUsers}`);
      console.log(`  - Total DB Users: ${status.data.totalDbUsers}`);
      console.log(`  - Órfãos no Auth: ${status.data.missingInDb.length}`);
      console.log(`  - Órfãos na DB: ${status.data.missingInAuth.length}`);
      console.log(`  - Sincronizado: ${status.data.isSynced ? "Sim" : "Não"}`);

      if (status.data.missingInDb.length > 0) {
        console.log("\n👥 Usuários órfãos no Auth:");
        status.data.missingInDb.forEach((user) => {
          console.log(`  - ${user.email} (${user.id})`);
        });
      }

      if (status.data.missingInAuth.length > 0) {
        console.log("\n👥 Usuários órfãos na DB:");
        status.data.missingInAuth.forEach((user) => {
          console.log(`  - ${user.email} (${user.id})`);
        });
      }
    } else {
      console.log("❌ Erro ao verificar status:", statusResponse.status);
    }

    // 2. Testar sincronização de usuários órfãos
    console.log("\n2️⃣ Testando sincronização de usuários órfãos...");
    const syncResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/user-sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "sync-orphaned" }),
      }
    );

    if (syncResponse.ok) {
      const syncResult = await syncResponse.json();
      console.log("✅ Sincronização concluída:");
      console.log(`  - Usuários sincronizados: ${syncResult.data.synced}`);
      console.log(`  - Usuários removidos: ${syncResult.data.removed}`);
    } else {
      console.log("❌ Erro na sincronização:", syncResponse.status);
    }

    // 3. Verificar status após sincronização
    console.log("\n3️⃣ Verificando status após sincronização...");
    const finalStatusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/user-sync`
    );

    if (finalStatusResponse.ok) {
      const finalStatus = await finalStatusResponse.json();
      console.log("📊 Status final:");
      console.log(`  - Total Auth Users: ${finalStatus.data.totalAuthUsers}`);
      console.log(`  - Total DB Users: ${finalStatus.data.totalDbUsers}`);
      console.log(`  - Órfãos no Auth: ${finalStatus.data.missingInDb.length}`);
      console.log(`  - Órfãos na DB: ${finalStatus.data.missingInAuth.length}`);
      console.log(
        `  - Sincronizado: ${finalStatus.data.isSynced ? "Sim" : "Não"}`
      );

      if (finalStatus.data.isSynced) {
        console.log(
          "\n🎉 Sincronização perfeita! Todos os usuários estão sincronizados."
        );
      } else {
        console.log("\n⚠️ Ainda há usuários órfãos. Verifique a configuração.");
      }
    }

    // 4. Testar criação de usuário
    console.log("\n4️⃣ Testando criação de usuário...");
    const testEmail = `teste_sync_${Date.now()}@example.com`;
    const testPassword = "123456";

    const { data: signupData, error: signupError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      }
    );

    if (signupError) {
      console.log("❌ Erro ao criar usuário de teste:", signupError.message);
    } else {
      console.log("✅ Usuário de teste criado:", signupData.user?.email);

      // Aguardar um momento para o webhook processar
      console.log("⏳ Aguardando processamento do webhook...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Verificar se foi sincronizado
      const { data: dbUsers, error: dbError } = await supabase
        .from("user")
        .select("*")
        .eq("email", testEmail);

      if (dbError) {
        console.log("❌ Erro ao verificar usuário na DB:", dbError.message);
      } else if (dbUsers.length > 0) {
        console.log("✅ Usuário foi sincronizado automaticamente!");
        console.log(`  - ID: ${dbUsers[0].id}`);
        console.log(`  - Nome: ${dbUsers[0].name}`);
        console.log(`  - Email: ${dbUsers[0].email}`);
      } else {
        console.log("⚠️ Usuário não foi sincronizado automaticamente");
      }

      // Limpar usuário de teste
      console.log("\n🧹 Limpando usuário de teste...");
      if (signupData.user?.id) {
        await supabase.auth.admin.deleteUser(signupData.user.id);
        console.log("✅ Usuário de teste removido");
      }
    }

    console.log("\n✅ Teste de sincronização concluído!");
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

testUserSync().catch(console.error);
