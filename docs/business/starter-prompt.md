I'm working with the **Fala Chefe! v4** project - a fully functional AI-powered business automation platform. Here's what's already implemented:

## Current Fala Chefe! v4 Implementation

- **Authentication**: Supabase Auth with Google OAuth integration
- **Database**: Drizzle ORM with PostgreSQL setup
- **AI Integration**: Vercel AI SDK with OpenAI integration
- **UI**: shadcn/ui components with Tailwind CSS
- **Current Routes**:
  - `/` - Home page with Fala Chefe! branding and feature overview
  - `/dashboard` - Protected dashboard with user profile and navigation
  - `/chat` - AI chat interface with 3 specialized agents (Leo, Max, Lia)
  - `/parallel-chat` - Parallel conversations with multiple agents
  - `/conversations` - Conversation history and management
  - `/cashflow` - Financial management with AI agent integration
  - `/onboarding` - Complete user onboarding flow
  - `/admin/agents` - Agent management and configuration
  - `/admin/knowledge-base` - Knowledge base management with RAG

## Important Context

This is a **fully functional application** - NOT a boilerplate. All features are implemented and working:

### ✅ IMPLEMENTED FEATURES:

- **Complete Authentication System** with Supabase
- **3 Specialized AI Agents** (Leo-Financeiro, Max-Marketing, Lia-RH)
- **Real-time Chat Interface** with agent selection
- **Parallel Conversations** with multiple agents
- **Financial Management** with AI-powered commands
- **Knowledge Base RAG** with document upload and search
- **Agent Administration** with CRUD operations
- **User Onboarding** with 4-step configuration
- **WhatsApp Integration** (APIs implemented)
- **Conversation History** and management

### Current Status:

The application is **production-ready** with all core features implemented. The focus should be on:

1. **Enhancement**: Adding new features or improving existing ones
2. **Optimization**: Performance improvements and scalability
3. **Integration**: Completing WhatsApp integration and adding WebSocket
4. **Testing**: Adding comprehensive test coverage

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- **Supabase Auth** for authentication (with Google OAuth)
- Drizzle ORM + PostgreSQL
- Vercel AI SDK
- shadcn/ui components
- Lucide React icons

## Component Development Guidelines

**Always prioritize shadcn/ui components** when building the application:

1. **First Choice**: Use existing shadcn/ui components from the project
2. **Second Choice**: Install additional shadcn/ui components using `pnpm dlx shadcn@latest add <component-name>`
3. **Last Resort**: Only create custom components or use other libraries if shadcn/ui doesn't provide a suitable option

The project already includes several shadcn/ui components (button, dialog, avatar, etc.) and follows their design system. Always check the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for available components before implementing alternatives.

## What I Want to Build

Project Brief: Fala Chefe! (Atualizado)
Project Brief: Fala Chefe!
1. Sumário Executivo
O "Fala Chefe!" é uma inovadora framework de automação de negócios projetada especificamente para pequenos e micro empresários no Brasil. Através de uma equipe de agentes de IA especializados que interagem via WhatsApp, a plataforma visa substituir processos manuais demorados nas áreas de Marketing, Vendas e Finanças. A solução se diferencia pela sua interação conveniente (incluindo comandos de voz), inteligência proativa que oferece insights estratégicos, e um princípio fundamental de coerência, garantindo que todas as automações estejam alinhadas com as metas do negócio do usuário. O MVP focará em entregar valor imediato nessas três áreas críticas, estabelecendo a plataforma como um conselheiro de negócios indispensável e acessível.

2. Declaração do Problema
Pequenos e micro empresários no Brasil são a espinha dorsal da economia, mas enfrentam um conjunto único e esmagador de desafios. Eles operam com equipas enxutas (muitas vezes uma "equipa de um só") e são forçados a desempenhar múltiplos papéis — de vendedor a gestor financeiro e estratega de marketing. Esta sobrecarga de tarefas resulta em vários problemas críticos:

Falta de Tempo para o Estratégico: O tempo gasto em tarefas operacionais e administrativas repetitivas impede que se concentrem no crescimento, na inovação e na estratégia do negócio.

