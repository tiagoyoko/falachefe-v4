import { useState, useCallback } from "react";

export interface LLMResponse {
  success: boolean;
  message: string;
  action?: string;
  suggestedActions?: Array<{
    action: string;
    description: string;
    params: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;
}

export interface UseLLMAgentOptions {
  userId: string;
  onError?: (error: string) => void;
  onSuccess?: (response: LLMResponse) => void;
}

export function useLLMAgent({
  userId,
  onError,
  onSuccess,
}: UseLLMAgentOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string): Promise<LLMResponse | null> => {
      if (!userId || !message.trim()) {
        const errorMsg = "User ID e mensagem são obrigatórios";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            command: message,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao processar mensagem");
        }

        const data = await response.json();

        if (data.success && data.data) {
          onSuccess?.(data.data);
          return data.data;
        } else {
          throw new Error("Resposta inválida do servidor");
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError, onSuccess]
  );

  const sendBusinessCommand = useCallback(
    async (
      command: string,
      commandType: "finance" | "marketing" | "sales" | "general"
    ): Promise<LLMResponse | null> => {
      if (!userId || !command.trim()) {
        const errorMsg = "User ID e comando são obrigatórios";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Mapear tipos de comando para nomes de agentes
        const agentMapping = {
          finance: "leo",
          marketing: "max", 
          sales: "max", // Vendas também vai para Max
          general: "max" // Geral vai para Max como padrão
        };

        const agentName = agentMapping[commandType];

        const response = await fetch("/api/agent/specific", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            message: command,
            agentName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erro ao processar comando de negócio"
          );
        }

        const data = await response.json();

        if (data.success && data.data) {
          onSuccess?.(data.data);
          return data.data;
        } else {
          throw new Error("Resposta inválida do servidor");
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, onError, onSuccess]
  );

  const getProactiveInsights =
    useCallback(async (): Promise<LLMResponse | null> => {
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
          `/api/agent?userId=${userId}&type=insights`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao obter insights");
        }

        const data = await response.json();

        if (data.success && data.data) {
          onSuccess?.(data.data);
          return data.data;
        } else {
          throw new Error("Resposta inválida do servidor");
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [userId, onError, onSuccess]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    sendBusinessCommand,
    getProactiveInsights,
    isLoading,
    error,
    clearError,
  };
}
