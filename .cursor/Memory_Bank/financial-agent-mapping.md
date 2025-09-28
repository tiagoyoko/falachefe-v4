# Mapeamento Completo do Agente Financeiro (Leo) - FalaChefe

## Visão Geral
O Agente Financeiro (Leo) é um agente especializado em gestão financeira para pequenos empreendedores, integrado ao sistema FalaChefe via WhatsApp. Este documento mapeia todas as suas funções, atividades e operações no banco de dados.

## Arquitetura Atual

### Componentes Principais
- **Agente Leo** (`src/agents/leo.ts`): Interface principal do agente
- **LLMService** (`src/lib/llm-service.ts`): Lógica de processamento e operações
- **RAG Service** (`src/lib/rag.ts`): Base de conhecimento financeiro
- **Context Service** (`src/lib/context-service.ts`): Gerenciamento de contexto
- **Persistent Memory** (`src/lib/persistent-memory-service.ts`): Memória persistente
- **Categorization Service** (`src/lib/categorization-service.ts`): Categorização automática

## Funções e Atividades do Agente Financeiro

### 1. Processamento de Mensagens

#### 1.1 Detecção de Tipo de Consulta
```typescript
function isKnowledgeQuery(message: string): boolean
```
- **Função**: Identifica se a mensagem é uma consulta conceitual/explicativa
- **Padrões detectados**: 
  - Perguntas iniciadas com "como", "o que", "qual", "quando", "por que"
  - Palavras-chave: "relatório", "balanço", "lucro", "margem", "demonstração", "conceito"
- **Resultado**: Direciona para RAG (base de conhecimento) ou LLMService (operações)

#### 1.2 Processamento via RAG
- **Quando**: Consultas conceituais/explicativas
- **Fonte**: Base de conhecimento financeiro (`src/lib/rag.ts`)
- **Processo**:
  1. Busca chunks relevantes na base de conhecimento
  2. Gera resposta contextualizada com conceitos financeiros
  3. Mantém tom claro, firme e amigável

#### 1.3 Processamento via LLMService
- **Quando**: Comandos operacionais e transações
- **Processo**:
  1. Detecção de comando de transação
  2. Resposta a transações pendentes
  3. Comandos de categorização
  4. Consultas gerais com contexto

### 2. Gestão de Transações Financeiras

#### 2.1 Detecção de Comandos de Transação
```typescript
async detectTransactionCommand(message: string)
```
- **Função**: Identifica comandos de registro de transações
- **Padrões detectados**:
  - "registre receita de R$ X"
  - "registre despesa de R$ X"
  - "adicionar transação"
  - "lançar receita/despesa"
- **Retorna**: Objeto com tipo, descrição, valor, categoria e data

#### 2.2 Processamento de Comandos de Transação
```typescript
private async handleTransactionCommand(context, command)
```
- **Funções**:
  - Validação de dados da transação
  - Criação de transação no banco
  - Categorização automática
  - Confirmação para o usuário
  - Atualização de contexto

#### 2.3 Criação de Transações
```typescript
// Via API: POST /api/transactions
async createTransaction(userId, transactionData)
```
- **Parâmetros**:
  - `userId`: ID do usuário
  - `description`: Descrição da transação
  - `amount`: Valor (positivo para receita, negativo para despesa)
  - `type`: "receita" ou "despesa"
  - `categoryId`: ID da categoria
  - `transactionDate`: Data da transação
  - `spreadsheetId`: ID da planilha (opcional)
  - `autoCategorize`: Categorização automática (padrão: true)
- **Operações no banco**:
  - Inserção na tabela `transactions`
  - Atualização de contexto do usuário
  - Log de comando na tabela `agentCommands`

### 3. Sistema de Categorização

#### 3.1 Categorização Automática
```typescript
async categorizeTransaction(description, amount, type)
```
- **Função**: Categoriza automaticamente transações baseada na descrição
- **Categorias padrão**:
  - **Receitas**: Vendas, Serviços, Outros
  - **Despesas**: Fornecedores, Marketing, Operacionais, Pessoal
- **Processo**:
  1. Análise da descrição usando LLM
  2. Mapeamento para categoria mais provável
  3. Confirmação com usuário se necessário

#### 3.2 Gestão de Categorias
```typescript
// Via API: POST /api/categories
async createCategory(userId, name, type, color)
// Via API: PUT /api/categories
async updateCategory(categoryId, userId, name, color)
// Via API: DELETE /api/categories
async deleteCategory(categoryId, userId)
```
- **Funções**:
  - Criação de novas categorias
  - Edição de categorias existentes
  - Exclusão de categorias (soft delete se houver transações)
  - Listagem de categorias do usuário

### 4. Relatórios e Consultas Financeiras

#### 4.1 Resumo Financeiro
```typescript
async getFinancialSummary(userId, period)
```
- **Função**: Gera resumo financeiro do período
- **Dados incluídos**:
  - Total de receitas
  - Total de despesas
  - Saldo líquido
  - Transações recentes
  - Análise por categoria
