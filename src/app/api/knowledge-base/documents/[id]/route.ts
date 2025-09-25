import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { knowledgeBaseService } from "@/lib/knowledge-base/knowledge-base-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se é admin
    const userRole = "admin"; // TODO: Implementar verificação de role de admin
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        {
          error:
            "Acesso negado: apenas administradores podem acessar documentos",
        },
        { status: 403 }
      );
    }

    const document = await knowledgeBaseService.getDocument(id);

    if (!document) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Erro ao obter documento:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se é admin
    const userRole = "admin"; // TODO: Implementar verificação de role de admin
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        {
          error:
            "Acesso negado: apenas administradores podem editar documentos",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, isGlobal, metadata } = body;

    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (isGlobal !== undefined) updates.isGlobal = isGlobal;
    if (metadata !== undefined) updates.metadata = metadata;

    const document = await knowledgeBaseService.updateDocument(id, updates);

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Erro ao atualizar documento:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se é admin
    const userRole = "admin"; // TODO: Implementar verificação de role de admin
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        {
          error:
            "Acesso negado: apenas administradores podem deletar documentos",
        },
        { status: 403 }
      );
    }

    await knowledgeBaseService.deleteDocument(id);

    return NextResponse.json({
      success: true,
      message: "Documento deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