Processos Manuais e Desconectados: A gestão é frequentemente feita através de uma colcha de retalhos de planilhas, cadernos e aplicações de mensagens, levando a ineficiências, perda de informação e falta de uma visão unificada do negócio.

Complexidade das Ferramentas Existentes: As soluções de software de gestão (ERPs, CRMs) são, na sua maioria, demasiado complexas, caras e não adaptadas à realidade móvel e dinâmica destes empresários. A curva de aprendizagem é íngreme e o custo-benefício é baixo.

Tomada de Decisão Baseada na Intuição: Sem dados facilmente acessíveis e consolidados, as decisões críticas sobre preços, marketing e vendas são frequentemente tomadas com base na intuição em vez de em insights concretos, aumentando o risco e limitando o potencial de crescimento.

As soluções atuais falham por estarem em extremos opostos: ou são ferramentas de produtividade demasiado simples que não integram as várias facetas do negócio, ou são sistemas corporativos demasiado complexos. Falta uma solução intermediária que seja, ao mesmo tempo, poderosa e radicalmente simples, que se integre no fluxo de trabalho existente do empresário (o WhatsApp) e que atue como um parceiro proativo em vez de uma ferramenta passiva.

3. Solução Proposta
"Fala Chefe!" é uma plataforma conversacional que fornece uma equipa de agentes de IA sob demanda, acessível diretamente pelo WhatsApp. A solução funciona como um "CEO Virtual" e "Consultor Estratégico" para o micro empresário.

Conceito Central: Em vez de usar múltiplas aplicações, o empresário interage com seus "departamentos" (Marketing, Vendas, Finanças) através de uma única conversa no WhatsApp, usando texto ou áudio.

Diferenciais Chave:

Orquestração Inteligente: Um agente Orquestrador central ("CEO Virtual") entende as necessidades do usuário e delega tarefas para os agentes especialistas, garantindo uma visão unificada.

Proatividade: Os agentes não apenas respondem a comandos, mas monitoram dados e fornecem insights e alertas proativamente.

Coerência Estratégica: A IA é programada para entender as metas do negócio do usuário. Ela alinha suas sugestões e entregáveis a essas metas, podendo até mesmo questionar pedidos que contradigam a estratégia definida, atuando como um verdadeiro conselheiro.

Interface Radicalmente Simples: Toda a complexidade da gestão de negócios é abstraída numa conversa natural e intuitiva, eliminando a necessidade de aprender a usar softwares complexos.

4. Utilizadores-Alvo
Segmento Primário: Pequenos e Micro Empresários no Brasil

Perfil: Proprietários de negócios com 1 a 10 funcionários, incluindo freelancers, lojistas, prestadores de serviços e pequenos produtores.

Características: Têm alta proficiência no uso de smartphones e WhatsApp para negócios. São dinâmicos, operam com recursos limitados e valorizam soluções práticas que economizam tempo e dinheiro.

Dores: As mesmas listadas na "Declaração do Problema" - sobrecarga de trabalho, falta de tempo para estratégia, dificuldade com ferramentas complexas e tomada de decisão baseada em intuição.

5. Objetivos e Métricas de Sucesso (MVP)
Objetivos de Negócio:

Validar a tese de que os micro empresários estão dispostos a pagar por uma solução de automação via WhatsApp.

Alcançar 100 utilizadores ativos nos primeiros 3 meses após o lançamento.

Obter uma taxa de retenção de 40% no primeiro mês.

Métricas de Sucesso do Utilizador:

Redução de pelo menos 3 horas por semana no tempo gasto pelos utilizadores em tarefas administrativas.

Taxa de adoção de 70% para pelo menos uma funcionalidade proativa (insight não solicitado).

Feedback qualitativo positivo sobre a facilidade de uso e o valor percebido da "consultoria" da IA.

KPIs (Key Performance Indicators):

Número de Utilizadores Ativos Diários (DAU).

Número de interações (comandos) por utilizador por dia.

Taxa de Conversão (de utilizador de teste para assinante).

6. Âmbito do MVP
Para garantir um lançamento rápido e focado no valor essencial, o MVP será estritamente definido.

Funcionalidades Essenciais (Inclusas):

Plataforma: "Fala Chefe!" com a saudação padrão.

