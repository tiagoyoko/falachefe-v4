import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { agentManagementService } from "@/lib/agent-management-service";

// POST /api/admin/agents/[id]/toggle - Ativar/Desativar agente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const agent = await agentManagementService.toggleAgentStatus(id, user.id);

    return NextResponse.json({
      success: true,
      data: agent,
      message: agent.isActive ? "Agente ativado" : "Agente desativado",
    });
  } catch (error) {
    console.error("Erro ao alterar status do agente:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
