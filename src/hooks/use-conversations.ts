import { useState, useCallback } from "react";

export interface ConversationSession {
  id: string;
  userId: string;
  type: "individual" | "group";
  agents: string[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  sessionId: string;
  agentId?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UseConversationsOptions {
  userId: string;
  onError?: (error: string) => void;
}

export function useConversations({ userId, onError }: UseConversationsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Criar conversa individual
  const createIndividualConversation = useCallback(
    async (agentId: "leo" | "max" | "lia"): Promise<ConversationSession | null> => {
      if (!userId) {
        const errorMsg = "User ID é obrigatório";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/conversations/individual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            agentId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao criar conversa individual");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError]
  );

  // Criar conversa em grupo
  const createGroupConversation = useCallback(
    async (
      agentIds: ("leo" | "max" | "lia")[],
      title?: string
    ): Promise<ConversationSession | null> => {
      if (!userId) {
        const errorMsg = "User ID é obrigatório";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/conversations/group", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            agentIds,
            title,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao criar conversa em grupo");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError]
  );

  // Enviar mensagem para conversa individual
  const sendIndividualMessage = useCallback(
    async (
      sessionId: string,
      message: string,
      agentId: "leo" | "max" | "lia"
    ): Promise<ConversationMessage | null> => {
      if (!userId) {
        const errorMsg = "User ID é obrigatório";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/conversations/${sessionId}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            message,
            agentId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao enviar mensagem");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError]
  );

  // Enviar mensagem para conversa em grupo
  const sendGroupMessage = useCallback(
    async (
      sessionId: string,
      message: string,
      agentIds: ("leo" | "max" | "lia")[]
    ): Promise<ConversationMessage[] | null> => {
      if (!userId) {
        const errorMsg = "User ID é obrigatório";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/conversations/${sessionId}/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            message,
            agentIds,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao enviar mensagem");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError]
  );

  // Obter histórico da conversa
  const getConversationHistory = useCallback(
    async (sessionId: string): Promise<ConversationMessage[] | null> => {
      if (!userId) {
        const errorMsg = "User ID é obrigatório";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/conversations/${sessionId}/message?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao obter histórico");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError]
  );

  // Listar conversas do usuário
  const getUserConversations = useCallback(
    async (): Promise<ConversationSession[] | null> => {
      if (!userId) {
        const errorMsg = "User ID é obrigatório";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/conversations/individual?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao listar conversas");
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createIndividualConversation,
    createGroupConversation,
    sendIndividualMessage,
    sendGroupMessage,
    getConversationHistory,
    getUserConversations,
    isLoading,
    error,
    clearError,
  };
}
