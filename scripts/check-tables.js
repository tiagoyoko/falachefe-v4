const { Pool } = require("pg");

async function checkTables() {
  const pool = new Pool({
    connectionString: (
      process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
    ).replace("sslmode=require", "sslmode=disable"),
    ssl: false,
  });

  try {
    const client = await pool.connect();

    // Verificar tabelas existentes
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("📋 Tabelas existentes no banco:");
    result.rows.forEach((row) => console.log(`  ✅ ${row.table_name}`));

    // Verificar se as tabelas do onboarding existem
    const onboardingTables = [
      "companies",
      "onboardingPreferences",
      "categories",
    ];
    const existingTables = result.rows.map((row) => row.table_name);

    console.log("\n🔍 Verificação das tabelas do onboarding:");
    onboardingTables.forEach((table) => {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table} - OK`);
      } else {
        console.log(`  ❌ ${table} - FALTANDO`);
      }
    });

    // Verificar estrutura da tabela user
    const userTable = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      ORDER BY ordinal_position
    `);

    console.log("\n👤 Estrutura da tabela user:");
    userTable.rows.forEach((row) => {
      console.log(
        `  ${row.column_name}: ${row.data_type} ${row.is_nullable === "NO" ? "(NOT NULL)" : "(NULL)"} ${row.column_default ? `DEFAULT ${row.column_default}` : ""}`
      );
    });

    client.release();
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
