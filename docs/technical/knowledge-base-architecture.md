# Arquitetura da Base de Conhecimento com pgvector

## Diagrama de Arquitetura

```mermaid
graph TB
    subgraph "Frontend"
        A[Admin UI<br/>/admin/knowledge-base]
        B[Upload Modal]
        C[Document List]
        D[Search Interface]
    end

    subgraph "API Layer"
        E[Upload API<br/>/api/kb/upload]
        F[Search API<br/>/api/kb/search]
        G[Management API<br/>/api/kb/documents]
    end

    subgraph "Processing Layer"
        H[Document Processor]
        I[Chunking Service]
        J[Embedding Generator]
        K[OpenAI API]
    end

    subgraph "Database Layer"
        L[(PostgreSQL + pgvector)]
        M[knowledge_documents]
        N[knowledge_chunks]
        O[knowledge_embeddings]
        P[agent_knowledge_associations]
    end

    subgraph "Storage"
        Q[File System<br/>Documents]
        R[Cache Layer<br/>Embeddings]
    end

    subgraph "Agent Integration"
        S[Agent Context]
        T[Search Service]
        U[Response Enhancement]
    end

    A --> E
    A --> F
    A --> G
    B --> E
    C --> G
    D --> F

    E --> H
    F --> T
    G --> L

    H --> I
    H --> Q
    I --> J
    J --> K
    J --> R

    H --> M
    I --> N
    J --> O
    E --> P

    T --> L
    T --> S
    S --> U

    L --> M
    L --> N
    L --> O
    L --> P
```

## Fluxo de Upload de Documento

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant UI as Admin UI
    participant API as Upload API
    participant Proc as Document Processor
    participant Chunk as Chunking Service
    participant Embed as Embedding Generator
    participant OpenAI as OpenAI API
    participant DB as PostgreSQL + pgvector

    Admin->>UI: Upload documento
    UI->>API: POST /api/kb/upload
    API->>Proc: processDocument(file)

    Proc->>Proc: Validar arquivo
    Proc->>Proc: Extrair conteúdo
    Proc->>Chunk: chunkContent(content)
    Chunk->>Chunk: Dividir em segmentos
    Chunk->>Embed: generateEmbeddings(chunks)

    Embed->>OpenAI: text-embedding-ada-002
    OpenAI-->>Embed: embeddings[]
    Embed-->>Chunk: embeddings[]

    Chunk->>DB: Salvar documento
    Chunk->>DB: Salvar chunks
    Chunk->>DB: Salvar embeddings
    Chunk->>DB: Criar associações

    DB-->>API: Documento criado
    API-->>UI: Sucesso
    UI-->>Admin: Documento processado
```

## Fluxo de Busca Semântica

```mermaid
sequenceDiagram
    participant Agent as Agente IA
    participant Search as Search Service
    participant Embed as Embedding Generator
    participant OpenAI as OpenAI API
    participant DB as PostgreSQL + pgvector
    participant Context as Context Service

    Agent->>Search: searchKnowledge(query, agentId)
    Search->>Embed: generateQueryEmbedding(query)
    Embed->>OpenAI: text-embedding-ada-002
    OpenAI-->>Embed: query_embedding
    Embed-->>Search: query_embedding

    Search->>DB: Busca vetorial
    Note over DB: SELECT com pgvector<br/>ORDER BY similarity
    DB-->>Search: resultados[]

    Search->>Search: Aplicar filtros
    Search->>Search: Ordenar por relevância
    Search->>Context: Enriquecer contexto

    Context-->>Agent: Contexto enriquecido
    Agent->>Agent: Gerar resposta
```

## Estrutura de Dados

### Documento

```typescript
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
```

### Chunk

```typescript
interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
}
```

### Embedding

```typescript
interface KnowledgeEmbedding {
  id: string;
  chunkId: string;
  embedding: number[]; // 1536 dimensions
  model: string;
  createdAt: Date;
}
```

### Resultado de Busca

```typescript
interface SearchResult {
  document: KnowledgeDocument;
  chunk: KnowledgeChunk;
  similarityScore: number;
  relevanceScore: number;
  context: string;
}
```

## Configurações de Performance

### Chunking

- **Tamanho máximo**: 1000 tokens
- **Sobreposição**: 100 tokens
- **Estratégia**: Por parágrafo
- **Preservar estrutura**: Sim

### Embeddings

- **Modelo**: text-embedding-ada-002
- **Dimensões**: 1536
- **Batch size**: 100
- **Rate limit**: 3000/min

### Busca

- **Limite padrão**: 10 resultados
- **Threshold**: 0.7
- **Cache TTL**: 1 hora
- **Timeout**: 5 segundos

## Monitoramento

### Métricas de Sistema

- Documentos processados/min
- Latência de busca (p50, p95, p99)
- Taxa de erro de upload
- Uso de tokens OpenAI

### Métricas de Negócio

- Documentos por agente
- Buscas por dia
- Taxa de relevância
- Satisfação do usuário

### Alertas

- Falha de processamento > 5%
- Latência de busca > 2s
- Rate limit OpenAI
- Espaço em disco < 20%
