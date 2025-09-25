import { NextRequest, NextResponse } from "next/server";
import { whatsappConversationManager } from "@/lib/whatsapp-conversation-manager";

// Handler genérico para eventos da Uazapi (messages, messages_update, connection, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Estrutura base esperada (conforme docs): { event, instance, data }
    const event = body?.event || "unknown";
    const instanceId = body?.instance || body?.instance_id || "";

    console.log("[UAZAPI Webhook] Evento recebido:", { event, instanceId });

    // Processar apenas eventos de mensagem
    if (event === "message" || event === "messages") {
      await whatsappConversationManager.processIncomingMessage(body);
    }

    return NextResponse.json({ received: true, event }, { status: 200 });
  } catch (error) {
    console.error("Erro no webhook Uazapi:", error);
    return NextResponse.json(
      { error: "Failed to process webhook data" },
      { status: 400 }
    );
  }
}

// GET opcional para verificação simples
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
