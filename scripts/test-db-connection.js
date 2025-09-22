/* eslint-disable */
require("dotenv").config();
const { Client } = require("pg");

(async () => {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    console.error("POSTGRES_URL não definido no ambiente.");
    process.exit(1);
  }
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
    );
    const tables = res.rows.map((r) => r.table_name);
    console.log(JSON.stringify({ tables }, null, 2));
  } catch (e) {
    console.error("Falha ao consultar o banco:", e.message);
    process.exit(2);
  } finally {
    await client.end();
  }
})();
