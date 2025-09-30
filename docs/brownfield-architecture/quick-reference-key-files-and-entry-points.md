# Quick Reference - Key Files and Entry Points

## Critical Files for Understanding the System

- **Main Entry**: `src/app/page.tsx` (Next.js App Router root)
- **Configuration**: `.env.example`, `drizzle.config.ts`, `package.json`
- **Core Business Logic**: `src/lib/orchestrator/`, `src/agents/squad/`
- **API Definitions**: `src/app/api/` (Next.js API routes)
- **Database Models**: `src/lib/schema.ts` (Drizzle ORM)
- **Key Algorithms**: `src/lib/orchestrator/enhanced-agent-squad.ts`, `src/lib/orchestrator/multi-layer-classifier.ts`

## Enhancement Impact Areas (per PRD)

Files/modules that will be affected by the Agent Squad enhancement:
- `src/lib/orchestrator/enhanced-agent-squad.ts` - Core orchestration logic
- `src/agents/squad/` - Agent implementations  
- `src/lib/orchestrator/drizzle-storage.ts` - Storage layer
- `src/lib/orchestrator/session-manager.ts` - Session management
- `src/lib/schema.ts` - Database schema extensions
- `src/app/api/agent/` - Agent API endpoints
- `src/components/` - Admin interfaces
