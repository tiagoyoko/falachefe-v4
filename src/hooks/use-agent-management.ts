"use client";

import { useState, useEffect } from "react";

export interface AgentPersona {
  displayName: string;
  description: string;
  tone: string;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentData {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tone: string;
  persona: AgentPersona;
  capabilities?: AgentCapability[];
  isActive: boolean;
  isSystem: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentData {
  name: string;
  displayName: string;
  description: string;
  tone: string;
  capabilities?: AgentCapability[];
}

export interface UpdateAgentData {
  displayName?: string;
  description?: string;
  tone?: string;
  capabilities?: AgentCapability[];
  isActive?: boolean;
}

export function useAgentManagement() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listar agentes
  const fetchAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/agents");
      const data = await response.json();

      if (data.success) {
        setAgents(data.data);
      } else {
        setError(data.error || "Erro ao carregar agentes");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  // Criar agente
  const createAgent = async (agentData: CreateAgentData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      });

      const data = await response.json();

      if (data.success) {
        setAgents((prev) => [data.data, ...prev]);
        return true;
      } else {
        setError(data.error || "Erro ao criar agente");
        return false;
      }
    } catch {
      setError("Erro de conexão");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar agente
  const updateAgent = async (
    agentId: string,
    agentData: UpdateAgentData
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      });

      const data = await response.json();

      if (data.success) {
        setAgents((prev) =>
          prev.map((agent) => (agent.id === agentId ? data.data : agent))
        );
        return true;
      } else {
        setError(data.error || "Erro ao atualizar agente");
        return false;
      }
    } catch {
      setError("Erro de conexão");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar agente
  const deleteAgent = async (agentId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/agents/${agentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
        return true;
      } else {
        setError(data.error || "Erro ao deletar agente");
        return false;
      }
    } catch {
      setError("Erro de conexão");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle status do agente
  const toggleAgentStatus = async (agentId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/agents/${agentId}/toggle`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setAgents((prev) =>
          prev.map((agent) => (agent.id === agentId ? data.data : agent))
        );
        return true;
      } else {
        setError(data.error || "Erro ao alterar status do agente");
        return false;
      }
    } catch {
      setError("Erro de conexão");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carregar agentes na inicialização
  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    toggleAgentStatus,
  };
}
