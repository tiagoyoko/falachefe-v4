import { db } from "@/lib/db";
import { agentProfiles, agents, conversationSessions, conversationMessages } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface AgentProfileSettings {
  persona?: {
    displayName?: string;
    description?: string;
    tone?: string;
  };
  preferences?: {
    responseStyle?: "formal" | "casual" | "friendly" | "professional";
    detailLevel?: "brief" | "detailed" | "comprehensive";
    language?: "pt-BR" | "en-US";
    timezone?: string;
  };
  capabilities?: {
    enabledFeatures?: string[];
    disabledFeatures?: string[];
    customPrompts?: Record<string, string>;
  };
  memory?: {
    contextWindow?: number;
    rememberUserPreferences?: boolean;
    rememberConversationHistory?: boolean;
    rememberBusinessContext?: boolean;
  };
  business?: {
    industry?: string;
    businessSize?: "micro" | "pequeno" | "medio" | "grande";
    monthlyRevenue?: string;
    employeeCount?: string;
    mainGoals?: string[];
    painPoints?: string[];
  };
}

export interface AgentProfile {
  id: string;
  userId: string;
  agent: string;
  settings: AgentProfileSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationContext {
  sessionId: string;
  agent: string;
  recentMessages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  userPreferences: AgentProfileSettings;
  businessContext: AgentProfileSettings["business"];
}

export class AgentProfileService {
  /**
   * Obtém ou cria o perfil de um agente para um usuário
   */
  async getOrCreateProfile(
    userId: string,
    agentName: string,
    defaultSettings?: Partial<AgentProfileSettings>
  ): Promise<AgentProfile> {
    // Busca perfil existente
    const existingProfile = await db
      .select()
      .from(agentProfiles)
      .where(and(eq(agentProfiles.userId, userId), eq(agentProfiles.agent, agentName)))
      .limit(1);

    if (existingProfile.length > 0) {
      return existingProfile[0] as AgentProfile;
    }

    // Cria novo perfil com configurações padrão
    const defaultAgentSettings: AgentProfileSettings = {
      persona: {
        displayName: this.getDefaultDisplayName(agentName),
        description: this.getDefaultDescription(agentName),
        tone: this.getDefaultTone(agentName),
      },
      preferences: {
        responseStyle: "friendly",
        detailLevel: "detailed",
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
      },
      capabilities: {
        enabledFeatures: this.getDefaultCapabilities(agentName),
        disabledFeatures: [],
        customPrompts: {},
      },
      memory: {
        contextWindow: 10,
        rememberUserPreferences: true,
        rememberConversationHistory: true,
        rememberBusinessContext: true,
      },
      business: {
        industry: "",
        businessSize: "micro",
        monthlyRevenue: "",
        employeeCount: "",
        mainGoals: [],
        painPoints: [],
      },
      ...defaultSettings,
    };

    const newProfile = {
      id: nanoid(),
      userId,
      agent: agentName,
      settings: defaultAgentSettings,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(agentProfiles).values(newProfile);

    return newProfile;
  }

  /**
   * Atualiza o perfil de um agente
   */
  async updateProfile(
    userId: string,
    agentName: string,
    updates: Partial<AgentProfileSettings>
  ): Promise<AgentProfile> {
    const profile = await this.getOrCreateProfile(userId, agentName);
    
    const updatedSettings = {
      ...profile.settings,
      ...updates,
    };

    const updatedProfile = {
      ...profile,
      settings: updatedSettings,
      updatedAt: new Date(),
    };

    await db
      .update(agentProfiles)
      .set({
        settings: updatedSettings,
        updatedAt: new Date(),
      })
      .where(and(eq(agentProfiles.userId, userId), eq(agentProfiles.agent, agentName)));

    return updatedProfile;
  }

  /**
   * Obtém o contexto de conversa para um agente
   */
  async getConversationContext(
    userId: string,
    agentName: string,
    limit: number = 10
  ): Promise<ConversationContext> {
    // Obtém perfil do agente
    const profile = await this.getOrCreateProfile(userId, agentName);

    // Busca sessão ativa ou cria nova
    let session = await db
      .select()
      .from(conversationSessions)
      .where(and(eq(conversationSessions.userId, userId), eq(conversationSessions.agent, agentName)))
      .orderBy(desc(conversationSessions.updatedAt))
      .limit(1);

    if (session.length === 0) {
      // Cria nova sessão
      const newSession = {
        id: nanoid(),
        userId,
        agent: agentName,
        title: `Conversa com ${profile.settings.persona?.displayName || agentName}`,
        chatId: null,
        lastActivity: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(conversationSessions).values(newSession);
      session = [newSession];
    }

    // Busca mensagens recentes
    const messages = await db
      .select()
      .from(conversationMessages)
      .where(eq(conversationMessages.sessionId, session[0].id))
      .orderBy(desc(conversationMessages.createdAt))
      .limit(limit);

    return {
      sessionId: session[0].id,
      agent: agentName,
      recentMessages: messages
        .reverse()
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: msg.createdAt,
        })),
      userPreferences: profile.settings,
      businessContext: profile.settings.business || {},
    };
  }