- **Períodos suportados**: Hoje, semana, mês, trimestre, ano

#### 4.2 Consultas Específicas
```typescript
async getTransactionsByCategory(userId, category, period)
async getTransactionsByType(userId, type, period)
async getTransactionsByDateRange(userId, startDate, endDate)
```
- **Funções**:
  - Filtros por categoria
  - Filtros por tipo (receita/despesa)
  - Filtros por período
  - Ordenação por data, valor, categoria

### 5. Gestão de Contexto e Memória

#### 5.1 Contexto do Usuário
```typescript
async getUserContext(userId)
```
- **Dados coletados**:
  - Informações do usuário
  - Transações recentes (últimos 30 dias)
  - Categorias personalizadas
  - Saldo atual
  - Histórico de conversas
- **Uso**: Personalização de respostas e sugestões

#### 5.2 Memória Persistente
```typescript
async getOrCreateSession(userId, agent)
async saveMessage(sessionId, role, content)
async getConversationHistory(sessionId, limit)
```
- **Funções**:
  - Criação/manutenção de sessões de conversa
  - Salvamento de mensagens
  - Recuperação de histórico
  - Limpeza de contextos expirados

### 6. Comandos de Negócio Especializados

#### 6.1 Processamento de Comandos de Negócio
```typescript
async processBusinessCommand(userId, command, commandType)
```
- **Tipos suportados**:
  - `finance`: Comandos financeiros específicos
  - `marketing`: Comandos de marketing
  - `sales`: Comandos de vendas
  - `general`: Comandos gerais
- **Processo**:
  1. Validação do tipo de comando
  2. Busca de contexto do usuário
  3. Processamento especializado
  4. Resposta contextualizada

## Operações Detalhadas no Banco de Dados

### Tabelas Utilizadas

#### 1. `users`
- **Uso**: Validação de usuário e coleta de dados básicos
- **Operações**: 
  - `SELECT`: Validação de existência do usuário
  - Campos: `id`, `email`, `name`, `createdAt`

#### 2. `transactions`
- **Uso**: Armazenamento de transações financeiras
- **Estrutura**:
  ```sql
  CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spreadsheetId TEXT REFERENCES spreadsheets(id) ON DELETE CASCADE,
    categoryId TEXT REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL, -- 'receita' ou 'despesa'
    transactionDate TIMESTAMP NOT NULL,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
  );
  ```
- **Operações**:
  - `INSERT`: Criação de novas transações via `POST /api/transactions`
  - `SELECT`: Consultas e relatórios com filtros por período, tipo, categoria
  - `UPDATE`: Atualização de categoria via `PUT /api/transactions`
  - `DELETE`: Não implementado (apenas soft delete)

#### 3. `categories`
- **Uso**: Gestão de categorias de transações
- **Estrutura**:
  ```sql
  CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'receita' ou 'despesa'
    color TEXT DEFAULT '#6B7280',
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
  );
  ```
- **Operações**:
  - `INSERT`: Criação de categorias via `POST /api/categories`
  - `SELECT`: Listagem com contagem de transações via `GET /api/categories`
  - `UPDATE`: Edição de categorias via `PUT /api/categories`
  - `DELETE`: Soft delete (desativação) se houver transações vinculadas

#### 4. `agentCommands`
- **Uso**: Log de comandos processados pelo agente
- **Estrutura**:
  ```sql
  CREATE TABLE agentCommands (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    response TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT NOW()
  );
  ```
- **Operações**:
  - `INSERT`: Registro de comandos processados
  - `SELECT`: Histórico de comandos (não implementado)

#### 5. `conversationSessions`
- **Uso**: Sessões de conversa persistente
- **Estrutura**:
  ```sql
  CREATE TABLE conversationSessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent TEXT NOT NULL, -- 'financeiro' | 'max' | 'geral'
    title TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
  );
  ```
- **Operações**:
  - `INSERT`: Criação de sessões
  - `SELECT`: Recuperação de sessões ativas
  - `UPDATE`: Atualização de timestamp

#### 6. `conversationMessages`
- **Uso**: Mensagens das conversas
- **Estrutura**:
  ```sql
  CREATE TABLE conversationMessages (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL REFERENCES conversationSessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user' | 'assistant'
    content TEXT NOT NULL,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT NOW()
  );
  ```
- **Operações**:
  - `INSERT`: Salvamento de mensagens
  - `SELECT`: Recuperação de histórico com paginação

#### 7. `agentProfiles`
- **Uso**: Perfis e configurações dos agentes
- **Estrutura**:
  ```sql
  CREATE TABLE agentProfiles (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent TEXT NOT NULL, -- 'financeiro' | 'max' | 'geral'
    settings JSON, -- preferências, persona, canais, objetivos
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
  );
  ```
- **Operações**:
  - `INSERT`: Criação de perfis
  - `SELECT`: Recuperação de configurações
  - `UPDATE`: Atualização de perfis

### Queries Principais Implementadas

