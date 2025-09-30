# High Level Architecture

## Technical Summary

FalaChefe v4 is a Next.js 15 application built with TypeScript and the App Router pattern. It implements a business automation platform via WhatsApp using specialized AI agents. The current system partially implements the Agent Squad pattern but requires enhancement for full PRD compliance.

**Architecture Status**: 
- ✅ **Partial Agent Squad Implementation**: Basic orchestration exists but needs multi-layer classification
- ✅ **Database Layer**: PostgreSQL with Drizzle ORM, comprehensive schema
- ✅ **Authentication**: Supabase-based auth with user management  
- ⚠️ **Memory Management**: Sessions exist but hybrid memory (Redis + PostgreSQL) not fully implemented
- ⚠️ **Multi-Channel**: Web chat exists, WhatsApp integration partial
- ⚠️ **Observability**: Basic logging, needs LangSmith integration

## Actual Tech Stack (from package.json)

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

## Repository Structure Reality Check

- Type: Monorepo
- Package Manager: pnpm (enforced by engines)
- Notable: Uses Next.js App Router (not Pages Router), Python integration for core AI components
