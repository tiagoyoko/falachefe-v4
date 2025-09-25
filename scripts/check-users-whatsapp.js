const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
require("dotenv").config();

(async () => {
  try {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      console.log("POSTGRES_URL ausente no .env");
      process.exit(1);
    }

    const sql = postgres(connectionString, { prepare: true });
    const rows = await sql`
      SELECT "userId", "whatsappNumber", "updatedAt"
      FROM "userSettings"
      ORDER BY "updatedAt" DESC
      LIMIT 20;
    `;

    console.log(`Encontrados ${rows.length} registros em userSettings:`);
    rows.forEach((r, i) => {
      console.log(
        `${i + 1}. userId=${r.userId} whatsappNumber=${r.whatsappNumber} updatedAt=${new Date(
          r.updatedAt
        ).toLocaleString("pt-BR")}`
      );
    });

    await sql.end({ timeout: 5 });
  } catch (e) {
    console.error("Erro:", e.message);
    process.exit(1);
  }
})();
