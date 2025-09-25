import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React from "react";

interface ConversationMessage {
  role: string;
  content: string;
  createdAt: string | Date;
}

interface ConversationSession {
  sessionId: string;
  agent: string;
  title: string | null;
  updatedAt: string | Date;
  messages: ConversationMessage[];
}

interface ConversationsResponse {
  sessions: ConversationSession[];
  pagination?: {
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

async function fetchConversations(
  userId: string,
  agent?: string,
  page: number = 1
): Promise<ConversationsResponse> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const params = new URLSearchParams({
    userId,
    page: String(page),
    pageSize: String(5),
    limitMessages: String(50),
  });
  if (agent) params.set("agent", agent);
  const url = `${base}/api/conversations?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { sessions: [] };
  const json = await res.json();
  return json?.data || { sessions: [] };
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ agent?: string; page?: string }>;
}) {
  // const session = await getSession(); // TODO: Implementar getSession
  const userId = "placeholder-user-id"; // TODO: Implementar obtenção real do user ID

  if (!userId) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Conversas com Agentes</h1>
        <p className="text-sm text-muted-foreground">
          Faça login para ver seu histórico.
        </p>
      </div>
    );
  }

  const resolvedSearchParams = await searchParams;
  const agent = resolvedSearchParams?.agent;
  const page = Number(resolvedSearchParams?.page || 1);
  const data = await fetchConversations(userId, agent, page);
  const sessions: ConversationSession[] = Array.isArray(data.sessions)
    ? data.sessions
    : [];
  const hasMore: boolean = Boolean(data.pagination?.hasMore);

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Conversas com Agentes</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de mensagens por agente (Leo, Max, Lia).
        </p>
      </div>
      {sessions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma conversa encontrada.
        </p>
      )}
      <div className="flex items-center gap-2 text-sm">
        <a
          href="/conversations"
          className={`underline-offset-4 hover:underline ${!agent ? "font-semibold" : ""}`}
        >
          Todos
        </a>
        <a
          href="/conversations?agent=leo"
          className={`underline-offset-4 hover:underline ${agent === "leo" ? "font-semibold" : ""}`}
        >
          Leo
        </a>
        <a
          href="/conversations?agent=max"
          className={`underline-offset-4 hover:underline ${agent === "max" ? "font-semibold" : ""}`}
        >
          Max
        </a>
        <a
          href="/conversations?agent=lia"
          className={`underline-offset-4 hover:underline ${agent === "lia" ? "font-semibold" : ""}`}
        >
          Lia
        </a>
        <a
          href="/conversations?agent=geral"
          className={`underline-offset-4 hover:underline ${agent === "geral" ? "font-semibold" : ""}`}
        >
          Geral
        </a>
      </div>
      <div className="space-y-4">
        {sessions.map((s) => (
          <Card key={s.sessionId} className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Agente: {s.agent}</div>
              <div className="text-xs text-muted-foreground">
                Atualizado: {new Date(s.updatedAt).toLocaleString("pt-BR")}
              </div>
            </div>
            <Separator className="my-3" />
            <div className="space-y-2">
              {s.messages.map((m: ConversationMessage, idx: number) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium mr-2">
                    {m.role === "user" ? "Você" : "Agente"}:
                  </span>
                  <span className="whitespace-pre-wrap">{m.content}</span>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <a
          className="text-sm underline underline-offset-4 hover:no-underline"
          href={`/conversations?${new URLSearchParams({ ...(agent ? { agent } : {}), page: String(Math.max(1, page - 1)) }).toString()}`}
        >
          Página anterior
        </a>
        <a
          className={`text-sm underline underline-offset-4 hover:no-underline ${!hasMore ? "opacity-50 pointer-events-none" : ""}`}
          href={`/conversations?${new URLSearchParams({ ...(agent ? { agent } : {}), page: String(page + 1) }).toString()}`}
        >
          Próxima página
        </a>
      </div>
    </div>
  );
}
