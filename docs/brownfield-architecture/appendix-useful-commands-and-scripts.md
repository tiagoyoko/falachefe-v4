# Appendix - Useful Commands and Scripts

## Frequently Used Commands

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

## Debugging and Troubleshooting

- **Logs**: Check browser console and terminal output
- **Database**: Use `pnpm db:studio` for visual debugging
- **API Debugging**: Multiple test-*.js scripts available
- **Agent Issues**: Check environment variables and API keys

## Development Workflow

1. **Schema Changes**: Modify `src/lib/schema.ts` → `pnpm db:generate` → `pnpm db:push`
2. **Agent Updates**: Modify agents in `src/agents/squad/` → restart dev server
3. **API Changes**: Edit routes in `src/app/api/` → auto-reload with Turbopack
4. **Testing**: Run specific test scripts in root directory
