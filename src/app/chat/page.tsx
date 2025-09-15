"use client";

import { useSession } from "@/lib/auth-client";
import { Lock } from "lucide-react";
import { LLMChatInterface } from "@/components/chat/llm-chat-interface";

export default function ChatPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="container mx-auto px-4 py-12">Carregando...</div>;
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Faça login para acessar o chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LLMChatInterface userId={session.user.id} />
    </div>
  );
}
