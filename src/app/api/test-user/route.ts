import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// POST /api/test-user - Criar usuário de teste
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    const testUserId = nanoid();
    const testEmail = email || `teste_${Date.now()}@example.com`;
    const testName = name || "Usuário Teste";

    // Verificar se já existe um usuário de teste
    const existingTestUser = await db
      .select()
      .from(user)
      .where(eq(user.email, testEmail))
      .limit(1);

    if (existingTestUser.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          user: existingTestUser[0],
          message: "Usuário de teste já existe",
        },
      });
    }

    // Criar usuário de teste
    const newUser = await db
      .insert(user)
      .values({
        id: testUserId,
        name: testName,
        email: testEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        user: newUser[0],
        message: "Usuário de teste criado com sucesso!",
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário de teste:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET /api/test-user - Listar usuários de teste
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Buscar usuários de teste (que começam com "teste" no email)
    const testUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.email, "teste@example.com")) // Buscar apenas um usuário específico
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        users: testUsers,
        message: `${testUsers.length} usuário(s) de teste encontrado(s)`,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuários de teste:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
