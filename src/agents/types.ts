export type AgentName = "leo" | "max" | "lia" | "geral";

export interface AgentPersona {
  displayName: string;
  description: string;
  tone: string;
}

export interface AgentResponse {
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

export interface AgentContext {
  userId: string;
}

export interface Agent {
  readonly name: AgentName;
  readonly persona: AgentPersona;
  handle(input: {
    userId: string;
    message: string;
    agent?: AgentName;
  }): Promise<AgentResponse>;
}
