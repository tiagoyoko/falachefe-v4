# Fala Chefe! 🤖

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

**Seu time de agentes de IA no WhatsApp para automatizar Marketing, Vendas e Finanças**

Uma plataforma inovadora projetada especificamente para pequenos e micro empresários no Brasil, oferecendo automação de negócios através de agentes de IA especializados que interagem via WhatsApp.

## 🚀 Características Principais

- **💬 Interação Natural**: Comandos por texto ou áudio via WhatsApp
- **🎯 Agentes Especializados**: Marketing, Vendas e Financeiro
- **🧠 IA Proativa**: Insights e lembretes automáticos
- **📊 Gestão Completa**: Fluxo de caixa, categorização e relatórios
- **🔄 Onboarding Inteligente**: Configuração personalizada por segmento

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 15** com App Router
- **React 19** com hooks modernos
- **TypeScript** para tipagem estática
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes

### Backend

- **Next.js API Routes** para endpoints
- **Better Auth** para autenticação
- **Drizzle ORM** para banco de dados
- **PostgreSQL + pgvector** para busca vetorial
- **Agent-Squad** para orquestração de agentes

### Integrações

- **Google OAuth** para autenticação
- **Vercel AI SDK** para processamento de IA
- **OpenAI** para comandos de linguagem natural e embeddings
- **UazAPI** para integração WhatsApp

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Onboarding Completo

- **4 etapas** de configuração
- **Captura de dados** da empresa
- **Configuração de categorias** de receitas/despesas
- **Validação completa** e feedback visual
- **Redirecionamento condicional** automático

### ✅ Autenticação e Usuários

- Login com Google OAuth
- Gerenciamento de sessões
- Proteção de rotas
- Sistema de roles (admin/super_admin)

### ✅ Interface Moderna

- Design responsivo mobile-first
- Componentes shadcn/ui
- Toast notifications
- Loading states e animações

### ✅ Sistema de Agentes com Memória Persistente

- **Agentes Especializados**: Leo (Financeiro), Max (Marketing), Lia (RH)
- **Memória Persistente**: Conversas e contexto mantidos entre sessões
- **Sistema de Contexto**: Histórico de transações e conversas
- **Integração RAG**: Busca em base de conhecimento

### ✅ Administração de Agentes

- **Interface de Gerenciamento**: Painel completo em `/admin/agents`
- **CRUD de Agentes**: Criar, editar, deletar e ativar/desativar
- **Personalização**: Ajustar personalidade, tom de voz e descrição
- **Sistema de Permissões**: Acesso restrito a administradores
- **APIs RESTful**: Endpoints completos para gerenciamento

### ✅ Base de Conhecimento com Busca Vetorial

- **Upload de Documentos**: PDF, DOCX, TXT, MD, HTML
- **Busca Semântica**: Utilizando pgvector para busca por similaridade
- **Associação com Agentes**: Documentos específicos ou globais
- **Processamento Inteligente**: Chunking e geração de embeddings
- **Interface Administrativa**: Gerenciamento completo de documentos

## 🚀 Como Executar

### Pré-requisitos

```bash
Node.js 18+
npm ou pnpm
PostgreSQL
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/[seu-usuario]/falachefe-v4.git
cd falachefe-v4

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Execute as migrações do banco
pnpm db:migrate

# Inicie o servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL="sua-url-do-postgres"

# Auth
BETTER_AUTH_SECRET="seu-secret-key"
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# AI
OPENAI_API_KEY="sua-openai-api-key"
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   │   ├── onboarding/    # APIs do onboarding
│   │   ├── categories/    # Gerenciamento de categorias
│   │   └── transactions/  # Transações financeiras
│   ├── onboarding/        # Páginas do onboarding
│   ├── dashboard/         # Dashboard principal
│   └── chat/              # Chat com IA
├── components/            # Componentes React
│   ├── onboarding/       # Componentes do onboarding
│   ├── auth/             # Componentes de autenticação
│   └── ui/               # Componentes shadcn/ui
├── hooks/                # Custom hooks
└── lib/                  # Utilitários e configurações
```

## 🎨 Componentes de Onboarding

### OnboardingFlow

Orquestrador principal que gerencia todo o fluxo de configuração.

### OnboardingWelcome

Tela de boas-vindas com seleção de áreas de interesse.

### CompanyInfoForm

Formulário completo para informações da empresa.

### CategoriesSetup

Configuração inteligente de categorias baseada no segmento.

### OnboardingCompletion

Tela de conclusão com animação de progresso.

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build de produção
pnpm start        # Servidor de produção

# Qualidade de código
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check

# Banco de dados
pnpm db:push      # Push do schema
pnpm db:studio    # Drizzle Studio
```

## 📊 Banco de Dados

### Principais Tabelas

- **users**: Usuários do sistema
- **companies**: Informações das empresas
- **onboardingPreferences**: Preferências do onboarding
- **categories**: Categorias de receitas/despesas
- **transactions**: Transações financeiras
- **userSettings**: Configurações do usuário

## 📚 Documentação

### Funcionalidades

- [Sistema de Administração de Agentes](docs/features/admin-agent-management.md)
- [Base de Conhecimento com Busca Vetorial](docs/features/knowledge-base-vector-search.md)
- [Implementação de Memória Persistente](docs/features/persistent-memory-implementation.md)

### Técnica

- [Arquitetura da Base de Conhecimento](docs/technical/knowledge-base-architecture.md)
- [Especificação Técnica](docs/technical/knowledge-base-specification.md)
- [Exemplos de Uso](docs/examples/knowledge-base-usage-examples.md)

## 🎯 Próximos Passos

### Curto Prazo

- [ ] Implementação da Base de Conhecimento
- [ ] Integração completa com WhatsApp
- [ ] Dashboard financeiro avançado
- [ ] Sistema de relatórios

### Médio Prazo

- [ ] Upload em lote de documentos
- [ ] Analytics de uso da base de conhecimento
- [ ] Integrações bancárias
- [ ] Sistema de backup automático

### Longo Prazo

- [ ] IA para categorização automática
- [ ] Busca por imagem (OCR)
- [ ] API pública para integrações
- [ ] Mobile app nativo

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato:

- Email: suporte@agenciavibecode.com
- Website: [agenciavibecode.com](https://agenciavibecode.com)

---

**Desenvolvido com ❤️ pela [Agência Vibe Code](https://agenciavibecode.com)**
