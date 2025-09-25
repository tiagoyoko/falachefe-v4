# Especificação Técnica - Base de Conhecimento com pgvector

## 1. Visão Geral

### Objetivo

Implementar um sistema de base de conhecimento que permita aos administradores fazer upload de documentos ricos e associá-los a agentes específicos ou torná-los globais, utilizando busca vetorial semântica com pgvector para enriquecer o contexto das conversas.

### Escopo

- Upload e processamento de documentos (PDF, DOCX, TXT, MD, HTML)
- Geração de embeddings usando OpenAI text-embedding-ada-002
- Armazenamento vetorial com pgvector
- Busca semântica por similaridade
- Interface administrativa para gerenciamento
- Integração com sistema de agentes existente

## 2. Requisitos Funcionais

### 2.1 Upload de Documentos

- **RF001**: Administradores podem fazer upload de documentos em formatos suportados
- **RF002**: Sistema valida tipo e tamanho do arquivo antes do processamento
- **RF003**: Administradores podem associar documentos a agentes específicos ou torná-los globais
- **RF004**: Sistema extrai metadados automaticamente (título, autor, data de criação)
- **RF005**: Upload suporta múltiplos arquivos simultaneamente

### 2.2 Processamento de Documentos

- **RF006**: Sistema converte documentos para texto plano preservando estrutura
- **RF007**: Conteúdo é dividido em chunks otimizados para busca (500-1000 tokens)
- **RF008**: Chunks mantêm sobreposição de 50-100 tokens para preservar contexto
- **RF009**: Sistema gera embeddings para cada chunk usando OpenAI API
- **RF010**: Processamento é assíncrono com feedback de progresso

### 2.3 Busca Semântica

- **RF011**: Sistema realiza busca por similaridade semântica usando pgvector
- **RF012**: Busca pode ser filtrada por agente específico ou incluir documentos globais
- **RF013**: Resultados são ordenados por score de similaridade
- **RF014**: Sistema aplica threshold de relevância para filtrar resultados
- **RF015**: Busca retorna contexto enriquecido para o agente

### 2.4 Gerenciamento

- **RF016**: Administradores podem visualizar lista de documentos com filtros
- **RF017**: Sistema permite editar metadados e associações de documentos
- **RF018**: Administradores podem reindexar documentos existentes
- **RF019**: Sistema permite deletar documentos com confirmação
- **RF020**: Interface mostra estatísticas de uso e performance

## 3. Requisitos Não-Funcionais

### 3.1 Performance

- **RNF001**: Upload de documento deve ser processado em menos de 30 segundos
- **RNF002**: Busca semântica deve retornar resultados em menos de 2 segundos
- **RNF003**: Sistema deve suportar até 10.000 documentos simultaneamente
- **RNF004**: Cada documento pode ter até 1MB de tamanho

### 3.2 Escalabilidade

- **RNF005**: Sistema deve suportar crescimento linear com adição de documentos
- **RNF006**: Busca deve manter performance com até 1M de chunks
- **RNF007**: Processamento deve ser distribuível horizontalmente

### 3.3 Segurança

- **RNF008**: Apenas administradores podem gerenciar documentos
- **RNF009**: Arquivos são validados contra malware e conteúdo malicioso
- **RNF010**: Dados sensíveis são criptografados em repouso
- **RNF011**: Acesso é auditado e logado

### 3.4 Disponibilidade

- **RNF012**: Sistema deve ter 99.9% de uptime
- **RNF013**: Falhas de processamento não devem afetar busca existente
- **RNF014**: Backup automático de documentos e embeddings

## 4. Arquitetura de Dados

### 4.1 Schema do Banco

```sql
-- Tabela principal de documentos
CREATE TABLE knowledge_documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt', 'md', 'html')),
  file_size INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'active', 'error')),
  created_by TEXT REFERENCES user(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de chunks de documentos
CREATE TABLE knowledge_chunks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de embeddings vetoriais
CREATE TABLE knowledge_embeddings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chunk_id TEXT NOT NULL REFERENCES knowledge_chunks(id) ON DELETE CASCADE,
  embedding VECTOR(1536) NOT NULL, -- OpenAI ada-002 dimension
  model TEXT DEFAULT 'text-embedding-ada-002',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de associações agente-documento
CREATE TABLE agent_knowledge_associations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, document_id)
);

-- Índices para performance
CREATE INDEX idx_knowledge_documents_agent ON knowledge_documents(agent_id);
CREATE INDEX idx_knowledge_documents_global ON knowledge_documents(is_global);
CREATE INDEX idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX idx_knowledge_chunks_document ON knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_embeddings_chunk ON knowledge_embeddings(chunk_id);

-- Índice vetorial para busca semântica
CREATE INDEX idx_knowledge_embeddings_vector ON knowledge_embeddings
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 4.2 Estruturas de Dados TypeScript

```typescript
// Documento de conhecimento
interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  filePath?: string;
  fileType: "pdf" | "docx" | "txt" | "md" | "html";
  fileSize: number;
  metadata: Record<string, any>;
  agentId?: string;
  isGlobal: boolean;
  status: "processing" | "active" | "error";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Chunk de documento
interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Embedding vetorial
interface KnowledgeEmbedding {
  id: string;
  chunkId: string;
  embedding: number[]; // 1536 dimensions
  model: string;
  createdAt: Date;
}

// Associação agente-documento
interface AgentKnowledgeAssociation {
  id: string;
  agentId: string;
  documentId: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
}

// Resultado de busca
interface SearchResult {
  document: KnowledgeDocument;
  chunk: KnowledgeChunk;
  similarityScore: number;
  relevanceScore: number;
  context: string;
}

// Configuração de upload
interface UploadConfig {
  title: string;
  agentIds?: string[];
  isGlobal?: boolean;
  metadata?: Record<string, any>;
}

// Configuração de busca
interface SearchConfig {
  query: string;
  agentId?: string;
  limit?: number;
  threshold?: number;
  includeGlobal?: boolean;
}
```

## 5. APIs e Endpoints

### 5.1 Upload de Documentos

```typescript
POST /api/knowledge-base/upload
Content-Type: multipart/form-data

Request:
{
  file: File,
  title: string,
  agentIds?: string[],
  isGlobal?: boolean,
  metadata?: Record<string, any>
}

Response:
{
  success: boolean;
  data: {
    documentId: string;
    status: 'processing' | 'active' | 'error';
    message?: string;
  };
  error?: string;
}
```

### 5.2 Busca Semântica

```typescript
POST /api/knowledge-base/search
Content-Type: application/json

Request:
{
  query: string;
  agentId?: string;
  limit?: number;
  threshold?: number;
  includeGlobal?: boolean;
}

Response:
{
  success: boolean;
  data: SearchResult[];
  error?: string;
}
```

### 5.3 Gerenciamento de Documentos

```typescript
GET /api/knowledge-base/documents
Query: ?agentId=string&status=string&page=number&limit=number

Response:
{
  success: boolean;
  data: {
    documents: KnowledgeDocument[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}

PUT /api/knowledge-base/documents/:id
Content-Type: application/json

Request:
{
  title?: string;
  agentIds?: string[];
  isGlobal?: boolean;
  metadata?: Record<string, any>;
}

DELETE /api/knowledge-base/documents/:id

POST /api/knowledge-base/documents/:id/reindex
```

## 6. Serviços e Classes

### 6.1 DocumentProcessor

```typescript
class DocumentProcessor {
  async processDocument(
    file: File,
    config: UploadConfig
  ): Promise<ProcessedDocument>;

  private async extractContent(file: File): Promise<string>;
  private async chunkContent(content: string): Promise<Chunk[]>;
  private async extractMetadata(file: File): Promise<DocumentMetadata>;
  private validateFile(file: File): ValidationResult;
  private sanitizeContent(content: string): string;
}
```

### 6.2 EmbeddingService

```typescript
class EmbeddingService {
  async generateEmbeddings(chunks: Chunk[]): Promise<Embedding[]>;
  async generateQueryEmbedding(query: string): Promise<number[]>;
  async searchSimilar(
    queryEmbedding: number[],
    config: SearchConfig
  ): Promise<SearchResult[]>;

  private async callOpenAI(text: string): Promise<number[]>;
  private calculateSimilarity(a: number[], b: number[]): number;
  private applyThreshold(
    results: SearchResult[],
    threshold: number
  ): SearchResult[];
}
```

### 6.3 KnowledgeBaseService

```typescript
class KnowledgeBaseService {
  async uploadDocument(
    file: File,
    config: UploadConfig
  ): Promise<KnowledgeDocument>;
  async searchKnowledge(
    query: string,
    agentId?: string
  ): Promise<SearchResult[]>;
  async getDocument(id: string): Promise<KnowledgeDocument>;
  async updateDocument(
    id: string,
    updates: Partial<KnowledgeDocument>
  ): Promise<KnowledgeDocument>;
  async deleteDocument(id: string): Promise<void>;
  async reindexDocument(id: string): Promise<void>;
  async getDocuments(filters: DocumentFilters): Promise<PaginatedDocuments>;

  private async saveDocument(document: KnowledgeDocument): Promise<void>;
  private async saveChunks(chunks: KnowledgeChunk[]): Promise<void>;
  private async saveEmbeddings(embeddings: KnowledgeEmbedding[]): Promise<void>;
  private async createAssociations(
    agentIds: string[],
    documentId: string
  ): Promise<void>;
}
```

## 7. Interface de Usuário

### 7.1 Componentes React

```typescript
// Página principal
<KnowledgeBasePage>
  <DocumentUploadModal />
  <DocumentList />
  <SearchAndFilters />
</KnowledgeBasePage>

// Modal de upload
<DocumentUploadModal>
  <FileDropzone />
  <UploadConfigForm />
  <ProgressIndicator />
</DocumentUploadModal>

// Lista de documentos
<DocumentList>
  <DocumentCard />
  <Pagination />
  <BulkActions />
</DocumentList>

// Busca e filtros
<SearchAndFilters>
  <SearchInput />
  <AgentFilter />
  <StatusFilter />
  <DateRangeFilter />
</SearchAndFilters>
```

### 7.2 Hooks Customizados

```typescript
// Hook para gerenciar documentos
const useKnowledgeBase = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File, config: UploadConfig) => { ... };
  const searchDocuments = async (query: string) => { ... };
  const deleteDocument = async (id: string) => { ... };
  const updateDocument = async (id: string, updates: Partial<KnowledgeDocument>) => { ... };

  return { documents, loading, error, uploadDocument, searchDocuments, deleteDocument, updateDocument };
};

