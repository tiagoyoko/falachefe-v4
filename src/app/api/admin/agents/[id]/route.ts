import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-client";
import { agentManagementService } from "@/lib/agent-management-service";

// GET /api/admin/agents/[id] - Obter agente específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const agent = await agentManagementService.getAgent(
      params.id,
      session.data.user.id
    );

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error("Erro ao obter agente:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/agents/[id] - Atualizar agente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, description, tone, capabilities, isActive } = body;

    const agent = await agentManagementService.updateAgent(
      params.id,
      {
        displayName,
        description,
        tone,
        capabilities,
        isActive,
      },
      session.data.user.id
    );

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error("Erro ao atualizar agente:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/agents/[id] - Deletar agente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    await agentManagementService.deleteAgent(params.id, session.data.user.id);

    return NextResponse.json({
      success: true,
      message: "Agente deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar agente:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
