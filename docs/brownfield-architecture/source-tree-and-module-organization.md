# Source Tree and Module Organization

## Project Structure (Actual)

```text
project-root/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes (REST endpoints)
│   │   ├── admin/           # Admin panel pages
│   │   ├── auth/            # Authentication pages  
│   │   ├── chat/            # Chat interface
│   │   └── dashboard/       # User dashboard
│   ├── components/          # React components (shadcn/ui based)
│   ├── lib/                 # Core business logic
│   │   ├── orchestrator/    # Agent Squad implementation
│   │   ├── knowledge-base/  # RAG system
│   │   └── *.ts            # Various services
│   ├── agents/              # AI agent definitions
│   │   ├── squad/           # OpenAI agent implementations
│   │   └── *.ts            # Agent types and base classes
│   ├── hooks/               # React hooks
│   └── middleware.ts        # Next.js middleware
├── docs/                    # Documentation
├── drizzle/                 # Database migrations
├── scripts/                 # Utility scripts
└── *.config.*              # Configuration files
```

## Key Modules and Their Purpose

- **Agent Orchestration**: `src/lib/orchestrator/enhanced-agent-squad.ts` - Main orchestration logic
- **Agent Implementations**: `src/agents/squad/` - Leo (financial), Max (general), Lia (marketing) agents
- **Session Management**: `src/lib/orchestrator/session-manager.ts` - Conversation persistence
- **Classification**: `src/lib/orchestrator/multi-layer-classifier.ts` - Intent classification
- **Storage**: `src/lib/orchestrator/drizzle-storage.ts` - Database abstraction for Agent Squad
- **WhatsApp Integration**: `src/lib/uazapi-service.ts` - CRITICAL: Third-party WhatsApp API
- **Knowledge Base**: `src/lib/knowledge-base/` - RAG implementation with pgvector