// Hook para busca
const useKnowledgeSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async (query: string, config?: SearchConfig) => { ... };

  return { results, searching, search };
};
```

## 8. Configurações e Constantes

### 8.1 Configurações de Embedding

```typescript
const EMBEDDING_CONFIG = {
  model: "text-embedding-ada-002",
  dimensions: 1536,
  batchSize: 100,
  maxRetries: 3,
  timeout: 30000,
  rateLimit: 3000, // requests per minute
};
```

### 8.2 Configurações de Chunking

```typescript
const CHUNKING_CONFIG = {
  maxChunkSize: 1000,
  minChunkSize: 100,
  overlap: 100,
  preserveParagraphs: true,
  splitBy: "paragraph" as const,
};
```

### 8.3 Configurações de Busca

```typescript
const SEARCH_CONFIG = {
  defaultLimit: 10,
  maxLimit: 50,
  similarityThreshold: 0.7,
  includeGlobal: true,
  cacheTTL: 3600, // 1 hour
  timeout: 5000,
};
```

### 8.4 Configurações de Upload

```typescript
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/html",
  ],
  maxFiles: 10,
  processingTimeout: 300000, // 5 minutes
};
```

## 9. Monitoramento e Logs

### 9.1 Métricas de Sistema

```typescript
interface SystemMetrics {
  documentsProcessed: number;
  averageProcessingTime: number;
  searchLatency: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  openAITokenUsage: number;
  cacheHitRate: number;
}
```

### 9.2 Logs Estruturados

```typescript
interface LogEntry {
  timestamp: Date;
  level: "info" | "warn" | "error";
  service: string;
  action: string;
  userId?: string;
  documentId?: string;
  agentId?: string;
  metadata: Record<string, any>;
}
```

### 9.3 Alertas

```typescript
interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  resolved: boolean;
}
```

## 10. Plano de Implementação

### Fase 1: Core (Sprint 1-2)

- [ ] Configurar pgvector no banco de dados
- [ ] Implementar schema de tabelas
- [ ] Criar APIs básicas de upload e busca
- [ ] Implementar processamento de PDF e TXT
- [ ] Criar interface básica de administração

### Fase 2: Funcionalidades Avançadas (Sprint 3-4)

- [ ] Adicionar suporte a DOCX e MD
- [ ] Implementar chunking inteligente
- [ ] Criar sistema de associações agente-documento
- [ ] Desenvolver interface completa de gerenciamento
- [ ] Implementar busca semântica otimizada

### Fase 3: Otimizações (Sprint 5-6)

- [ ] Adicionar cache de embeddings
- [ ] Implementar processamento assíncrono
- [ ] Criar sistema de métricas e monitoramento
- [ ] Otimizar performance de busca
- [ ] Implementar backup e recuperação

### Fase 4: Recursos Avançados (Sprint 7-8)

- [ ] Upload em lote
- [ ] Versionamento de documentos
- [ ] Busca avançada com filtros
- [ ] Integração com storage externo
- [ ] Analytics e relatórios

## 11. Testes

### 11.1 Testes Unitários

- Processamento de diferentes formatos de arquivo
- Geração de embeddings
- Algoritmos de chunking
- Validações de entrada
- Cálculos de similaridade

### 11.2 Testes de Integração

- Upload e processamento end-to-end
- Busca semântica com dados reais
- Associação com agentes
- Performance com grandes volumes

### 11.3 Testes de Performance

- Tempo de processamento por documento
- Latência de busca
- Uso de memória e CPU
- Escalabilidade com crescimento

### 11.4 Testes de Usabilidade

- Interface de upload intuitiva
- Navegação e busca eficiente
- Feedback claro para usuário
- Responsividade em diferentes dispositivos
