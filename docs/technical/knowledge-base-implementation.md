# Implementação Técnica - Base de Conhecimento com pgvector

## Arquitetura do Sistema

### Componentes Principais

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Upload API    │───▶│  Document        │───▶│   pgvector      │
│   /api/kb/upload│    │  Processor       │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin UI      │    │   Embedding      │    │   Search API    │
│   /admin/kb     │    │   Generator      │    │   /api/kb/search│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Stack Tecnológico

- **Banco de Dados**: PostgreSQL + pgvector
- **Embeddings**: OpenAI text-embedding-ada-002
- **Processamento**: Node.js + TypeScript
- **Frontend**: Next.js + React
- **Storage**: Local filesystem (futuro: S3/MinIO)

## Schema do Banco de Dados

### Tabela de Documentos

```sql
CREATE TABLE knowledge_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  metadata JSONB DEFAULT '{}',
  agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'processing', -- processing, active, error
  created_by TEXT REFERENCES user(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela de Chunks

```sql
CREATE TABLE knowledge_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela de Embeddings

```sql
CREATE TABLE knowledge_embeddings (
  id TEXT PRIMARY KEY,
  chunk_id TEXT REFERENCES knowledge_chunks(id) ON DELETE CASCADE,
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  model TEXT DEFAULT 'text-embedding-ada-002',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca vetorial
CREATE INDEX ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops);
```

### Tabela de Associações Agente-Documento

```sql
CREATE TABLE agent_knowledge_associations (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  document_id TEXT REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, document_id)
);
```

## APIs Implementadas

### 1. Upload de Documentos

```typescript
POST /api/knowledge-base/upload
Content-Type: multipart/form-data

{
  file: File,
  title: string,
  agentIds?: string[],
  isGlobal?: boolean,
  metadata?: Record<string, any>
}
```

### 2. Busca Semântica

```typescript
POST /api/knowledge-base/search
{
  query: string,
  agentId?: string,
  limit?: number,
  threshold?: number,
  includeGlobal?: boolean
}
```

### 3. Gerenciamento de Documentos

```typescript
GET /api/knowledge-base/documents
PUT /api/knowledge-base/documents/:id
DELETE /api/knowledge-base/documents/:id
POST /api/knowledge-base/documents/:id/reindex
```

## Serviços Principais

### DocumentProcessor

```typescript
class DocumentProcessor {
  async processDocument(
    file: File,
    options: ProcessOptions
  ): Promise<ProcessedDocument>;
  private chunkContent(content: string): Chunk[];
  private extractMetadata(file: File): DocumentMetadata;
  private validateFile(file: File): ValidationResult;
}
```

### EmbeddingService

```typescript
class EmbeddingService {
  async generateEmbeddings(chunks: Chunk[]): Promise<Embedding[]>;
  async searchSimilar(
    query: string,
    options: SearchOptions
  ): Promise<SearchResult[]>;
  private callOpenAI(text: string): Promise<number[]>;
  private calculateSimilarity(
    embedding1: number[],
    embedding2: number[]
  ): number;
}
```

### KnowledgeBaseService

```typescript
class KnowledgeBaseService {
  async uploadDocument(file: File, config: UploadConfig): Promise<Document>;
  async searchKnowledge(
    query: string,
    agentId?: string
  ): Promise<SearchResult[]>;
  async getDocument(id: string): Promise<Document>;
  async updateDocument(
    id: string,
    updates: Partial<Document>
  ): Promise<Document>;
  async deleteDocument(id: string): Promise<void>;
  async reindexDocument(id: string): Promise<void>;
}
```

## Processamento de Documentos

### Pipeline de Processamento

1. **Upload e Validação**
   - Verificar tipo de arquivo suportado
   - Validar tamanho máximo
   - Sanitizar nome do arquivo

2. **Extração de Conteúdo**
   - PDF: pdf-parse
   - DOCX: mammoth
   - TXT: leitura direta
   - MD: marked

3. **Chunking Inteligente**
   - Dividir por parágrafos
   - Preservar contexto
   - Tamanho otimizado (500-1000 tokens)
   - Sobreposição de 50-100 tokens

4. **Geração de Embeddings**
   - Chamada para OpenAI API
   - Rate limiting
   - Retry com backoff
   - Cache de embeddings

5. **Armazenamento**
   - Salvar documento
   - Salvar chunks
   - Salvar embeddings
   - Criar associações

### Estratégias de Chunking

