import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-client";
import { agentManagementService } from "@/lib/agent-management-service";

// GET /api/admin/agents - Listar todos os agentes
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const agents = await agentManagementService.listAgents(
      session.data.user.id
    );

    return NextResponse.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error("Erro ao listar agentes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/agents - Criar novo agente
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, displayName, description, tone, capabilities } = body;

    // Validação básica
    if (!name || !displayName || !description || !tone) {
      return NextResponse.json(
        {
          success: false,
          error: "Campos obrigatórios: name, displayName, description, tone",
        },
        { status: 400 }
      );
    }

    const agent = await agentManagementService.createAgent(
      {
        name,
        displayName,
        description,
        tone,
        capabilities,
      },
      session.data.user.id
    );

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error("Erro ao criar agente:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
