import { NextRequest, NextResponse } from "next/server";
import { ingestManual } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const { userId, label, texts, tags } = await req.json();
    if (!label || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: "label e texts[] são obrigatórios" },
        { status: 400 }
      );
    }
    const out = await ingestManual({ userId, label, texts, tags });
    return NextResponse.json({ success: true, data: out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
