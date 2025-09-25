require("dotenv").config();
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");

// Definir schema diretamente para evitar problemas de importação
const whatsappMessages = {
  id: "id",
  direction: "direction",
  userId: "userId",
  instanceId: "instanceId",
  chatId: "chatId",
  sender: "sender",
  receiver: "receiver",
  messageType: "messageType",
  messageText: "messageText",
  mediaType: "mediaType",
  mediaUrl: "mediaUrl",
  providerMessageId: "providerMessageId",
  raw: "raw",
  createdAt: "createdAt",
};

const userSettings = {
  userId: "userId",
  whatsappNumber: "whatsappNumber",
};

const user = {
  id: "id",
  name: "name",
  email: "email",
};

// Configuração do banco
const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  console.error("❌ POSTGRES_URL não configurado");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, {
  schema: { whatsappMessages, userSettings, user },
});

async function checkWhatsAppMessages() {
  try {
    console.log("🔍 Verificando mensagens WhatsApp no banco...\n");

    // 1. Contar total de mensagens
    const totalMessages = await db.select().from(whatsappMessages);
    console.log(`📊 Total de mensagens: ${totalMessages.length}`);

    if (totalMessages.length === 0) {
      console.log("❌ Nenhuma mensagem encontrada no banco");
      return;
    }

    // 2. Mostrar últimas 10 mensagens
    console.log("\n📱 Últimas 10 mensagens:");
    console.log("=".repeat(80));

    const recentMessages = totalMessages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    recentMessages.forEach((msg, index) => {
      const date = new Date(msg.createdAt).toLocaleString("pt-BR");
      const direction = msg.direction === "in" ? "📥" : "📤";
      const text = msg.messageText
        ? msg.messageText.substring(0, 50) + "..."
        : "Sem texto";

      console.log(`${index + 1}. ${direction} ${date}`);
      console.log(`   De: ${msg.sender || "N/A"}`);
      console.log(`   Para: ${msg.receiver || "N/A"}`);
      console.log(`   Texto: ${text}`);
      console.log(`   UserId: ${msg.userId || "N/A"}`);
      console.log(`   ChatId: ${msg.chatId || "N/A"}`);
      console.log("-".repeat(40));
    });

    // 3. Verificar usuários com WhatsApp configurado
    console.log("\n👤 Usuários com WhatsApp configurado:");
    const usersWithWhatsApp = await db
      .select({
        userId: userSettings.userId,
        whatsappNumber: userSettings.whatsappNumber,
        userName: user.name,
        userEmail: user.email,
      })
      .from(userSettings)
      .leftJoin(user, eq(userSettings.userId, user.id))
      .where(isNotNull(userSettings.whatsappNumber));

    if (usersWithWhatsApp.length === 0) {
      console.log("❌ Nenhum usuário com WhatsApp configurado");
    } else {
      usersWithWhatsApp.forEach((user, index) => {
        console.log(`${index + 1}. ${user.userName} (${user.userEmail})`);
        console.log(`   WhatsApp: ${user.whatsappNumber}`);
        console.log(`   UserId: ${user.userId}`);
        console.log("-".repeat(40));
      });
    }

    // 4. Estatísticas por direção
    const inbound = totalMessages.filter((m) => m.direction === "in").length;
    const outbound = totalMessages.filter((m) => m.direction === "out").length;

    console.log("\n📈 Estatísticas:");
    console.log(`   Mensagens recebidas: ${inbound}`);
    console.log(`   Mensagens enviadas: ${outbound}`);
    console.log(`   Total: ${totalMessages.length}`);
  } catch (error) {
    console.error("❌ Erro ao verificar mensagens:", error);
  } finally {
    await client.end();
  }
}

// Importar funções necessárias
const { eq, isNotNull } = require("drizzle-orm");

checkWhatsAppMessages();
