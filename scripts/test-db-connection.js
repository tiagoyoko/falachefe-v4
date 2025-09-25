/*
  Teste de conexão com Postgres e CRUD mínimo em ragSources
*/
const postgres = require("postgres");

async function main() {
  const connStr =
    process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!connStr) {
    throw new Error("POSTGRES_URL ou POSTGRES_URL_NON_POOLING não definido");
  }

  const sql = postgres(connStr, { ssl: "require", prepare: false });
  try {
    const ping = await sql`select 1 as ok`;
    if (!ping || !ping[0] || ping[0].ok !== 1) throw new Error("Ping falhou");

    const id = `test_${Date.now()}`;
    await sql`
      insert into "ragSources" (id, kind, label, isActive)
      values (${id}, ${"manual"}, ${"Teste DB"}, ${true})
    `;

    const rows = await sql`select * from "ragSources" where id = ${id}`;
    if (!rows || rows.length !== 1)
      throw new Error("Insert/Select falhou em ragSources");

    await sql`delete from "ragSources" where id = ${id}`;
    console.log("DB OK: ping/select/insert/delete em ragSources");
  } finally {
    await sql.end({ timeout: 1 });
  }
}

main().catch((e) => {
  console.error("DB TEST ERROR:", e);
  process.exit(1);
});
