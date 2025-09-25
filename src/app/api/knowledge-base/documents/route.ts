import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { knowledgeBaseService } from "@/lib/knowledge-base/knowledge-base-service";

export async function GET(request: NextRequest) {
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
    //         "Acesso negado: apenas administradores podem listar documentos",
    //     },
    //     { status: 403 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const status = searchParams.get("status");
    const isGlobal = searchParams.get("isGlobal");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const filters = {
      agentId: agentId || undefined,
      status: status || undefined,
      isGlobal: isGlobal ? isGlobal === "true" : undefined,
      search: search || undefined,
      page,
      limit,
    };

    const result = await knowledgeBaseService.getDocuments(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
