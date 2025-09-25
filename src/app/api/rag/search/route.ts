import { NextRequest, NextResponse } from "next/server";
import { searchRAG } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { userId, query, topK } = await req.json();
    if (!query)
      return NextResponse.json(
        { error: "query é obrigatório" },
        { status: 400 }
      );
    const out = await searchRAG({ userId, query, topK });
    return NextResponse.json({ success: true, data: out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
