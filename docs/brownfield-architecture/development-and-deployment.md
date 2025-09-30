# Development and Deployment

## Local Development Setup

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

## Build and Deployment Process

- **Build Command**: `pnpm build` (Next.js production build)
- **Target Platform**: Vercel (configured for Node.js runtime)
- **Database Migrations**: Drizzle Kit with manual schema management
- **Environment Variables**: All API keys and URLs configurable via environment

## Current Deployment Configuration

```typescript
// next.config.ts - Production considerations
- Forces Node.js runtime (not Edge) for Supabase compatibility
- External packages configuration for server components
- Webpack customization for problematic modules
```
