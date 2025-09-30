# 🏗️ **5. ARQUITETURA E TECNOLOGIA**

## 5.1 Stack Tecnológico Consolidado
- **Frontend**: Next.js 15 + TypeScript + React 19
- **Backend**: Node.js + TypeScript + Next.js API Routes
- **Agentes**: OpenAI API (GPT-4o-mini) + Agent Squad Library
- **Memória Quente**: Upstash Redis (Serverless)
- **Memória Semântica**: Supabase (PostgreSQL + pgvector)
- **Observabilidade**: LangSmith + built-in metrics
- **Deploy**: Vercel (Node.js runtime)
- **Auth**: Supabase Auth + RLS

## 5.2 Componentes Principais
- **Enhanced Agent Squad**: Orquestrador com classificação multi-layer
- **Hybrid Session Manager**: Coordenação Redis-PostgreSQL
- **Multi-Channel Manager**: Coordenação Web-WhatsApp
- **Dynamic Agent Registry**: Gerenciamento database-driven
- **LangSmith Observer**: Observabilidade e métricas
- **Admin Dashboard**: Interface de gerenciamento

## 5.3 Fluxo de Dados Arquitetural
```
1. User → Message (Web/WhatsApp)
2. Multi-Channel Manager → Session Coordination
3. Hybrid Session Manager → Context Retrieval (Redis + PostgreSQL)
4. Multi-Layer Classifier → Agent Selection
5. Dynamic Agent Registry → Agent Execution
6. LangSmith Observer → Metrics Collection
7. Enhanced Agent → Response Generation
8. Multi-Channel Manager → Response Delivery
9. Hybrid Session Manager → Context Update
```
