/*
  Teste de conexão com Postgres (pooler) usando 'pg' e CRUD mínimo em ragSources
*/
const { Client } = require("pg");

async function main() {
  const connStr = process.env.POSTGRES_URL;
  if (!connStr) throw new Error("POSTGRES_URL não definido");

  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const ping = await client.query("select 1 as ok");
    if (!ping.rows || ping.rows[0].ok !== 1) throw new Error("Ping falhou");

    const id = "test_" + Date.now();
    await client.query(
      'insert into "ragSources" (id, kind, label, isActive) values ($1, $2, $3, $4)',
      [id, "manual", "Teste PG", true]
    );

    const sel = await client.query(
      'select id, kind, label from "ragSources" where id = $1',
      [id]
    );
    if (!sel.rows || sel.rows.length !== 1)
      throw new Error("Insert/Select falhou");

    await client.query('delete from "ragSources" where id = $1', [id]);
    console.log("PG OK: ping/select/insert/delete em ragSources");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("PG TEST ERROR:", e);
  process.exit(1);
});
