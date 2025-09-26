import { NextRequest, NextResponse } from "next/server";
import {
  syncOrphanedUsers,
  getSyncStatus,
  syncUserFromAuth,
  removeUserFromTable,
} from "@/lib/user-sync";

// GET /api/user-sync - Verificar status da sincronização
export async function GET() {
  try {
    const status = await getSyncStatus();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Erro ao verificar status da sincronização:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/user-sync - Sincronizar usuários órfãos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "sync-orphaned":
        const result = await syncOrphanedUsers();
        return NextResponse.json({
          success: true,
          message: "Sincronização concluída",
          data: result,
        });

      case "sync-user":
        const { userId } = body;
        if (!userId) {
          return NextResponse.json(
            { error: "userId é obrigatório" },
            { status: 400 }
          );
        }

        // Buscar usuário no Supabase Auth
        const { createClient } = await import("@/lib/supabase-server");
        const supabase = await createClient();
        const { data: authUsers, error: authError } =
          await supabase.auth.admin.listUsers();

        if (authError) {
          throw new Error(`Erro ao listar usuários: ${authError.message}`);
        }

        const authUser = authUsers.users.find((u: { id: string; email?: string }) => u.id === userId);
        if (!authUser) {
          return NextResponse.json(
            { error: "Usuário não encontrado no Supabase Auth" },
            { status: 404 }
          );
        }

        await syncUserFromAuth(authUser);
        return NextResponse.json({
          success: true,
          message: "Usuário sincronizado com sucesso",
        });

      case "remove-user":
        const { userId: removeUserId } = body;
        if (!removeUserId) {
          return NextResponse.json(
            { error: "userId é obrigatório" },
            { status: 400 }
          );
        }

        await removeUserFromTable(removeUserId);
        return NextResponse.json({
          success: true,
          message: "Usuário removido com sucesso",
        });

      default:
        return NextResponse.json(
          { error: "Ação não reconhecida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
