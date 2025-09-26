/**
 * Tipos personalizados para o sistema FalaChefe
 */

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean | null;
  image?: string | null;
  role: "user" | "admin" | "super_admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  data: {
    user: User;
  };
}

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
