const { Pool } = require("pg");
const fs = require("fs");

async function applyOnboardingFix() {
  // Ler o arquivo SQL
  const sqlScript = fs.readFileSync(
    "./scripts/fix-onboarding-tables.sql",
    "utf8"
  );

  const pool = new Pool({
    connectionString:
      process.env.POSTGRES_URL_NON_POOLING?.replace(
        "sslmode=require",
        "sslmode=disable"
      ) ||
      process.env.POSTGRES_URL?.replace("sslmode=require", "sslmode=disable"),
    ssl: false,
  });

  try {
    const client = await pool.connect();

    console.log("🔧 Aplicando correções nas tabelas do onboarding...");

    // Executar o script SQL
    await client.query(sqlScript);

    console.log("✅ Correções aplicadas com sucesso!");

    // Verificar o resultado
    const result = await client.query(`
      SELECT 
        'companies' as tabela,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') 
             THEN '✅ Existe' 
             ELSE '❌ Não existe' 
        END as status
      UNION ALL
      SELECT 
        'onboardingPreferences' as tabela,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'onboardingPreferences') 
             THEN '✅ Existe' 
             ELSE '❌ Não existe' 
        END as status
      UNION ALL
      SELECT 
        'user (role)' as tabela,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'role') 
             THEN '✅ Existe' 
             ELSE '❌ Não existe' 
        END as status
      UNION ALL
      SELECT 
        'user (isActive)' as tabela,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'isActive') 
             THEN '✅ Existe' 
             ELSE '❌ Não existe' 
        END as status
    `);

    console.log("\n📊 Status das tabelas:");
    result.rows.forEach((row) => {
      console.log(`  ${row.tabela}: ${row.status}`);
    });

    client.release();
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await pool.end();
  }
}

applyOnboardingFix();
