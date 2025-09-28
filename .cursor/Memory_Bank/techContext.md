# Contexto Técnico — FalaChefe

## Stack
- Runtime: Node.js 20.x LTS
- Framework: NestJS (TypeScript)
- Banco: Supabase (PostgreSQL) + Prisma ORM
- Filas: BullMQ (Redis)
- IA: Flowise (orquestração de agentes + transcrição de áudio)
- Infra: Docker + Traefik; Hetzner Cloud
- Monitoramento: Health checks via Terminus; Traefik dashboard

## Módulos (src/modules)
- `whatsapp`: Webhook, verificação de assinatura, envio/recebimento de mensagens
- `finance`: Registro de receitas/despesas, contas a pagar/receber, resumos
- `jobs`: Processamento assíncrono e agendamentos
- `health`: Liveness/readiness e verificações de dependências
- `flowise`: Integração com fluxos e orquestração de agentes

## Configuração (referência)
- `ConfigModule` global (carrega `.env.local`, fallback `.env`)
- `BullModule.forRoot` com Redis: host/port/db/password e backoff exponencial
- `ScheduleModule.forRoot` para tarefas agendadas

## Estrutura de Diretórios (resumo)
```
fala-chefe-mvp/
├── src/
│   ├── modules/{whatsapp,finance,jobs,health,flowise,prisma}
│   ├── main.ts
│   └── app.module.ts
├── prisma/{schema.prisma,seed.ts}
├── docs/
├── traefik/
├── Dockerfile
└── docker-compose.yml
```

## Variáveis de Ambiente (principais)
- `DATABASE_URL` — Postgres (Supabase)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`
- `FLOWISE_API_KEY`, `FLOWISE_HOST`, `FLOWISE_PORT`

## Comandos (README)
- `npm run db:generate` | `db:push` | `db:seed`
- `npm run start:dev`
- Testes: `npm run test`, `test:watch`, `test:cov`, `test:e2e`

## Deploy
- Traefik roteando serviços (80/443) e dashboard (8080)
- Domínios sugeridos: `api.falachefe.com`, `flowise.falachefe.com`, `traefik.falachefe.com`
- SSL via Let's Encrypt e containers com usuário não-root