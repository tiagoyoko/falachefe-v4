/*
  Ingestão RAG (Financeiro BR) direto no Postgres + OpenAI Embeddings
  Uso:
    node -r dotenv/config scripts/ingest-finance-content.js SEU_USER_ID dotenv_config_path=.env
  Obs: usa POSTGRES_URL e OPENAI_API_KEY do ambiente.
*/
const { Client } = require("pg");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 21);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";
const POSTGRES_URL = process.env.POSTGRES_URL;

if (!OPENAI_API_KEY) {
  console.error("Faltando OPENAI_API_KEY no ambiente");
  process.exit(1);
}
if (!POSTGRES_URL) {
  console.error("Faltando POSTGRES_URL no ambiente");
  process.exit(1);
}

const rawUserId = process.argv[2];
const userId =
  typeof rawUserId === "string" && rawUserId.trim().length > 0
    ? rawUserId.trim()
    : null;
const label = "Base Financeiro BR - Fala Chefe";
const tags = ["financeiro", "brasil", "pme"];
const texts = [
  "Fluxo de caixa é o controle de entradas e saídas de dinheiro em um período. Para pequenas empresas, o essencial é registrar diariamente vendas (entradas) e despesas (saídas), separar contas fixas (aluguel, salários) e variáveis (insumos), e acompanhar o saldo projetado para evitar falta de caixa. Boas práticas: conciliação bancária semanal, metas de recebimento, negociar prazos com fornecedores e manter reserva de emergência (1–3 meses de custos).",
  "Capital de giro é o dinheiro necessário para manter a operação (compras, estoque, salários) até receber dos clientes. Calcule estimando o ciclo financeiro: prazos médios de compra (fornecedores), estocagem (dias de estoque), venda e recebimento (prazo de clientes). Se o prazo para receber é maior que o para pagar, você precisa de capital de giro ou ajustar prazos. Evite financiar giro com cheque especial; prefira antecipação de recebíveis com custo menor.",
  "Margem de contribuição = preço de venda – custos e despesas variáveis. Ela mostra quanto sobra para cobrir custos fixos e gerar lucro. Para aumentar: suba preço com percepção de valor (embalagem, atendimento), reduza custo variável (negociação de insumos) e ataque desperdícios. Ponto de equilíbrio = custos fixos / margem de contribuição unitária.",
  "Precificação base no Brasil: preço mínimo deve cobrir custos variáveis, parcela de custos fixos, impostos e margem de lucro. Em regimes como Simples Nacional, considere a alíquota efetiva (faixa + fator r) e a incidência sobre o faturamento. Fórmula prática: Preço = (Custo Variável + Rateio de Fixo + Lucro desejado) / (1 – Alíquota de impostos sobre receita). Valide com mercado (concorrência e valor percebido).",
  "DRE simplificada (Demonstração do Resultado): Receita Bruta – Deduções/Impostos = Receita Líquida; – Custos Variáveis = Margem de Contribuição; – Custos Fixos = Lucro Operacional; – Despesas/Outros = Lucro Líquido. Use mensalmente para acompanhar eficiência. Se a margem de contribuição não cobre fixos, ajuste preço, mix ou custos.",
  "Contas a receber: padronize meios (PIX, cartão, boleto), ofereça descontos para pagamento à vista, e automatize cobranças (lembretes no WhatsApp). Contas a pagar: centralize vencimentos, negocie prazos/juros, e priorize pagamentos críticos (fornecedores-chave, folha). Evite atrasos (multas corroem margem).",
  "Conciliação bancária: compare extrato com registros (vendas/boletos/PIX) para achar divergências (lançamentos duplicados, taxas não registradas). Faça semanalmente. Use categorias padronizadas para relatórios (Marketing, Fornecedores, Operacionais, etc.).",
  "Simples Nacional (visão prática): imposto único sobre o faturamento com alíquotas por faixa e anexo. Atenção ao fator r (folha/receita) que pode mudar anexo em serviços. Planeje faturamento para não saltar de faixa sem preparo. Guarde provisão de impostos, evitando usar o caixa do dia a dia.",
  "Pró-labore x distribuição de lucros: pró-labore é remuneração do sócio (sofre INSS/IR conforme regras), distribuição de lucros é isenta até o limite do lucro contábil. Defina pró-labore mínimo viável e evite misturar finanças pessoais e da empresa. Use conta separada e políticas de retirada.",
  "Ciclo de caixa e sazonalidade: mapeie períodos fortes/fracos (ex.: datas comemorativas) e ajuste compras/estoque. Faça projeção de 12 semanas: entradas previstas (vendas + recebimentos) e saídas (fixos + variáveis + impostos). Antecipe déficits com negociação de prazos ou campanhas de venda.",
];

function chunkText(text, maxLen = 1000) {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const chunks = [];
  for (let i = 0; i < cleaned.length; i += maxLen)
    chunks.push(cleaned.slice(i, i + maxLen));
  return chunks;
}

async function embed(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Embedding falhou: ${res.status} ${t}`);
  }
  const json = await res.json();
  const vec = json?.data?.[0]?.embedding || [];
  const model = json?.model || EMBEDDING_MODEL;
  return { vec, model, dims: vec.length };
}

async function main() {
  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  let docs = 0;
  let chunksTotal = 0;
  const sourceId = nanoid();
  try {
    await client.query(
      'insert into "ragSources" (id, "userId", kind, label, url, tags, "isActive", "createdAt", "updatedAt") values ($1,$2,$3,$4,$5,$6,$7, now(), now())',
      [sourceId, userId, "manual", label, null, JSON.stringify(tags), true]
    );

    for (const t of texts) {
      const docId = nanoid();
      await client.query(
        'insert into "ragDocuments" (id, "sourceId", title, url, lang, tags, "createdAt", "updatedAt") values ($1,$2,$3,$4,$5,$6, now(), now())',
        [docId, sourceId, label, null, "pt-BR", JSON.stringify(tags)]
      );
      docs++;

      const parts = chunkText(t);
      for (let idx = 0; idx < parts.length; idx++) {
        const content = parts[idx];
        const chunkId = nanoid();
        await client.query(
          'insert into "ragChunks" (id, "documentId", idx, content, "createdAt") values ($1,$2,$3,$4, now())',
          [chunkId, docId, idx, content]
        );

        const { vec, model, dims } = await embed(content);
        await client.query(
          'insert into "ragEmbeddings" (id, "chunkId", embedding, model, dims, "createdAt") values ($1,$2,$3,$4,$5, now())',
          [nanoid(), chunkId, JSON.stringify(vec), model, dims]
        );
        chunksTotal++;
      }
    }

    console.log(
      JSON.stringify({
        success: true,
        sourceId,
        documents: docs,
        chunks: chunksTotal,
      })
    );
  } catch (e) {
    console.error("INGEST ERROR:", e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
