# FalaChefe v4 - Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the FalaChefe v4 codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on the Agent Squad enhancement, specifically implementing the PRD: "Agent Squad FalaChefe v4".

### Document Scope

Focused on areas relevant to: **Agent Squad implementation for orchestrating multiple specialized AI agents with hybrid memory management and multi-channel integration**

### Change Log

| Date   | Version | Description                 | Author    |
| ------ | ------- | --------------------------- | --------- |
| 2025-01-29 | 1.0     | Initial brownfield analysis | Winston (Architect) |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/app/page.tsx` (Next.js App Router root)
- **Configuration**: `.env.example`, `drizzle.config.ts`, `package.json`
- **Core Business Logic**: `src/lib/orchestrator/`, `src/agents/squad/`
- **API Definitions**: `src/app/api/` (Next.js API routes)
- **Database Models**: `src/lib/schema.ts` (Drizzle ORM)
- **Key Algorithms**: `src/lib/orchestrator/enhanced-agent-squad.ts`, `src/lib/orchestrator/multi-layer-classifier.ts`

### Enhancement Impact Areas (per PRD)

Files/modules that will be affected by the Agent Squad enhancement:
- `src/lib/orchestrator/enhanced-agent-squad.ts` - Core orchestration logic
- `src/agents/squad/` - Agent implementations  
- `src/lib/orchestrator/drizzle-storage.ts` - Storage layer
- `src/lib/orchestrator/session-manager.ts` - Session management
- `src/lib/schema.ts` - Database schema extensions
- `src/app/api/agent/` - Agent API endpoints
- `src/components/` - Admin interfaces

## High Level Architecture

### Technical Summary

FalaChefe v4 is a Next.js 15 application built with TypeScript and the App Router pattern. It implements a business automation platform via WhatsApp using specialized AI agents. The current system partially implements the Agent Squad pattern but requires enhancement for full PRD compliance.

**Architecture Status**: 
- ✅ **Partial Agent Squad Implementation**: Basic orchestration exists but needs multi-layer classification
- ✅ **Database Layer**: PostgreSQL with Drizzle ORM, comprehensive schema
- ✅ **Authentication**: Supabase-based auth with user management  
- ⚠️ **Memory Management**: Sessions exist but hybrid memory (Redis + PostgreSQL) not fully implemented
- ⚠️ **Multi-Channel**: Web chat exists, WhatsApp integration partial
- ⚠️ **Observability**: Basic logging, needs LangSmith integration

### Actual Tech Stack (from package.json)

| Category  | Technology | Version | Notes                      |
| --------- | ---------- | ------- | -------------------------- |
| Runtime   | Node.js    | 20.x    | Required by package.json engines |
| Framework | Next.js    | ^15.5.3 | App Router pattern, React 19 |
| Language  | TypeScript | ^5      | Strict typing enabled |
| Database  | PostgreSQL | -       | Via Drizzle ORM + Supabase |
| ORM       | Drizzle    | ^0.44.4 | Schema-first approach |
| AI SDK    | Vercel AI SDK | ^5.0.9 | With OpenAI integration |
| Agent Library | agent-squad | ^1.0.1 | Core orchestration |
| Auth      | Supabase   | ^2.58.0 | With SSR support |
| Styling   | Tailwind CSS | ^4     | Utility-first |
| UI Components | Radix UI | Various | shadcn/ui foundation |
| Package Manager | pnpm   | >=9.0.0 | Required for development |

### Repository Structure Reality Check

- Type: Monorepo
- Package Manager: pnpm (enforced by engines)
- Notable: Uses Next.js App Router (not Pages Router), Python integration for core AI components

## Source Tree and Module Organization

### Project Structure (Actual)

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

### Key Modules and Their Purpose

- **Agent Orchestration**: `src/lib/orchestrator/enhanced-agent-squad.ts` - Main orchestration logic
- **Agent Implementations**: `src/agents/squad/` - Leo (financial), Max (general), Lia (marketing) agents
- **Session Management**: `src/lib/orchestrator/session-manager.ts` - Conversation persistence
- **Classification**: `src/lib/orchestrator/multi-layer-classifier.ts` - Intent classification
- **Storage**: `src/lib/orchestrator/drizzle-storage.ts` - Database abstraction for Agent Squad
- **WhatsApp Integration**: `src/lib/uazapi-service.ts` - CRITICAL: Third-party WhatsApp API
- **Knowledge Base**: `src/lib/knowledge-base/` - RAG implementation with pgvector

## Data Models and APIs

### Data Models

Primary models relevant to Agent Squad enhancement:

- **Core Schema**: See `src/lib/schema.ts` (comprehensive Drizzle schema)
- **User Model**: Lines 11-21, includes role-based access
- **Agent Models**: Lines 280-308, dynamic agent configuration  
- **Conversation Models**: Lines 231-276, session and message storage
- **Knowledge Base**: Lines 361-418, RAG with pgvector embeddings

### Key Database Tables for Agent Squad

```typescript
// From src/lib/schema.ts - Critical tables for enhancement:

