# Technical Debt and Known Issues

## Critical Technical Debt

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

## Workarounds and Gotchas

- **Edge Runtime Issues**: `next.config.ts` includes workarounds for Supabase compatibility
- **SSL Configuration**: `drizzle.config.ts` and `src/lib/db.ts` disable SSL for development
- **Environment Variables**: Multiple formats supported (POSTGRES_URL vs POSTGRES_URL_NON_POOLING)
- **Agent Library**: Uses external `agent-squad` package with custom extensions