  /**
   * Salva uma mensagem na conversa
   */
  async saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await db.insert(conversationMessages).values({
      id: nanoid(),
      sessionId,
      role,
      content,
      metadata: metadata || {},
      createdAt: new Date(),
    });

    // Atualiza timestamp da sessão
    await db
      .update(conversationSessions)
      .set({ updatedAt: new Date() })
      .where(eq(conversationSessions.id, sessionId));
  }

  /**
   * Obtém configurações padrão por agente
   */
  private getDefaultDisplayName(agentName: string): string {
    const defaults = {
      leo: "Leo – Agente Financeiro",
      max: "Max – Agente de Marketing/Vendas",
      lia: "Lia – Agente de RH",
      geral: "Assistente Geral",
    };
    return defaults[agentName as keyof typeof defaults] || "Assistente";
  }

  private getDefaultDescription(agentName: string): string {
    const defaults = {
      leo: "Mentor experiente, organizado e confiável. Ajuda a entender números e planejar o caixa.",
      max: "Jovem, entusiasmado e motivador. Gera ideias práticas para atrair clientes e vender mais.",
      lia: "Mediadora, acolhedora e sensível às pessoas. Apoia gestão de equipe, clima e recrutamento.",
      geral: "Assistente versátil para diversas necessidades do negócio.",
    };
    return defaults[agentName as keyof typeof defaults] || "Assistente para seu negócio.";
  }

  private getDefaultTone(agentName: string): string {
    const defaults = {
      leo: "Racional, objetivo, claro e firme, mas amigável. Evita jargão e traz segurança.",
      max: "Inspirador, animado e positivo. Incentiva ação com passos simples e claros.",
      lia: "Calmo, compreensivo e próximo. Sempre considera o lado humano e a mediação.",
      geral: "Profissional, claro e útil. Adapta-se ao contexto da conversa.",
    };
    return defaults[agentName as keyof typeof defaults] || "Profissional e útil.";
  }

  private getDefaultCapabilities(agentName: string): string[] {
    const defaults = {
      leo: [
        "financial_analysis",
        "transaction_management",
        "budget_planning",
        "financial_reports",
        "category_management",
      ],
      max: [
        "marketing_strategy",
        "sales_techniques",
        "customer_acquisition",
        "campaign_planning",
        "social_media",
      ],
      lia: [
        "hr_management",
        "team_building",
        "recruitment",
        "conflict_resolution",
        "employee_development",
      ],
      geral: ["general_assistance", "information_lookup", "task_management"],
    };
    return defaults[agentName as keyof typeof defaults] || ["general_assistance"];
  }

  /**
   * Obtém estatísticas de uso do agente
   */
  async getAgentStats(userId: string, agentName: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    lastActivity: Date | null;
    averageSessionLength: number;
  }> {
    // Conta sessões
    const sessions = await db
      .select({ count: conversationSessions.id })
      .from(conversationSessions)
      .where(and(eq(conversationSessions.userId, userId), eq(conversationSessions.agent, agentName)));

    // Conta mensagens
    const messages = await db
      .select({ count: conversationMessages.id })
      .from(conversationMessages)
      .innerJoin(conversationSessions, eq(conversationMessages.sessionId, conversationSessions.id))
      .where(and(eq(conversationSessions.userId, userId), eq(conversationSessions.agent, agentName)));

    // Última atividade
    const lastActivity = await db
      .select({ updatedAt: conversationSessions.updatedAt })
      .from(conversationSessions)
      .where(and(eq(conversationSessions.userId, userId), eq(conversationSessions.agent, agentName)))
      .orderBy(desc(conversationSessions.updatedAt))
      .limit(1);

    return {
      totalSessions: sessions.length,
      totalMessages: messages.length,
      lastActivity: lastActivity[0]?.updatedAt || null,
      averageSessionLength: sessions.length > 0 ? messages.length / sessions.length : 0,
    };
  }
}

export const agentProfileService = new AgentProfileService();