agents                    // Dynamic agent configuration
agentSettings            // User-specific agent preferences  
conversationSessions     // Session management
conversationMessages     // Message history
knowledgeDocuments       // RAG content
knowledgeEmbeddings      // Vector search
```

### API Specifications

- **Agent API**: `src/app/api/agent/` - Agent interaction endpoints
- **Chat API**: `src/app/api/chat/route.ts` - Simple streaming chat
- **Admin API**: `src/app/api/admin/agents/` - Agent management
- **WhatsApp Webhook**: `src/app/api/uazapi/webhook/route.ts`

**Key Endpoint Pattern**: Next.js App Router uses file-based routing in `src/app/api/`

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Session Management**: `src/lib/orchestrator/session-manager.ts`
   - Lines 124-128: TODO comments indicate missing lastActivity field
   - Lines 210-225: Cleanup methods not implemented
   - Database schema missing fields for proper session tracking

2. **Classification Stats**: `src/lib/orchestrator/enhanced-agent-squad.ts`
   - Lines 248-276: `getClassificationStats` returns empty mock data
   - No actual metrics collection implemented

3. **Memory Hybrid Architecture**: 
   - PRD requires Redis for hot memory, but current implementation only uses PostgreSQL
   - No TTL implementation for conversation data
   - Missing async embedding generation

4. **Agent-Squad Integration**:
   - Current implementation uses singleton pattern but lacks proper error handling
   - Hard-coded agent registration (lines 52-60 in enhanced-agent-squad.ts)
   - Missing dynamic agent activation/deactivation

### Workarounds and Gotchas

- **Edge Runtime Issues**: `next.config.ts` includes workarounds for Supabase compatibility
- **SSL Configuration**: `drizzle.config.ts` and `src/lib/db.ts` disable SSL for development
- **Environment Variables**: Multiple formats supported (POSTGRES_URL vs POSTGRES_URL_NON_POOLING)
- **Agent Library**: Uses external `agent-squad` package with custom extensions

## Integration Points and External Dependencies

### External Services

| Service  | Purpose  | Integration Type | Key Files                      |
| -------- | -------- | ---------------- | ------------------------------ |
| OpenAI   | AI Agents | REST API         | `src/agents/squad/*-openai-agent.ts` |
| Supabase | Auth + DB | SDK              | `src/lib/supabase-*.ts` |
| UAZAPI   | WhatsApp  | REST API         | `src/lib/uazapi-service.ts` |
| Resend   | Email     | SDK              | `src/lib/email-service.ts` |

### Internal Integration Points

- **Authentication Flow**: Supabase Auth → Custom middleware → Protected routes
- **Agent Communication**: Enhanced Agent Squad → OpenAI API → Response streaming
- **Database Layer**: Drizzle ORM → PostgreSQL (Supabase) with pgvector extension
- **File Storage**: Knowledge base documents via Supabase storage

### Critical Integration Constraints

1. **WhatsApp Rate Limiting**: UAZAPI service has rate limits, needs queue implementation
2. **OpenAI Token Limits**: Current agents have maxTokens: 800 hard limit
3. **Database Connections**: PostgreSQL connection pooling configured in client setup
4. **Supabase RLS**: Row Level Security policies need configuration for agent data

## Development and Deployment

### Local Development Setup

**Prerequisites**:
```bash
Node.js 20.x
pnpm >=9.0.0
PostgreSQL (via Supabase or local)
```

**Environment Setup**:
1. Copy `.env.example` to `.env.local`
2. Configure Supabase credentials (URL, anon key, service role key)
3. Set OpenAI API key
4. Configure UAZAPI credentials (optional for WhatsApp)

**Development Commands**:
```bash
pnpm install              # Install dependencies
pnpm db:generate          # Generate schema
pnpm db:push             # Push schema to database  
pnpm dev                 # Start development server (Turbopack)
```

### Build and Deployment Process

- **Build Command**: `pnpm build` (Next.js production build)
- **Target Platform**: Vercel (configured for Node.js runtime)
- **Database Migrations**: Drizzle Kit with manual schema management
- **Environment Variables**: All API keys and URLs configurable via environment

### Current Deployment Configuration

```typescript
// next.config.ts - Production considerations
- Forces Node.js runtime (not Edge) for Supabase compatibility
- External packages configuration for server components
- Webpack customization for problematic modules
```

## Testing Reality

### Current Test Coverage

- **Unit Tests**: Minimal, mostly in `scripts/` directory for specific functions
- **Integration Tests**: Ad-hoc test scripts (test-*.js files in root)
- **E2E Tests**: None identified
- **Manual Testing**: Primary QA method

### Test Infrastructure

```bash
# Test files found:
test_main.py                 # Python component tests
test_real_agent_squad.py     # Agent integration tests
test-*.js                    # Various API endpoint tests
```

**Note**: No formal test runner configured, tests appear to be standalone scripts

## Enhancement PRD Implementation Status

Based on current system analysis vs PRD requirements:

### ✅ Already Implemented
- Basic agent orchestration (Leo, Max, Lia)
- PostgreSQL database with comprehensive schema
- Web chat interface with streaming
- Admin panel for agent management
- OpenAI integration with custom prompts

### ⚠️ Partially Implemented  
- **Session Management**: Basic structure exists, needs enhancement
- **Classification**: Multi-layer classifier exists but needs refinement
- **WhatsApp Integration**: Service layer exists, needs webhook completion
- **Knowledge Base**: RAG system exists, needs agent-specific retrieval

### ❌ Not Yet Implemented (PRD Requirements)
- **Hybrid Memory**: Redis integration for hot memory + TTL
- **Dynamic Agent Management**: Runtime activation/deactivation  
- **LangSmith Integration**: Observability and metrics
- **Async Embeddings**: Background processing for latency optimization
- **Multi-Channel Coordination**: Unified session management across web/WhatsApp
- **Comprehensive Metrics**: Classification stats, performance monitoring

## Architecture Enhancement Recommendations

### Immediate Requirements for PRD Completion

1. **Add Redis Integration**: 
   - Implement hot memory layer with TTL (24h per PRD)
   - Modify session manager to use hybrid storage

2. **Complete Multi-Layer Classification**:
   - Implement actual statistics collection
   - Add confidence scoring and reasoning chains

3. **Dynamic Agent Management**:
   - Remove hard-coded agent registration
   - Implement database-driven agent activation

4. **Observability Layer**:
   - Add LangSmith integration
   - Implement performance and cost tracking

5. **WhatsApp Enhancement**:
   - Complete webhook implementation
   - Add queue system for rate limiting

### Technical Architecture Changes Needed

```typescript
// Required new components:
src/lib/redis/           // Redis integration
src/lib/metrics/         // LangSmith + observability  
src/lib/queue/           // Message queue for WhatsApp
src/lib/embedding/       // Async embedding service

// Enhanced existing:
src/lib/orchestrator/session-manager.ts  // Hybrid memory
src/lib/orchestrator/enhanced-agent-squad.ts // Dynamic agents
src/app/api/agent/       // Enhanced agent endpoints
```

## Security and Performance Considerations

### Security Implementation Status
- ✅ Supabase Auth with RLS capabilities
- ✅ Environment variable configuration for API keys
- ✅ TypeScript for type safety
- ⚠️ Agent data access controls need enhancement
- ❌ Rate limiting not implemented

### Performance Characteristics
- **Database**: Drizzle ORM with connection pooling
- **Agent Response Time**: ~800 token limit helps with latency
- **Memory Usage**: Session cleanup not implemented (potential leak)
- **Concurrent Users**: Not tested at scale per PRD requirements

### Critical Performance Issues
1. **No Redis Caching**: All data hits PostgreSQL
2. **Synchronous Embeddings**: Blocks response time
3. **Session Cleanup**: Memory grows unbounded
4. **No Connection Limits**: Database connections not managed

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Development
pnpm dev                # Start with Turbopack
pnpm build             # Production build
pnpm lint              # ESLint check
pnpm typecheck         # TypeScript validation

# Database
pnpm db:generate       # Generate migrations
pnpm db:migrate        # Run migrations  
pnpm db:push          # Push schema (dev)
pnpm db:studio        # Drizzle Studio GUI
pnpm db:reset         # Drop and recreate

# BMad Integration
pnpm bmad:refresh     # Update agent definitions
pnpm bmad:list        # List available agents
pnpm bmad:validate    # Validate configuration
```

### Debugging and Troubleshooting

- **Logs**: Check browser console and terminal output
- **Database**: Use `pnpm db:studio` for visual debugging
- **API Debugging**: Multiple test-*.js scripts available
- **Agent Issues**: Check environment variables and API keys

### Development Workflow

1. **Schema Changes**: Modify `src/lib/schema.ts` → `pnpm db:generate` → `pnpm db:push`
2. **Agent Updates**: Modify agents in `src/agents/squad/` → restart dev server
3. **API Changes**: Edit routes in `src/app/api/` → auto-reload with Turbopack
4. **Testing**: Run specific test scripts in root directory

## Implementation Priority for PRD

**Phase 1 - Foundation (Week 1-2)**:
1. Redis integration for hybrid memory
2. Complete session manager with proper TTL
3. Fix agent statistics collection

**Phase 2 - Enhancement (Week 3-4)**:  
1. LangSmith observability integration
2. Dynamic agent management
3. Async embedding processing

**Phase 3 - Integration (Week 5-6)**:
1. Complete WhatsApp multi-channel support
2. Performance optimization
3. Comprehensive testing

---

**Document Status**: Ready for Agent Squad enhancement development
**Last Updated**: 2025-01-29
**Next Review**: After PRD Phase 1 completion
