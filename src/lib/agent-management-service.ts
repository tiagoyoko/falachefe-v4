/**
 * Serviço para gerenciar agentes dinamicamente
 * Permite que admins criem, editem e gerenciem agentes
 */

import { db } from "./db";
import { agents, agentSettings, user } from "./schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

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
  createdAt: Date;
  updatedAt: Date;
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

export class AgentManagementService {
  private static instance: AgentManagementService;

  public static getInstance(): AgentManagementService {
    if (!AgentManagementService.instance) {
      AgentManagementService.instance = new AgentManagementService();
    }
    return AgentManagementService.instance;
  }

  /**
   * Verificar se usuário é admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const userData = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return (
      userData.length > 0 &&
      (userData[0].role === "admin" || userData[0].role === "super_admin")
    );
  }

  /**
   * Listar todos os agentes
   */
  async listAgents(userId: string): Promise<AgentData[]> {
    // Verificar se é admin
    const isAdmin = await this.isAdmin(userId);
    if (!isAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem listar agentes"
      );
    }

    const agentsList = await db
      .select()
      .from(agents)
      .orderBy(desc(agents.createdAt));

    return agentsList.map((agent) => ({
      id: agent.id,
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description,
      tone: agent.tone,
      persona: agent.persona as AgentPersona,
      capabilities: (agent.capabilities as AgentCapability[]) || [],
      isActive: agent.isActive,
      isSystem: agent.isSystem,
      createdBy: agent.createdBy,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }));
  }

  /**
   * Obter agente por ID
   */
  async getAgent(agentId: string, userId: string): Promise<AgentData | null> {
    // Verificar se é admin
    const isAdmin = await this.isAdmin(userId);
    if (!isAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem acessar agentes"
      );
    }

    const agentData = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (agentData.length === 0) {
      return null;
    }

    const agent = agentData[0];
    return {
      id: agent.id,
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description,
      tone: agent.tone,
      persona: agent.persona as AgentPersona,
      capabilities: (agent.capabilities as AgentCapability[]) || [],
      isActive: agent.isActive,
      isSystem: agent.isSystem,
      createdBy: agent.createdBy,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }

  /**
   * Criar novo agente
   */
  async createAgent(data: CreateAgentData, userId: string): Promise<AgentData> {
    // Verificar se é admin
    const isAdmin = await this.isAdmin(userId);
    if (!isAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem criar agentes"
      );
    }

    // Verificar se nome já existe
    const existingAgent = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.name, data.name))
      .limit(1);

    if (existingAgent.length > 0) {
      throw new Error("Já existe um agente com este nome");
    }

    const agentId = nanoid();
    const persona: AgentPersona = {
      displayName: data.displayName,
      description: data.description,
      tone: data.tone,
    };

    await db.insert(agents).values({
      id: agentId,
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      tone: data.tone,
      persona,
      capabilities: data.capabilities || [],
      isActive: true,
      isSystem: false,
      createdBy: userId,
    });

    return this.getAgent(agentId, userId) as Promise<AgentData>;
  }

  /**
   * Atualizar agente
   */
  async updateAgent(
    agentId: string,
    data: UpdateAgentData,
    userId: string
  ): Promise<AgentData> {
    // Verificar se é admin
    const isAdmin = await this.isAdmin(userId);
    if (!isAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem atualizar agentes"
      );
    }

    // Verificar se agente existe
    const existingAgent = await this.getAgent(agentId, userId);
    if (!existingAgent) {
      throw new Error("Agente não encontrado");
    }

    // Atualizar dados
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.tone !== undefined) {
      updateData.tone = data.tone;
    }
    if (data.capabilities !== undefined) {
      updateData.capabilities = data.capabilities;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    // Atualizar persona se necessário
    if (data.displayName || data.description || data.tone) {
      updateData.persona = {
        displayName: data.displayName || existingAgent.displayName,
        description: data.description || existingAgent.description,
        tone: data.tone || existingAgent.tone,
      };
    }

    await db.update(agents).set(updateData).where(eq(agents.id, agentId));

    return this.getAgent(agentId, userId) as Promise<AgentData>;
  }

  /**
   * Deletar agente
   */
  async deleteAgent(agentId: string, userId: string): Promise<void> {
    // Verificar se é admin
    const isAdmin = await this.isAdmin(userId);
    if (!isAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem deletar agentes"
      );
    }

    // Verificar se agente existe e não é do sistema
    const existingAgent = await this.getAgent(agentId, userId);
    if (!existingAgent) {
      throw new Error("Agente não encontrado");
    }

    if (existingAgent.isSystem) {
      throw new Error("Não é possível deletar agentes do sistema");
    }

    // Deletar configurações de usuários primeiro
    await db.delete(agentSettings).where(eq(agentSettings.agentId, agentId));

    // Deletar agente
    await db.delete(agents).where(eq(agents.id, agentId));
  }

  /**
   * Ativar/Desativar agente
   */
  async toggleAgentStatus(agentId: string, userId: string): Promise<AgentData> {
    // Verificar se é admin
    const isAdmin = await this.isAdmin(userId);
    if (!isAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem alterar status de agentes"
      );
    }

    const existingAgent = await this.getAgent(agentId, userId);
    if (!existingAgent) {
      throw new Error("Agente não encontrado");
    }

    return this.updateAgent(
      agentId,
      { isActive: !existingAgent.isActive },
      userId
    );
  }

  /**
   * Obter configurações personalizadas do usuário para um agente
   */
  async getUserAgentSettings(
    agentId: string,
    userId: string
  ): Promise<Record<string, unknown> | null> {
    const settings = await db
      .select()
      .from(agentSettings)
      .where(
        and(
          eq(agentSettings.agentId, agentId),
          eq(agentSettings.userId, userId)
        )
      )
      .limit(1);

    return settings.length > 0
      ? (settings[0].settings as Record<string, unknown>)
      : null;
  }

  /**
   * Salvar configurações personalizadas do usuário para um agente
   */
  async saveUserAgentSettings(
    agentId: string,
    userId: string,
    settings: Record<string, unknown>
  ): Promise<void> {
    const existingSettings = await this.getUserAgentSettings(agentId, userId);

    if (existingSettings) {
      await db
        .update(agentSettings)
        .set({
          settings,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(agentSettings.agentId, agentId),
            eq(agentSettings.userId, userId)
          )
        );
    } else {
      await db.insert(agentSettings).values({
        id: nanoid(),
        agentId,
        userId,
        settings,
      });
    }
  }

  /**
   * Inicializar agentes do sistema
   */
  async initializeSystemAgents(userId: string): Promise<void> {
    const systemAgents = [
      {
        name: "leo",
        displayName: "Leo – Agente Financeiro",
        description:
          "Mentor experiente, organizado e confiável. Ajuda a entender números e planejar o caixa.",
        tone: "Racional, objetivo, claro e firme, mas amigável. Evita jargão e traz segurança.",
        capabilities: [
          {
            id: "finance",
            name: "Gestão Financeira",
            description: "Fluxo de caixa, transações, relatórios",
            enabled: true,
          },
          {
            id: "categorization",
            name: "Categorização",
            description: "Categorizar receitas e despesas",
            enabled: true,
          },
          {
            id: "reports",
            name: "Relatórios",
            description: "Gerar relatórios financeiros",
            enabled: true,
          },
        ],
      },
      {
        name: "max",
        displayName: "Max – Agente de Marketing/Vendas",
        description:
          "Jovem, entusiasmado e motivador. Gera ideias práticas para atrair clientes e vender mais.",
        tone: "Inspirador, animado e positivo. Incentiva ação com passos simples e claros.",
        capabilities: [
          {
            id: "marketing",
            name: "Marketing",
            description: "Estratégias de marketing digital",
            enabled: true,
          },
          {
            id: "sales",
            name: "Vendas",
            description: "Técnicas de vendas e prospecção",
            enabled: true,
          },
          {
            id: "social_media",
            name: "Redes Sociais",
            description: "Gestão de redes sociais",
            enabled: true,
          },
        ],
      },
      {
        name: "lia",
        displayName: "Lia – Agente de RH",
        description:
          "Mediadora, acolhedora e sensível às pessoas. Apoia gestão de equipe, clima e recrutamento.",
        tone: "Calmo, compreensivo e próximo. Sempre considera o lado humano e a mediação.",
        capabilities: [
          {
            id: "hr",
            name: "Recursos Humanos",
            description: "Gestão de pessoas e equipes",
            enabled: true,
          },
          {
            id: "recruitment",
            name: "Recrutamento",
            description: "Processos de contratação",
            enabled: true,
          },
          {
            id: "conflict",
            name: "Mediação",
            description: "Resolução de conflitos",
            enabled: true,
          },
        ],
      },
    ];

    for (const agentData of systemAgents) {
      const existingAgent = await db
        .select({ id: agents.id })
        .from(agents)
        .where(eq(agents.name, agentData.name))
        .limit(1);

      if (existingAgent.length === 0) {
        const persona: AgentPersona = {
          displayName: agentData.displayName,
          description: agentData.description,
          tone: agentData.tone,
        };

        await db.insert(agents).values({
          id: nanoid(),
          name: agentData.name,
          displayName: agentData.displayName,
          description: agentData.description,
          tone: agentData.tone,
          persona,
          capabilities: agentData.capabilities,
          isActive: true,
          isSystem: true,
          createdBy: userId,
        });
      }
    }
  }
}

export const agentManagementService = AgentManagementService.getInstance();
