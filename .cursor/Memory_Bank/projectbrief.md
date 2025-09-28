# FalaChefe — Project Brief

## Visão Geral
Plataforma de gestão empresarial via WhatsApp que utiliza um orquestrador de IA e agente especialista financeiro para automatizar tarefas, orientar decisões e enviar lembretes proativos.

## Objetivos do MVP
- Validar adoção de micro e pequenos empresários usando WhatsApp como única interface.
- Entregar valor imediato: onboarding conversacional, lembretes rápidos e registro financeiro básico.
- Integrar com Flowise para lógica dos agentes e Evolution API para comunicação WhatsApp.

## Problema
Empreendedores operam com ferramentas dispersas e pouca automação no dia a dia. Precisam de orientação prática e execução rápida onde já estão: WhatsApp.

## Público-Alvo
Micro e pequenos empresários no Brasil, com operação móvel e pouco tempo para ferramentas complexas.

## Escopo Funcional (MVP)
- Onboarding conversacional (FR1) e perfil básico do negócio (FR6, FR7).
- Interação multimodal texto/áudio no WhatsApp via Evolution API (FR2).
- **Agente Financeiro** (registro de receitas, despesas, contas c/ vencimento e resumo simples) (FR5).
- Lembretes proativos unificados (contas e compromissos) e lembretes rápidos (FR8, FR9).
- **Orquestrador** para coordenação de fluxos e direcionamento de agentes.

## Requisitos Não Funcionais
- Interface exclusiva via WhatsApp via Evolution API (NFR1).
- Tom de voz "Fala Chefe!": leve, informal e proativo (NFR2).
- Respostas em <10s para comandos simples (NFR3).
- LGPD e segurança de dados (NFR4).
- Fluxos no Flowise como ferramenta central (NFR5) e integração robusta com Evolution API (NFR6).

## Arquitetura (alto nível)
- Backend: NestJS (TypeScript) - Orquestrador
- Banco: Supabase (PostgreSQL) via Prisma ORM
- Filas: Redis + BullMQ
- IA: Flowise (agentes + transcrição de áudio)
- WhatsApp: Evolution API (https://wpp.agenciavibecode.com/manager/)
- Infra: Docker + Traefik; Hetzner para produção
- Segurança: RLS, validação criptográfica de webhooks, SSL

## Critérios de Sucesso do MVP
- Webhook do Evolution API recebendo e respondendo com estabilidade.
- Fluxos Flowise acionados a partir de mensagens reais.
- Registros financeiros e lembretes funcionando ponta a ponta.
- Onboarding conversacional direcionando para Agente Financeiro.

## Riscos e Mitigações
- Falhas de entrega no Evolution API → Retentativas e monitoramento.
- Latência de IA → Otimização de prompts e caching quando aplicável.
- Conformidade LGPD → Minimização e criptografia de dados sensíveis.