#### 1. Consulta de Transações por Período
```sql
-- Busca transações dos últimos 30 dias
SELECT description, amount, type, transactionDate
FROM transactions 
WHERE userId = ? AND transactionDate >= ?
ORDER BY transactionDate DESC
LIMIT 10;
```

#### 2. Resumo Financeiro
```sql
-- Calcula totais por tipo
SELECT 
  type,
  SUM(amount) as total,
  COUNT(*) as count
FROM transactions 
WHERE userId = ? AND transactionDate BETWEEN ? AND ?
GROUP BY type;
```

#### 3. Categorias com Contagem de Transações
```sql
-- Lista categorias com número de transações
SELECT 
  c.id, c.name, c.type, c.color, c.createdAt,
  COUNT(t.id) as transactionCount
FROM categories c
LEFT JOIN transactions t ON c.id = t.categoryId
WHERE c.userId = ? AND c.isActive = true
GROUP BY c.id
ORDER BY c.createdAt DESC;
```

#### 4. Transações por Categoria
```sql
-- Agrupa transações por categoria
SELECT 
  t.categoryId,
  SUM(t.amount) as total
FROM transactions t
WHERE t.userId = ? AND t.type = ? AND t.transactionDate BETWEEN ? AND ?
GROUP BY t.categoryId;
```

#### 5. Histórico de Conversa
```sql
-- Busca mensagens recentes da sessão
SELECT role, content, createdAt
FROM conversationMessages 
WHERE sessionId = ? 
ORDER BY createdAt DESC 
LIMIT ?;
```

### Operações de API Implementadas

#### 1. Transações (`/api/transactions`)
- **GET**: Lista transações com filtros
- **POST**: Cria nova transação com categorização automática
- **PUT**: Atualiza categoria de transação existente

#### 2. Categorias (`/api/categories`)
- **GET**: Lista categorias do usuário com contagem
- **POST**: Cria nova categoria
- **PUT**: Atualiza categoria existente
- **DELETE**: Remove categoria (soft delete se necessário)

#### 3. Confirmação de Transações (`/api/transactions/confirm`)
- **POST**: Confirma transação pendente com dados completos

#### 4. Agente (`/api/agent`)
- **POST**: Processa mensagem do usuário
- **GET**: Status do agente

#### 5. Comandos de Negócio (`/api/agent/business`)
- **POST**: Processa comandos especializados por área

## Integrações Externas

### 1. OpenAI API
- **Uso**: Processamento de linguagem natural
- **Modelos**: GPT-4o-mini (padrão)
- **Funções**:
  - Detecção de comandos
  - Categorização de transações
  - Geração de respostas
  - Análise de contexto

### 2. Base de Conhecimento (RAG)
- **Uso**: Consultas conceituais financeiras
- **Fonte**: Documentos financeiros indexados
- **Processo**:
  1. Busca semântica de chunks relevantes
  2. Geração de resposta contextualizada
  3. Citação de fontes quando apropriado

### 3. WhatsApp (UAZAPI)
- **Uso**: Interface de comunicação
- **Funções**:
  - Recebimento de mensagens
  - Envio de respostas
  - Processamento de mídia (áudio, imagem)

## Fluxo de Funcionamento

### 1. Recebimento de Mensagem
```
WhatsApp → Webhook → Leo Agent → Detecção de Tipo
```

### 2. Processamento
```
Tipo Conceitual → RAG → Resposta Baseada em Conhecimento
Tipo Operacional → LLMService → Processamento de Comando
```

### 3. Execução
```
Comando de Transação → Validação → Criação no BD → Confirmação
Comando de Consulta → Busca no BD → Formatação → Resposta
```

### 4. Resposta
```
Resposta Formatada → WhatsApp → Usuário
```

## Métricas e Monitoramento

### Métricas de Performance
- Tempo de resposta por tipo de comando
- Taxa de sucesso na categorização
- Precisão das respostas conceituais
- Uso de memória persistente

### Logs Importantes
- Comandos processados
- Erros de validação
- Operações no banco de dados
- Tempo de processamento

## Próximos Passos para Integração Agent Squad

### 1. Mapeamento para Agent Squad
- **Orquestrador**: Substituir supervisor atual
- **Classificador**: Implementar classificação multi-camada
- **Storage Adapter**: Mapear para Drizzle/PostgreSQL
- **Agentes**: Wrapper para Leo com interface Agent Squad

### 2. Funcionalidades a Manter
- Todas as funções de transação
- Sistema de categorização
- Relatórios financeiros
- Memória persistente
- Integração RAG

### 3. Melhorias com Agent Squad
- Roteamento mais inteligente
- Classificação de intenções aprimorada
- Gestão de contexto centralizada
- Escalabilidade para múltiplos agentes

### 4. Estrutura de Dados para Agent Squad
- Manter todas as tabelas existentes
- Adicionar tabelas específicas do Agent Squad:
  - `agent_sessions`: Sessões do Agent Squad
  - `agent_classifications`: Classificações de intenções
  - `agent_routing`: Log de roteamento entre agentes

---

**Documento criado em**: 27/01/2025  
**Versão**: 1.0  
**Autor**: Time de Desenvolvimento FalaChefe