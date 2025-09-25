import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { agentProfiles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(agentProfiles)
      .where(eq(agentProfiles.userId, user.id));

    return NextResponse.json({ success: true, data: rows });
  } catch (e) {
    console.error("Erro ao listar configurações de agentes:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { agent, settings } = body;

    if (!agent || typeof agent !== "string") {
      return NextResponse.json(
        { error: "agent é obrigatório" },
        { status: 400 }
      );
    }

    const payload = {
      enabled: Boolean(settings?.enabled ?? true),
      tone: settings?.tone ?? "",
      goals: settings?.goals ?? "",
      fallbackPrompt: settings?.fallbackPrompt ?? "",
      customSystemPrompt: settings?.customSystemPrompt ?? "",
      ragEnabled: Boolean(settings?.ragEnabled ?? true),
      ragSources: settings?.ragSources ?? "",
    };

    await db
      .insert(agentProfiles)
      .values({
        id: nanoid(),
        userId: user.id,
        agent,
        settings: payload,
      })
      .onConflictDoUpdate({
        target: [agentProfiles.userId, agentProfiles.agent],
        set: {
          settings: payload,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erro ao atualizar configuração de agente:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
