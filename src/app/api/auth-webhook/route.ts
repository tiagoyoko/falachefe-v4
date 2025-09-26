import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  email_confirmed_at?: string;
  created_at: string;
}

// Função para sincronizar usuário do Auth para nossa tabela
async function syncUserFromAuth(authUser: AuthUser) {
  try {
    if (!authUser.email) {
      throw new Error("Email do usuário é obrigatório");
    }

    console.log("🔄 Sincronizando usuário do Auth:", authUser.email);

    // Verificar se já existe na nossa tabela
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, authUser.id))
      .limit(1);

    const userData = {
      id: authUser.id,
      name:
        authUser.user_metadata?.name ||
        authUser.email?.split("@")[0] ||
        "Usuário",
      email: authUser.email,
      emailVerified: !!authUser.email_confirmed_at,
      image:
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        null,
      role: "user",
      isActive: true,
      createdAt: new Date(authUser.created_at),
      updatedAt: new Date(),
    };

    if (existingUser.length > 0) {
      // Atualizar usuário existente
      await db
        .update(user)
        .set({
          name: userData.name,
          email: userData.email,
          emailVerified: userData.emailVerified,
          image: userData.image,
          updatedAt: userData.updatedAt,
        })
        .where(eq(user.id, authUser.id));

      console.log("✅ Usuário atualizado na tabela user");
    } else {
      // Criar novo usuário
      await db.insert(user).values(userData);
      console.log("✅ Novo usuário criado na tabela user");
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao sincronizar usuário do Auth:", error);
    throw error;
  }
}

// Função para remover usuário da nossa tabela
async function removeUserFromTable(userId: string) {
  try {
    console.log("🗑️ Removendo usuário da tabela user:", userId);

    await db.delete(user).where(eq(user.id, userId));

    console.log("✅ Usuário removido da tabela user");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao remover usuário da tabela:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, record } = body;

    console.log("📨 Webhook recebido:", { type, email: record?.email });

    // Verificar se é um evento do Supabase Auth
    if (!type || !type.startsWith("auth.users")) {
      return NextResponse.json(
        { error: "Evento não reconhecido" },
        { status: 400 }
      );
    }

    switch (type) {
      case "auth.users.created":
        await syncUserFromAuth(record);
        break;

      case "auth.users.updated":
        await syncUserFromAuth(record);
        break;

      case "auth.users.deleted":
        await removeUserFromTable(record.id);
        break;

      default:
        console.log("ℹ️ Evento não tratado:", type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erro no webhook de auth:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Endpoint para testar o webhook
export async function GET() {
  return NextResponse.json({
    message: "Webhook de sincronização de usuários ativo",
    endpoints: {
      POST: "Recebe eventos do Supabase Auth",
      GET: "Status do webhook",
    },
  });
}
