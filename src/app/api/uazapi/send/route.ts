import { NextRequest, NextResponse } from "next/server";
import { uazapiService } from "@/lib/uazapi-service";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, text, type, file, ...rest } = body || {};

    let result;
    if (type && file) {
      // Envio de mídia
      if (!number || !type || !file) {
        return NextResponse.json(
          { error: "Campos 'number', 'type' e 'file' são obrigatórios" },
          { status: 400 }
        );
      }
      result = await uazapiService.sendMedia({ number, type, file, ...rest });
    } else {
      // Envio de texto
      if (!number || !text) {
        return NextResponse.json(
          { error: "Campos 'number' e 'text' são obrigatórios" },
          { status: 400 }
        );
      }
      result = await uazapiService.sendText({ number, text, ...rest });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Falha ao enviar mensagem" },
        { status: result.status || 502 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Erro em /api/uazapi/send:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
