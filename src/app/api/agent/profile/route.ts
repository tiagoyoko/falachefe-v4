import { NextRequest, NextResponse } from "next/server";
import { agentProfileService } from "@/lib/agent-profile-service";
import { getSession } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agent = searchParams.get("agent");

    if (!agent) {
      return NextResponse.json({ error: "Agente é obrigatório" }, { status: 400 });
    }

    const profile = await agentProfileService.getOrCreateProfile(session.user.id, agent);
    const stats = await agentProfileService.getAgentStats(session.user.id, agent);

    return NextResponse.json({
      profile,
      stats,
    });
  } catch (error) {
    console.error("Erro ao obter perfil do agente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { agent, settings } = body;

    if (!agent) {
      return NextResponse.json({ error: "Agente é obrigatório" }, { status: 400 });
    }

    if (!settings) {
      return NextResponse.json({ error: "Configurações são obrigatórias" }, { status: 400 });
    }

    const updatedProfile = await agentProfileService.updateProfile(
      session.user.id,
      agent,
      settings
    );

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Erro ao atualizar perfil do agente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { agent, settings } = body;

    if (!agent) {
      return NextResponse.json({ error: "Agente é obrigatório" }, { status: 400 });
    }

    const profile = await agentProfileService.getOrCreateProfile(
      session.user.id,
      agent,
      settings
    );

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro ao criar perfil do agente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
