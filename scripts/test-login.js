const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  try {
    console.log("🧪 Testando login com email e senha...");
    
    // Testar com um usuário existente
    const testEmail = "tiagoyoko@outlook.com";
    const testPassword = "123456"; // Senha de teste
    
    console.log(`📧 Tentando login com: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.log("❌ Erro no login:", error.message);
      
      if (error.message.includes("Invalid login credentials")) {
        console.log("\n💡 Possíveis causas:");
        console.log("1. Email ou senha incorretos");
        console.log("2. Usuário não confirmado");
        console.log("3. Usuário não existe");
        
        // Verificar se o usuário existe
        console.log("\n🔍 Verificando se o usuário existe...");
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.log("❌ Erro ao listar usuários:", listError.message);
        } else {
          const user = users.users.find(u => u.email === testEmail);
          if (user) {
            console.log("✅ Usuário encontrado no Supabase Auth");
            console.log(`   - ID: ${user.id}`);
            console.log(`   - Email: ${user.email}`);
            console.log(`   - Email confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
            console.log(`   - Criado em: ${user.created_at}`);
          } else {
            console.log("❌ Usuário não encontrado no Supabase Auth");
          }
        }
      }
    } else {
      console.log("✅ Login realizado com sucesso!");
      console.log(`   - User ID: ${data.user?.id}`);
      console.log(`   - Email: ${data.user?.email}`);
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

testLogin().catch(console.error);
