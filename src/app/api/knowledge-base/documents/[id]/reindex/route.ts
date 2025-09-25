import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { knowledgeBaseService } from "@/lib/knowledge-base/knowledge-base-service";

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

    // TODO: Implementar verificação de admin role
    // const userRole = user.user_metadata?.role || "user";
    // if (userRole !== "admin" && userRole !== "super_admin") {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Acesso negado: apenas administradores podem reindexar documentos",
    //     },
    //     { status: 403 }
    //   );
    // }

    await knowledgeBaseService.reindexDocument(id);

    return NextResponse.json({
      success: true,
      message: "Documento enviado para reindexação",
    });
  } catch (error) {
    console.error("Erro ao reindexar documento:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
