require("dotenv").config();
const postgres = require("postgres");

async function checkMessagesDirect() {
  console.log("🔍 Verificando mensagens WhatsApp diretamente...\n");

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("❌ POSTGRES_URL não configurado");
    process.exit(1);
  }

  const client = postgres(connectionString, {
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Contar total de mensagens
    const totalResult = await client`SELECT COUNT(*) as count FROM "whatsappMessages"`;
    const totalMessages = parseInt(totalResult[0].count);
    
    console.log(`📊 Total de mensagens: ${totalMessages}`);

    if (totalMessages === 0) {
      console.log("❌ Nenhuma mensagem encontrada no banco");
      return;
    }

    // Mostrar últimas 10 mensagens
    console.log("\n📱 Últimas 10 mensagens:");
    console.log("=".repeat(80));

    const recentMessages = await client`
      SELECT * FROM "whatsappMessages" 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `;

    recentMessages.forEach((msg, index) => {
      const date = new Date(msg.createdAt).toLocaleString("pt-BR");
      const direction = msg.direction === "in" ? "📥" : "📤";
      const text = msg.messageText
        ? msg.messageText.substring(0, 50) + "..."
        : "Sem texto";

      console.log(`${index + 1}. ${direction} ${date}`);
      console.log(`   ID: ${msg.id}`);
      console.log(`   De: ${msg.sender || "N/A"}`);
      console.log(`   Para: ${msg.receiver || "N/A"}`);
      console.log(`   Texto: ${text}`);
      console.log(`   UserId: ${msg.userId || "N/A"}`);
      console.log(`   ChatId: ${msg.chatId || "N/A"}`);
      console.log(`   Tipo: ${msg.messageType || "N/A"}`);
      console.log(`   InstanceId: ${msg.instanceId || "N/A"}`);
      console.log("-".repeat(40));
    });

    // Estatísticas por direção
    const inboundResult = await client`SELECT COUNT(*) as count FROM "whatsappMessages" WHERE "direction" = 'in'`;
    const outboundResult = await client`SELECT COUNT(*) as count FROM "whatsappMessages" WHERE "direction" = 'out'`;
    
    const inbound = parseInt(inboundResult[0].count);
    const outbound = parseInt(outboundResult[0].count);

    console.log("\n📈 Estatísticas:");
    console.log(`   Mensagens recebidas: ${inbound}`);
    console.log(`   Mensagens enviadas: ${outbound}`);
    console.log(`   Total: ${totalMessages}`);

    // Verificar mensagens por tipo
    const messageTypes = await client`
      SELECT "messageType", COUNT(*) as count 
      FROM "whatsappMessages" 
      GROUP BY "messageType" 
      ORDER BY count DESC
    `;

    console.log("\n📊 Mensagens por tipo:");
    messageTypes.forEach(type => {
      console.log(`   ${type.messageType || 'N/A'}: ${type.count}`);
    });

  } catch (error) {
    console.error("❌ Erro ao verificar mensagens:", error.message);
  } finally {
    await client.end();
  }
}

checkMessagesDirect().catch(console.error);



