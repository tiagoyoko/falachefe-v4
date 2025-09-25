"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLLMAgent, LLMResponse } from "@/hooks/use-llm-agent";
import {
  Send,
  Bot,
  User,
  TrendingUp,
  DollarSign,
  Megaphone,
  ShoppingCart,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  suggestedActions?: LLMResponse["suggestedActions"];
  agentName?: string; // Adicionado para identificar o agente que respondeu
}

interface LLMChatInterfaceProps {
  userId: string;
  initialMessage?: string;
}

export function LLMChatInterface({
  userId,
  initialMessage,
}: LLMChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCommandType, setSelectedCommandType] = useState<
    "general" | "finance" | "marketing" | "sales"
  >("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, sendBusinessCommand, getProactiveInsights, isLoading } =
    useLLMAgent({
      userId,
      onSuccess: (response) => {
        // Determinar qual agente respondeu baseado no tipo selecionado
        const agentMapping = {
          general: "Max",
          finance: "Leo",
          marketing: "Max",
          sales: "Max",
        };

        const agentName = agentMapping[selectedCommandType];

        const newMessage: Message = {
          id: Date.now().toString(),
          content: response.message,
          role: "assistant",
          timestamp: new Date(),
          suggestedActions: response.suggestedActions,
          agentName: agentName, // Adicionar nome do agente
        };
        setMessages((prev) => [...prev, newMessage]);
      },
      onError: (error) => {
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `❌ ${error}`,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      },
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage) {
      setInputValue(initialMessage);
    }
  }, [initialMessage]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Enviar mensagem baseada no tipo selecionado
    if (selectedCommandType === "general") {
      await sendMessage(inputValue);
    } else {
      await sendBusinessCommand(inputValue, selectedCommandType);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedAction = async (action: {
    description: string;
    action: string;
    params: Record<string, unknown>;
  }) => {
    const actionMessage: Message = {
      id: Date.now().toString(),
      content: `Executando: ${action.description}`,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, actionMessage]);

    try {
      // Implementar lógica para diferentes tipos de ação
      let response;

      switch (action.action) {
        case "confirm_transaction":
          response = await fetch("/api/transactions/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              description: action.params.description,
              amount: action.params.amount,
              type: action.params.type,
              category: action.params.category,
              date: action.params.date,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const successMessage: Message = {
              id: (Date.now() + 1).toString(),
              content:
                data.data?.message || `✅ Transação registrada com sucesso!`,
              role: "assistant",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, successMessage]);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao confirmar transação");
          }
          break;

        case "auto_categorize":
          // Enviar comando para categorizar automaticamente
          await sendMessage("categorizar automaticamente");
          break;

        case "suggest_categories":
          // Enviar comando para sugerir categorias
          await sendMessage(
            `sugerir categorias para "${action.params.description}"`
          );
          break;

        default:
          // Para outras ações, apenas simular por enquanto
          const defaultMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: `✅ Ação "${action.description}" executada com sucesso!`,
            role: "assistant",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, defaultMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ Erro ao executar ação: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleGetInsights = async () => {
    await getProactiveInsights();
  };

  const commandTypeIcons = {
    general: Bot,
    finance: DollarSign,
    marketing: Megaphone,
    sales: ShoppingCart,
  };

  const commandTypeLabels = {
    general: "Geral",
    finance: "Financeiro",
    marketing: "Marketing",
    sales: "Vendas",
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Fala Chefe! - Assistente IA
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetInsights}
              disabled={isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Insights
            </Button>
          </div>
        </div>

        {/* Seletor de tipo de comando */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(commandTypeLabels).map(([type, label]) => {
            const Icon =
              commandTypeIcons[type as keyof typeof commandTypeIcons];
            return (
              <Button
                key={type}
                variant={selectedCommandType === type ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedCommandType(
                    type as "general" | "finance" | "marketing" | "sales"
                  )
                }
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {/* Área de mensagens */}
        <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Olá! Sou seu assistente de negócios.</p>
              <p>Como posso ajudar você hoje?</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted-foreground/10 px-1 py-0.5 rounded text-sm">
                          {children}
                        </code>
                      ),
                      table: ({ children }) => (
                        <table className="table-auto w-full border-collapse my-2 text-sm">
                          {children}
                        </table>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted/50">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="border px-2 py-1 text-left font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border px-2 py-1 align-top">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Ações sugeridas */}
                {message.suggestedActions &&
                  message.suggestedActions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs opacity-75">Ações sugeridas:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestedAction(action)}
                            className="text-xs"
                          >
                            {action.description}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="text-xs opacity-75 mt-2">
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Pensando...</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Área de entrada */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Indicador de tipo de comando ativo */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Modo:</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            {React.createElement(commandTypeIcons[selectedCommandType], {
              className: "h-3 w-3",
            })}
            {commandTypeLabels[selectedCommandType]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
