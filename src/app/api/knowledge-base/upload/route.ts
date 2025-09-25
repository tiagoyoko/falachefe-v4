import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { knowledgeBaseService } from "@/lib/knowledge-base/knowledge-base-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // TODO: Implementar verificação de admin role
    // const userRole = user.user_metadata?.role || "user";
    // if (userRole !== "admin" && userRole !== "super_admin") {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Acesso negado: apenas administradores podem fazer upload de documentos",
    //     },
    //     { status: 403 }
    //   );
    // }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const agentIds = formData.get("agentIds") as string;
    const isGlobal = formData.get("isGlobal") === "true";
    const metadata = formData.get("metadata") as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: "Arquivo e título são obrigatórios" },
        { status: 400 }
      );
    }

    // Parse agentIds se fornecido
    let parsedAgentIds: string[] | undefined;
    if (agentIds) {
      try {
        parsedAgentIds = JSON.parse(agentIds);
      } catch {
        return NextResponse.json(
          { error: "Formato inválido para agentIds" },
          { status: 400 }
        );
      }
    }

    // Parse metadata se fornecido
    let parsedMetadata: Record<string, unknown> = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        return NextResponse.json(
          { error: "Formato inválido para metadata" },
          { status: 400 }
        );
      }
    }

    const config = {
      title,
      agentIds: parsedAgentIds,
      isGlobal,
      metadata: parsedMetadata,
    };

    const document = await knowledgeBaseService.uploadDocument(
      file,
      config,
      user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        documentId: document.id,
        status: document.status,
        message: "Documento enviado para processamento",
      },
    });
  } catch (error) {
    console.error("Erro ao fazer upload do documento:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
