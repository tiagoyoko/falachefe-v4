# Data Models and APIs

## Data Models

Primary models relevant to Agent Squad enhancement:

- **Core Schema**: See `src/lib/schema.ts` (comprehensive Drizzle schema)
- **User Model**: Lines 11-21, includes role-based access
- **Agent Models**: Lines 280-308, dynamic agent configuration  
- **Conversation Models**: Lines 231-276, session and message storage
- **Knowledge Base**: Lines 361-418, RAG with pgvector embeddings

## Key Database Tables for Agent Squad

```typescript
// From src/lib/schema.ts - Critical tables for enhancement:

agents                    // Dynamic agent configuration
agentSettings            // User-specific agent preferences  
conversationSessions     // Session management
conversationMessages     // Message history
knowledgeDocuments       // RAG content
knowledgeEmbeddings      // Vector search
```

## API Specifications

- **Agent API**: `src/app/api/agent/` - Agent interaction endpoints
- **Chat API**: `src/app/api/chat/route.ts` - Simple streaming chat
- **Admin API**: `src/app/api/admin/agents/` - Agent management
- **WhatsApp Webhook**: `src/app/api/uazapi/webhook/route.ts`

**Key Endpoint Pattern**: Next.js App Router uses file-based routing in `src/app/api/`
