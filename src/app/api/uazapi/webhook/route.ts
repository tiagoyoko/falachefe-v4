import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSettings, whatsappMessages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { llmService } from "@/lib/llm-service";
import { getUazapiService } from "@/lib/uazapi-service";
import { nanoid } from "nanoid";

// Handler genérico para eventos da Uazapi (messages, messages_update, connection, etc.)
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const eventFromPath = url.pathname
      .split("/uazapi/webhook")[1]
      ?.replace(/^\//, "");
    const body = await request.json().catch(() => ({}));

    // Estrutura base esperada (conforme docs): { event, instance, data }
    const event = (body?.event as string) || eventFromPath || "unknown";
    const instanceId = body?.instance || body?.instance_id || "";
    const data = body?.data ?? body;

    // Roteamento básico para mensagens de texto
    if (event === "message" || event === "messages") {
      const isFromMe = Boolean(data?.wasSentByApi || data?.fromMe);
      const messageType = data?.messageType || data?.type || "";
      const text: string | undefined =
        data?.text || data?.body || data?.message?.text || data?.caption;

      // Parser robusto de identificadores
      const rawFrom: string =
        data?.sender || data?.from || data?.author || data?.participant || "";
      const rawChatId: string = data?.chatid || data?.chatId || data?.id || "";
      const providerMessageId: string =
        data?.messageid || data?.key?.id || data?.id || "";
      const instance = instanceId || data?.instance || data?.instance_id || "";

      const numberOnly = (rawFrom.match(/\d+/g) || []).join("");
      const chatId =
        rawChatId || (numberOnly ? `${numberOnly}@s.whatsapp.net` : "");

      // Persistência (inbound)
      try {
        await db.insert(whatsappMessages).values({
          id: nanoid(),
          direction: "in",
          userId: null,
          instanceId: instance,
          chatId,
          sender: rawFrom,
          receiver: null,
          messageType,
          messageText: typeof text === "string" ? text : null,
          mediaType: (data?.mediaType || data?.mimetype) ?? null,
          mediaUrl: (data?.file || data?.url) ?? null,
          providerMessageId,
          raw: data || {},
        });
      } catch (e) {
        console.warn("Falha ao persistir mensagem inbound:", e);
      }

      // Ignorar mensagens enviadas pela própria instância
      if (!isFromMe && typeof text === "string" && text.trim().length > 0) {
        if (numberOnly) {
          // Encontrar usuário pelo whatsappNumber em userSettings
          const settings = await db
            .select({ userId: userSettings.userId })
            .from(userSettings)
            .where(eq(userSettings.whatsappNumber, numberOnly))
            .limit(1);

          const userId = settings[0]?.userId || null;

          if (userId) {
            // Indicar "digitando" para UX melhor
            try {
              await getUazapiService().sendPresence({
                number: numberOnly,
                presence: "composing",
                delay: 1500,
              });
            } catch {}

            const response = await llmService.processUserMessage(userId, text);
            if (response?.message) {
              // Enviar resposta e persistir (outbound)
              const sendRes = await getUazapiService().sendText({
                number: numberOnly,
                text: response.message,
                readchat: true,
              });

              try {
                await db.insert(whatsappMessages).values({
                  id: nanoid(),
                  direction: "out",
                  userId,
                  instanceId: instance,
                  chatId: `${numberOnly}@s.whatsapp.net`,
                  sender: "system",
                  receiver: numberOnly,
                  messageType: "text",
                  messageText: response.message,
                  providerMessageId:
                    typeof sendRes.data === "object" &&
                    sendRes.data !== null &&
                    "messageid" in sendRes.data
                      ? String(
                          (sendRes.data as Record<string, unknown>)
                            .messageid as string
                        )
                      : undefined,
                  raw:
                    typeof sendRes.data === "object" && sendRes.data !== null
                      ? (sendRes.data as Record<string, unknown>)
                      : {},
                  mediaType: null,
                  mediaUrl: null,
                });
              } catch (e) {
                console.warn("Falha ao persistir mensagem outbound:", e);
              }

              // Marcar mensagens como lidas, se tivermos o id do provedor
              if (providerMessageId) {
                try {
                  await getUazapiService().markMessagesRead({
                    messages: [providerMessageId],
                  });
                } catch {}
              }
            }
          }
        }
      }
    }

    console.log("[UAZAPI Webhook]", { event, instanceId, handled: true });

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
