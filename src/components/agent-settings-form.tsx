"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type AgentConfigState = {
  agent: string;
  enabled: boolean;
  tone?: string;
  goals?: string;
  fallbackPrompt?: string;
  customSystemPrompt?: string;
  ragEnabled?: boolean;
  ragSources?: string;
};

const AGENT_LIST: Array<{ id: string; label: string; description: string }> = [
  {
    id: "leo",
    label: "Leo — Financeiro",
    description:
      "Fluxo de caixa, relatórios, categorias e análises financeiras.",
  },
  {
    id: "max",
    label: "Max — Marketing e Vendas",
    description:
      "Campanhas, funil de vendas, conteúdo e estratégias comerciais.",
  },
  {
    id: "lia",
    label: "Lia — Pessoas (RH)",
    description: "Clima, contratação, feedbacks e gestão de equipe.",
  },
  {
    id: "geral",
    label: "Geral — Assistência geral",
    description:
      "Fallback para dúvidas gerais quando não há agente específico.",
  },
];

export function AgentSettingsForm({
  initialConfigs,
}: {
  initialConfigs: Array<{ agent: string; settings: Record<string, unknown> }>;
}) {
  const {} = useAuth();
  const [savingAgent, setSavingAgent] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, AgentConfigState>>(() => {
    const map: Record<string, AgentConfigState> = {};
    AGENT_LIST.forEach((agent) => {
      const existing = initialConfigs.find((c) => c.agent === agent.id);
      map[agent.id] = {
        agent: agent.id,
        enabled: Boolean(existing?.settings?.enabled ?? true),
        tone: (existing?.settings?.tone as string) || "",
        goals: (existing?.settings?.goals as string) || "",
        fallbackPrompt: (existing?.settings?.fallbackPrompt as string) || "",
        customSystemPrompt:
          (existing?.settings?.customSystemPrompt as string) || "",
        ragEnabled: Boolean(existing?.settings?.ragEnabled ?? true),
        ragSources: (existing?.settings?.ragSources as string) || "",
      };
    });
    return map;
  });

  useEffect(() => {
    document.title = "Configuração dos Agentes — Fala Chefe!";
  }, []);

  const handleSave = async (agentId: string) => {
    try {
      setSavingAgent(agentId);
      const payload = state[agentId];
      const res = await fetch("/api/agent-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ agent: agentId, settings: payload }),
      });
      if (!res.ok) throw new Error("Falha ao salvar configuração do agente");
      toast.success("Configuração salva", {
        description: `Agente ${agentId.toUpperCase()} atualizado com sucesso.`,
      });
    } catch (e) {
      toast.error("Erro ao salvar", {
        description: e instanceof Error ? e.message : "Erro desconhecido",
      });
    } finally {
      setSavingAgent(null);
    }
  };

  const update = (agentId: string, partial: Partial<AgentConfigState>) => {
    setState((prev) => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...partial },
    }));
  };

  if (false) {
    // TODO: Implementar verificação de sessão
    return (
      <p className="text-sm text-muted-foreground">
        Faça login para configurar os agentes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {AGENT_LIST.map((agent) => {
        const config = state[agent.id];
        return (
          <Card key={agent.id} className="p-4 space-y-4">
            <div>
              <div className="text-base font-semibold">{agent.label}</div>
              <p className="text-xs text-muted-foreground">
                {agent.description}
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-sm">Agente habilitado</Label>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked: boolean) =>
                  update(agent.id, { enabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Usar base de conhecimento (RAG)</Label>
              <Switch
                checked={config.ragEnabled ?? true}
                onCheckedChange={(checked: boolean) =>
                  update(agent.id, { ragEnabled: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${agent.id}-sources`}>
                Fontes RAG preferidas
              </Label>
              <Input
                id={`${agent.id}-sources`}
                value={config.ragSources}
                placeholder="IDs ou tags de fontes (separados por vírgula)"
                onChange={(e) =>
                  update(agent.id, { ragSources: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${agent.id}-tone`}>
                Tom de voz personalizado
              </Label>
              <Textarea
                id={`${agent.id}-tone`}
                value={config.tone}
                placeholder="Ex.: Tom educativo, com foco em empreendedor de varejo"
                onChange={(e) => update(agent.id, { tone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${agent.id}-goals`}>
                Objetivos prioritários
              </Label>
              <Textarea
                id={`${agent.id}-goals`}
                value={config.goals}
                placeholder="Liste metas ou resultados esperados para esse agente"
                onChange={(e) => update(agent.id, { goals: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${agent.id}-system`}>
                Prompt de sistema extra
              </Label>
              <Textarea
                id={`${agent.id}-system`}
                value={config.customSystemPrompt}
                placeholder="Instruções adicionais para complementar o prompt padrão do agente."
                onChange={(e) =>
                  update(agent.id, { customSystemPrompt: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${agent.id}-fallback`}>Prompt de fallback</Label>
              <Textarea
                id={`${agent.id}-fallback`}
                value={config.fallbackPrompt}
                placeholder="Instruções extras quando o agente estiver sem contexto."
                onChange={(e) =>
                  update(agent.id, { fallbackPrompt: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => handleSave(agent.id)}
                disabled={savingAgent === agent.id}
              >
                {savingAgent === agent.id ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
