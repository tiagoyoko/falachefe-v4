"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  useConversations,
  ConversationSession,
  ConversationMessage,
} from "@/hooks/use-conversations";
import { Bot, Plus, MessageSquare, Users, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ParallelConversationsProps {
  userId: string;
}

export function ParallelConversations({ userId }: ParallelConversationsProps) {
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<
    Record<string, ConversationMessage[]>
  >({});
  const [inputValue, setInputValue] = useState("");
  const [newConversationAgent] = useState<"leo" | "max" | "lia">("leo");

  const {
    createIndividualConversation,
    createGroupConversation,
    sendIndividualMessage,
    sendGroupMessage,
    getConversationHistory,
    getUserConversations,
    isLoading,
    error,
  } = useConversations({
    userId,
    onError: (error) => console.error("Erro:", error),
  });

  const loadConversations = useCallback(async () => {
    const userConversations = await getUserConversations();
    if (userConversations) {
      setConversations(userConversations);
      if (userConversations.length > 0 && !activeConversation) {
        setActiveConversation(userConversations[0].id);
        loadMessages(userConversations[0].id);
      }
    }
  }, [getUserConversations, activeConversation, loadMessages]);

  // Carregar conversas do usuário
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = async (sessionId: string) => {
    const history = await getConversationHistory(sessionId);
    if (history) {
      setMessages((prev) => ({
        ...prev,
        [sessionId]: history,
      }));
    }
  };

  const createNewIndividualConversation = async () => {
    const conversation =
      await createIndividualConversation(newConversationAgent);
    if (conversation) {
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversation(conversation.id);
      setMessages((prev) => ({
        ...prev,
        [conversation.id]: [],
      }));
    }
  };

  const createNewGroupConversation = async () => {
    const conversation = await createGroupConversation(
      ["leo", "max", "lia"],
      "Conversa em Grupo"
    );
    if (conversation) {
      setConversations((prev) => [conversation, ...prev]);
      setActiveConversation(conversation.id);
      setMessages((prev) => ({
        ...prev,
        [conversation.id]: [],
      }));
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !activeConversation) return;

    const currentConversation = conversations.find(
      (c) => c.id === activeConversation
    );
    if (!currentConversation) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      sessionId: activeConversation,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    // Adicionar mensagem do usuário
    setMessages((prev) => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), userMessage],
    }));

    const message = inputValue;
    setInputValue("");

    try {
      if (currentConversation.type === "individual") {
        const response = await sendIndividualMessage(
          activeConversation,
          message,
          currentConversation.agents[0] as "leo" | "max" | "lia"
        );
        if (response) {
          setMessages((prev) => ({
            ...prev,
            [activeConversation]: [
              ...(prev[activeConversation] || []),
              response,
            ],
          }));
        }
      } else {
        const responses = await sendGroupMessage(
          activeConversation,
          message,
          currentConversation.agents as ("leo" | "max" | "lia")[]
        );
        if (responses) {
          setMessages((prev) => ({
            ...prev,
            [activeConversation]: [
              ...(prev[activeConversation] || []),
              ...responses,
            ],
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case "leo":
        return "💰";
      case "max":
        return "📈";
      case "lia":
        return "👥";
      default:
        return "🤖";
    }
  };

  const getAgentName = (agentId: string) => {
    switch (agentId) {
      case "leo":
        return "Leo (Financeiro)";
      case "max":
        return "Max (Marketing)";
      case "lia":
        return "Lia (RH)";
      default:
        return "Agente";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Conversas Paralelas com Agentes
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={createNewIndividualConversation}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa Individual
          </Button>
          <Button
            onClick={createNewGroupConversation}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Nova Conversa em Grupo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Conversas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeConversation === conversation.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => {
                  setActiveConversation(conversation.id);
                  loadMessages(conversation.id);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      conversation.type === "group" ? "default" : "secondary"
                    }
                  >
                    {conversation.type === "group" ? "Grupo" : "Individual"}
                  </Badge>
                  <span className="text-sm font-medium">
                    {conversation.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {conversation.agents.map((agent) => (
                    <span key={agent} className="flex items-center gap-1">
                      {getAgentIcon(agent)} {agent}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Área de Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {activeConversation
                  ? conversations.find((c) => c.id === activeConversation)
                      ?.title || "Chat"
                  : "Selecione uma conversa"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {(messages[activeConversation] || []).map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.role === "assistant" && message.agentId && (
                            <div className="flex items-center gap-2 mb-2 text-xs font-medium">
                              {getAgentIcon(message.agentId)}{" "}
                              {getAgentName(message.agentId)}
                            </div>
                          )}
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="prose prose-sm max-w-none"
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !inputValue.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Selecione uma conversa para começar
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
