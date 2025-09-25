"use client";

import { useAuth } from "@/hooks/use-auth";
import { Lock } from "lucide-react";
import { LLMChatInterface } from "@/components/chat/llm-chat-interface";

export default function ChatPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Carregando...</div>;
  }

  if (!user) {
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
      <LLMChatInterface userId="placeholder-user-id" />
    </div>
  );
}