Agentes: Marketing, Vendas e Financeiro (com funcionalidades básicas).

Interação: Suporte para texto e áudio via WhatsApp.

Fluxo de Onboarding: Onboarding invertido, onde a IA inicia a conversa para identificar e resolver a dor principal do utilizador.

Inteligência: Implementação do "Princípio da Coerência Estratégica" como base do sistema.

Fora do Âmbito do MVP:

Agente de Planeamento Estratégico.

Funcionalidade de Benchmarking com dados anônimos.

Integrações com outras plataformas (além do WhatsApp).

Dashboard web ou qualquer interface fora do WhatsApp.

7. Visão Pós-MVP
Após a validação do MVP, a visão é expandir a plataforma para se tornar o sistema operacional central para pequenos negócios no Brasil.

Fase 2: Introdução do Agente de Planeamento Estratégico e da funcionalidade de Benchmarking.

Visão de Longo Prazo: Expandir a equipa de agentes para cobrir mais áreas (RH, Jurídico Básico), introduzir integrações com outras ferramentas (bancos, plataformas de e-commerce) e explorar o potencial de um marketplace B2B.

8. Considerações Técnicas
Plataforma de Desenvolvimento do MVP: n8n será utilizado para a construção e automação dos fluxos de trabalho do MVP, validando os fluxos de conversação e a lógica dos agentes.

Interface Primária: WhatsApp será a única interface para o MVP, utilizando a sua API oficial.

9. Restrições e Pressupostos
Restrições: O MVP deve ser construído dentro de um orçamento limitado, priorizando a validação do modelo de negócio. A solução deve estar em conformidade com a LGPD desde o início.

Pressupostos Chave:

Os empresários confiam no WhatsApp para gerir informações sensíveis do negócio.

É tecnicamente viável criar uma experiência de utilizador fluida e proativa dentro das limitações da API do WhatsApp.

O modelo de linguagem subjacente (orquestrado via n8n) é capaz de manter o contexto do negócio de forma eficaz para aplicar o "Princípio da Coerência Estratégica".

10. Riscos e Questões em Aberto
Riscos:

Adoção: O público-alvo pode ser resistente a delegar tarefas críticas a uma IA.

Técnico: A complexidade de manter o contexto do negócio de múltiplos utilizadores pode ser maior do que o previsto.

Monetização: Definir um preço que seja acessível para micro empresários, mas que sustente o negócio, será um desafio.

Questões em Aberto:

Qual será o modelo de precificação (assinatura mensal, por uso)?

Como será o processo para a IA "aprender" as metas e o perfil de cada negócio de forma eficiente durante o onboarding?

11. Próximos Passos
Ação Imediata: Utilizar este Project Brief como base para criar o PRD (Product Requirements Document), detalhando as funcionalidades de cada um dos três agentes do MVP.

Handoff para PM: O Product Manager deve agora assumir e iniciar a criação do PRD, trabalhando em conjunto com o utilizador para refinar os requisitos.


## Request

Please help me transform this boilerplate into my actual application. **You MUST completely replace all existing boilerplate code** to match my project requirements. The current implementation is just temporary scaffolding that should be entirely removed and replaced.

## Final Reminder: COMPLETE REPLACEMENT REQUIRED

🚨 **IMPORTANT**: Do not preserve any of the existing boilerplate UI, components, or content. The user expects a completely fresh application that implements their requirements from scratch. Any remnants of the original boilerplate (like setup checklists, welcome screens, demo content, or placeholder navigation) indicate incomplete implementation.

**Success Criteria**: The final application should look and function as if it was built from scratch for the specific use case, with no evidence of the original boilerplate template.

## Post-Implementation Documentation

After completing the implementation, you MUST document any new features or significant changes in the `/docs/features/` directory:

1. **Create Feature Documentation**: For each major feature implemented, create a markdown file in `/docs/features/` that explains:

   - What the feature does
   - How it works
   - Key components and files involved
   - Usage examples
   - Any configuration or setup required

2. **Update Existing Documentation**: If you modify existing functionality, update the relevant documentation files to reflect the changes.

3. **Document Design Decisions**: Include any important architectural or design decisions made during implementation.

This documentation helps maintain the project and assists future developers working with the codebase.
