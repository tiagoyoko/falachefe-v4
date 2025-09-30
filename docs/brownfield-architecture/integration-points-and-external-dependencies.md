# Integration Points and External Dependencies

## External Services

| Service  | Purpose  | Integration Type | Key Files                      |
| -------- | -------- | ---------------- | ------------------------------ |
| OpenAI   | AI Agents | REST API         | `src/agents/squad/*-openai-agent.ts` |
| Supabase | Auth + DB | SDK              | `src/lib/supabase-*.ts` |
| UAZAPI   | WhatsApp  | REST API         | `src/lib/uazapi-service.ts` |
| Resend   | Email     | SDK              | `src/lib/email-service.ts` |

## Internal Integration Points

- **Authentication Flow**: Supabase Auth → Custom middleware → Protected routes
- **Agent Communication**: Enhanced Agent Squad → OpenAI API → Response streaming
- **Database Layer**: Drizzle ORM → PostgreSQL (Supabase) with pgvector extension
- **File Storage**: Knowledge base documents via Supabase storage

## Critical Integration Constraints

1. **WhatsApp Rate Limiting**: UAZAPI service has rate limits, needs queue implementation
2. **OpenAI Token Limits**: Current agents have maxTokens: 800 hard limit
3. **Database Connections**: PostgreSQL connection pooling configured in client setup
4. **Supabase RLS**: Row Level Security policies need configuration for agent data
