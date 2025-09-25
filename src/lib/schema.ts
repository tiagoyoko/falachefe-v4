import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
  json,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified"),
  image: text("image"),
  role: text("role").notNull().default("user"), // 'user' | 'admin' | 'super_admin'
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// ===== AGENTE DE FLUXO DE CAIXA =====

// Tabela para armazenar planilhas Google Sheets dos usuários
export const spreadsheets = pgTable("spreadsheets", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  googleSheetId: text("googleSheetId").notNull().unique(),
  googleSheetUrl: text("googleSheetUrl").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Tabela para categorias de receitas e despesas
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'receita' ou 'despesa'
  color: text("color"), // Cor para identificação visual
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Tabela para transações financeiras
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  spreadsheetId: text("spreadsheetId").references(() => spreadsheets.id, {
    onDelete: "cascade",
  }),
  categoryId: text("categoryId").references(() => categories.id, {
    onDelete: "set null",
  }),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'receita' ou 'despesa'
  transactionDate: timestamp("transactionDate").notNull(),
  metadata: json("metadata"), // Dados adicionais em JSON
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Tabela para configurações do usuário
export const userSettings = pgTable("userSettings", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  currency: text("currency").notNull().default("BRL"),
  timezone: text("timezone").notNull().default("America/Sao_Paulo"),
  whatsappNumber: text("whatsappNumber"),
  preferences: json("preferences"), // Preferências do usuário em JSON
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Tabela para histórico de comandos do agente
export const agentCommands = pgTable("agentCommands", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  command: text("command").notNull(),
  response: text("response").notNull(),
  success: boolean("success").notNull(),
  metadata: json("metadata"), // Dados adicionais do comando
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ===== ONBOARDING E PERFIL DE EMPRESA =====

// Tabela para informações da empresa
export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  segment: text("segment"), // Segmento de atuação (varejo, serviços, etc.)
  cnpj: text("cnpj"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  phone: text("phone"),
  businessSize: text("businessSize"), // micro, pequeno, médio
  monthlyRevenue: text("monthlyRevenue"), // faixa de faturamento
  employeeCount: text("employeeCount"), // número de funcionários
  description: text("description"), // descrição do negócio
  website: text("website"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Tabela para preferências do usuário no onboarding
export const onboardingPreferences = pgTable("onboardingPreferences", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  mainGoals: json("mainGoals"), // Objetivos principais (array de strings)
  painPoints: json("painPoints"), // Principais dores (array de strings)
  currentTools: json("currentTools"), // Ferramentas que usa atualmente
  preferredCommunication: text("preferredCommunication").default("whatsapp"), // whatsapp, email, etc.
  businessHours: json("businessHours"), // Horários de funcionamento
  notificationPreferences: json("notificationPreferences"), // Preferências de notificação
  onboardingCompleted: boolean("onboardingCompleted").notNull().default(false),
  currentStep: text("currentStep").default("welcome"), // Etapa atual do onboarding
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Tabela para categorias padrão pré-configuradas
export const defaultCategories = pgTable("defaultCategories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'receita' ou 'despesa'
  segment: text("segment"), // Para qual segmento se aplica (null = todos)
  color: text("color"),
  icon: text("icon"), // Nome do ícone
  isCommon: boolean("isCommon").notNull().default(true), // Se é categoria comum
  order: decimal("order", { precision: 5, scale: 2 }).default("0"), // Ordem de exibição
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Tabela para templates de onboarding por segmento
export const onboardingTemplates = pgTable("onboardingTemplates", {
  id: text("id").primaryKey(),
  segment: text("segment").notNull(),
  name: text("name").notNull(),
  categories: json("categories"), // IDs das categorias padrão para este segmento
  goals: json("goals"), // Objetivos sugeridos
  tips: json("tips"), // Dicas específicas do segmento
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ===== HISTÓRICO DE MENSAGENS WHATSAPP =====

export const whatsappMessages = pgTable("whatsappMessages", {
  id: text("id").primaryKey(),
  direction: text("direction").notNull(), // 'in' | 'out'
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  instanceId: text("instanceId"),
  chatId: text("chatId"),
  sender: text("sender"),
  receiver: text("receiver"),
  messageType: text("messageType"), // text, image, audio, etc.
  messageText: text("messageText"),
  mediaType: text("mediaType"), // image, video, document, audio, ptt, sticker
  mediaUrl: text("mediaUrl"),
  providerMessageId: text("providerMessageId"),
  raw: json("raw"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ===== MEMÓRIA DE CONVERSA (PERSISTENTE) =====

export const conversationSessions = pgTable("conversationSessions", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  agent: text("agent").notNull(), // 'financeiro' | 'max' | 'geral'
  title: text("title"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const conversationMessages = pgTable("conversationMessages", {
  id: text("id").primaryKey(),
  sessionId: text("sessionId")
    .notNull()
    .references(() => conversationSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const conversationSummaries = pgTable("conversationSummaries", {
  id: text("id").primaryKey(),
  sessionId: text("sessionId")
    .notNull()
    .references(() => conversationSessions.id, { onDelete: "cascade" })
    .unique(),
  summary: text("summary").notNull(),
  lastMessageAt: timestamp("lastMessageAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ===== PERFIS DE AGENTES =====

export const agentProfiles = pgTable("agentProfiles", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  agent: text("agent").notNull(), // 'financeiro' | 'max' | 'geral'
  settings: json("settings"), // preferências, persona, canais, objetivos
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ===== AGENTES DINÂMICOS (ADMIN) =====

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // 'leo', 'max', 'lia', etc.
  displayName: text("displayName").notNull(), // 'Leo - Agente Financeiro'
  description: text("description").notNull(),
  tone: text("tone").notNull(), // Descrição do tom de voz
  persona: json("persona").notNull(), // { displayName, description, tone }
  capabilities: json("capabilities"), // Array de capacidades
  isActive: boolean("isActive").notNull().default(true),
  isSystem: boolean("isSystem").notNull().default(false), // Agentes do sistema não podem ser deletados
  createdBy: text("createdBy")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const agentSettings = pgTable("agentSettings", {
  id: text("id").primaryKey(),
  agentId: text("agentId")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  settings: json("settings").notNull(), // Configurações personalizadas do usuário
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ===== RAG (FONTES, DOCUMENTOS, CHUNKS, EMBEDDINGS) =====

export const ragSources = pgTable("ragSources", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  kind: text("kind").notNull(), // 'url' | 'file' | 'manual'
  label: text("label").notNull(),
  url: text("url"),
  tags: json("tags"), // string[]
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const ragDocuments = pgTable("ragDocuments", {
  id: text("id").primaryKey(),
  sourceId: text("sourceId").references(() => ragSources.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  url: text("url"),
  lang: text("lang"),
  tags: json("tags"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const ragChunks = pgTable("ragChunks", {
  id: text("id").primaryKey(),
  documentId: text("documentId")
    .notNull()
    .references(() => ragDocuments.id, { onDelete: "cascade" }),
  idx: integer("idx").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const ragEmbeddings = pgTable("ragEmbeddings", {
  id: text("id").primaryKey(),
  chunkId: text("chunkId")
    .notNull()
    .references(() => ragChunks.id, { onDelete: "cascade" }),
  embedding: json("embedding").notNull(), // number[]
  model: text("model").notNull(),
  dims: integer("dims").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ===== BASE DE CONHECIMENTO COM BUSCA VETORIAL =====

// Tabela principal de documentos de conhecimento
export const knowledgeDocuments = pgTable("knowledgeDocuments", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  filePath: text("filePath"),
  fileType: text("fileType").notNull(), // 'pdf' | 'docx' | 'txt' | 'md' | 'html'
  fileSize: integer("fileSize").notNull(),
  metadata: json("metadata").default({}), // Metadados adicionais
  agentId: text("agentId").references(() => agents.id, { onDelete: "cascade" }),
  isGlobal: boolean("isGlobal").notNull().default(false),
  status: text("status").notNull().default("processing"), // 'processing' | 'active' | 'error'
  createdBy: text("createdBy")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Tabela de chunks de documentos
export const knowledgeChunks = pgTable("knowledgeChunks", {
  id: text("id").primaryKey(),
  documentId: text("documentId")
    .notNull()
    .references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  chunkIndex: integer("chunkIndex").notNull(),
  tokenCount: integer("tokenCount"),
  metadata: json("metadata").default({}),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Tabela de embeddings vetoriais (usando pgvector)
export const knowledgeEmbeddings = pgTable("knowledgeEmbeddings", {
  id: text("id").primaryKey(),
  chunkId: text("chunkId")
    .notNull()
    .references(() => knowledgeChunks.id, { onDelete: "cascade" }),
  embedding: json("embedding").notNull(), // VECTOR(1536) - será convertido para JSON no Drizzle
  model: text("model").notNull().default("text-embedding-ada-002"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Tabela de associações agente-documento
export const agentKnowledgeAssociations = pgTable(
  "agentKnowledgeAssociations",
  {
    id: text("id").primaryKey(),
    agentId: text("agentId")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    documentId: text("documentId")
      .notNull()
      .references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
    priority: integer("priority").notNull().default(1),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  }
);
