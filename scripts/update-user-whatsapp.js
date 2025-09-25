const postgres = require("postgres");
require("dotenv").config();

async function run() {
  const connectionString = process.env.POSTGRES_URL;
  const targetUserId = process.env.TEST_USER_ID;
  const phone = process.env.TEST_WHATSAPP_NUMBER; // ex: 5511999999999

  if (!connectionString) {
    console.error("POSTGRES_URL ausente no .env");
    process.exit(1);
  }
  if (!targetUserId || !phone) {
    console.error("Defina TEST_USER_ID e TEST_WHATSAPP_NUMBER no .env");
    process.exit(1);
  }

  const sql = postgres(connectionString, { prepare: true });
  try {
    const updated = await sql`
      INSERT INTO "userSettings" ("id", "userId", "whatsappNumber", "currency", "timezone", "createdAt", "updatedAt")
      VALUES (${`${targetUserId}-settings`}, ${targetUserId}, ${phone}, 'BRL', 'America/Sao_Paulo', NOW(), NOW())
      ON CONFLICT ("id") DO UPDATE SET "whatsappNumber" = EXCLUDED."whatsappNumber", "updatedAt" = NOW()
      RETURNING *;
    `;
    console.log("Atualizado:", updated[0]);
  } catch (e) {
    console.error("Erro ao atualizar:", e.message);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
