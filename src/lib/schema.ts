import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  json,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified"),
  image: text("image"),
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
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
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
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
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
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
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
