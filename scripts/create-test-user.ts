import { config } from "dotenv";
import { db } from "../src/lib/db";
import { user } from "../src/lib/schema";

// Carregar variáveis de ambiente
config({ path: ".env" });

async function createTestUser() {
  try {
    // Criar usuário de teste
    const testUser = await db.insert(user).values({
      id: "user_123",
      name: "Usuário Teste",
      email: "teste@exemplo.com",
      emailVerified: true,
      image: "https://via.placeholder.com/150",
    }).returning();

    console.log("✅ Usuário de teste criado:", testUser[0]);
  } catch (error) {
    console.error("❌ Erro ao criar usuário de teste:", error);
  }
}

createTestUser();
