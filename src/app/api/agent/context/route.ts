import { NextRequest, NextResponse } from "next/server";
import { agentProfileService } from "@/lib/agent-profile-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agent = searchParams.get("agent");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!agent) {
      return NextResponse.json({ error: "Agente é obrigatório" }, { status: 400 });
    }

    const context = await agentProfileService.getConversationContext(
      session.user.id,
      agent,
      limit
    );

    return NextResponse.json(context);
  } catch (error) {
    console.error("Erro ao obter contexto da conversa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, role, content, metadata } = body;

    if (!sessionId || !role || !content) {
      return NextResponse.json(
        { error: "sessionId, role e content são obrigatórios" },
        { status: 400 }
      );
    }

    if (!["user", "assistant"].includes(role)) {
      return NextResponse.json(
        { error: "role deve ser 'user' ou 'assistant'" },
        { status: 400 }
      );
    }

    await agentProfileService.saveMessage(sessionId, role, content, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