```typescript
interface ChunkingStrategy {
  chunkSize: number; // 500-1000 tokens
  overlap: number; // 50-100 tokens
  preserveStructure: boolean;
  splitBy: "paragraph" | "sentence" | "character";
}
```

## Busca Semântica

### Algoritmo de Busca

1. **Geração de Query Embedding**
   - Converter query em embedding
   - Usar mesmo modelo dos documentos

2. **Busca Vetorial**
   - Usar pgvector para busca por similaridade
   - Aplicar filtros por agente
   - Ordenar por score de similaridade

3. **Pós-processamento**
   - Aplicar threshold de relevância
   - Limitar número de resultados
   - Incluir contexto adicional

### Query SQL Otimizada

```sql
SELECT
  kd.title,
  kd.content,
  kc.content as chunk_content,
  1 - (ke.embedding <=> $1::vector) as similarity_score
FROM knowledge_embeddings ke
JOIN knowledge_chunks kc ON ke.chunk_id = kc.id
JOIN knowledge_documents kd ON kc.document_id = kd.id
LEFT JOIN agent_knowledge_associations aka ON kd.id = aka.document_id
WHERE
  (kd.is_global = true OR aka.agent_id = $2)
  AND kd.status = 'active'
  AND aka.is_active = true
ORDER BY ke.embedding <=> $1::vector
LIMIT $3;
```

## Interface de Usuário

### Componentes React

```typescript
// Página principal
<KnowledgeBasePage />

// Upload de documentos
<DocumentUploadModal />

// Lista de documentos
<DocumentList />

// Busca e filtros
<SearchAndFilters />

// Detalhes do documento
<DocumentDetails />
```

### Estados e Hooks

```typescript
// Hook para gerenciar documentos
const useKnowledgeBase = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File, config: UploadConfig) => { ... };
  const searchDocuments = async (query: string) => { ... };
  const deleteDocument = async (id: string) => { ... };

  return { documents, loading, error, uploadDocument, searchDocuments, deleteDocument };
};
```

## Configurações e Otimizações

### Parâmetros de Embedding

```typescript
const EMBEDDING_CONFIG = {
  model: "text-embedding-ada-002",
  dimensions: 1536,
  batchSize: 100,
  maxRetries: 3,
  timeout: 30000,
};
```

### Configurações de Chunking

```typescript
const CHUNKING_CONFIG = {
  maxChunkSize: 1000,
  minChunkSize: 100,
  overlap: 100,
  preserveParagraphs: true,
};
```

### Configurações de Busca

```typescript
const SEARCH_CONFIG = {
  defaultLimit: 10,
  maxLimit: 50,
  similarityThreshold: 0.7,
  includeGlobal: true,
};
```

## Monitoramento e Métricas

### Métricas de Performance

- Tempo de processamento por documento
- Latência de busca
- Taxa de sucesso de upload
- Uso de tokens da OpenAI

### Métricas de Qualidade

- Score médio de similaridade
- Taxa de documentos relevantes
- Feedback dos usuários
- Redução de perguntas não respondidas

### Alertas e Monitoramento

- Falhas de processamento
- Rate limiting da OpenAI
- Uso excessivo de recursos
- Documentos com erro

## Segurança e Privacidade

### Validação de Arquivos

```typescript
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file: File): ValidationResult => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Tipo de arquivo não suportado" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Arquivo muito grande" };
  }

  return { valid: true };
};
```

### Sanitização de Conteúdo

```typescript
const sanitizeContent = (content: string): string => {
  // Remover scripts maliciosos
  // Sanitizar HTML
  // Limitar tamanho
  // Validar encoding
  return content;
};
```

## Roadmap de Implementação

### Fase 1: Core (Sprint 1-2)

- [ ] Schema do banco de dados
- [ ] APIs básicas de upload e busca
- [ ] Processamento de PDF e TXT
- [ ] Interface básica de administração

### Fase 2: Funcionalidades Avançadas (Sprint 3-4)

- [ ] Suporte a DOCX e MD
- [ ] Chunking inteligente
- [ ] Associações agente-documento
- [ ] Interface completa de gerenciamento

### Fase 3: Otimizações (Sprint 5-6)

- [ ] Cache de embeddings
- [ ] Processamento assíncrono
- [ ] Métricas e monitoramento
- [ ] Otimizações de performance

### Fase 4: Recursos Avançados (Sprint 7-8)

- [ ] Upload em lote
- [ ] Versionamento de documentos
- [ ] Busca avançada com filtros
- [ ] Integração com storage externo
