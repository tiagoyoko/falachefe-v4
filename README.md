# FalaChefe v4

Plataforma de automação de negócios via WhatsApp com agentes de IA especializados.

## Descrição

O FalaChefe v4 é uma plataforma completa de automação de negócios que utiliza agentes de IA especializados para gerenciar conversas e operações via WhatsApp. A plataforma oferece recursos avançados de chat, gerenciamento de conversas paralelas, onboarding automatizado e integração com sistemas de pagamento.

### Características Principais

- **Agent Squad**: Sistema de agentes especializados (Leo/Financeiro, Max/Marketing, Lia/RH)
- **Classificação Multi-camada**: Sistema inteligente de classificação de intenções
- **WhatsApp Integration**: Comunicação via UAZAPI/Evolution API
- **Base de Conhecimento**: Sistema de memória persistente por agente
- **Onboarding Conversacional**: Fluxo automatizado de configuração inicial
- **Dashboard Administrativo**: Interface para gerenciamento de agentes e configurações
- **Integração Python**: Scripts Python para automação e processamento de dados

## Como Executar

### Pré-requisitos

- Node.js 20.x LTS
- pnpm >= 9.0.0
- PostgreSQL (Supabase)
- Variáveis de ambiente configuradas (consulte `env.example`)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd FalaChefe_v4
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

4. Execute as migrações do banco de dados:
```bash
pnpm db:migrate
```

### Executando o projeto

Para executar o projeto em modo de desenvolvimento:
```bash
pnpm dev
```

Para executar em modo de produção:
```bash
pnpm build
pnpm start
```

## Como Testar

### Scripts de Teste Disponíveis

O projeto inclui diversos scripts de teste na pasta `scripts/`:

#### Testes de Agentes
```bash
# Teste do Agent Squad
node scripts/test-agent-squad.ts

# Teste de classificação multi-camada
node scripts/test-multi-layer-classification.js

# Teste de memória persistente
node scripts/test-persistent-memory.js
```

#### Testes de Integração
```bash
# Teste de conexão com banco de dados
node scripts/test-db-connection.js

# Teste de webhook WhatsApp
node scripts/test-whatsapp-webhook.js

# Teste de autenticação OAuth
node scripts/test-google-oauth.js
```

#### Testes de Funcionalidades
```bash
# Teste de onboarding
node scripts/test-onboarding-api.js

# Teste de categorização
node scripts/test-categorization.js

# Teste de base de conhecimento
node scripts/test-knowledge-base.js
```

## Integração Python

### Como Executar Scripts Python

Para executar o script principal Python do FalaChefe:

```bash
python main.py
```

**Nota**: O script `main.py` será criado como parte da integração Python do projeto. Este script será responsável por:
- Processamento de dados financeiros
- Integração com APIs externas
- Automação de tarefas de negócio
- Processamento de relatórios

### Como Testar Scripts Python

Para executar os testes dos scripts Python:

```bash
pytest test_main.py
```

**Nota**: O arquivo `test_main.py` será criado junto com a integração Python e incluirá:
- Testes unitários para funções principais
- Testes de integração com APIs
- Testes de validação de dados
- Testes de performance

### Configuração Python

Para configurar o ambiente Python:

1. Instale as dependências Python:
```bash
pip install -r requirements.txt
```

2. Configure as variáveis de ambiente Python:
```bash
cp .env.python.example .env.python
# Edite o arquivo .env.python com suas configurações
```

3. Execute os scripts Python:
```bash
python main.py
pytest test_main.py
```

### Verificação de tipos
```bash
pnpm typecheck
```

### Linting
```bash
pnpm lint
```

### Banco de dados
Para visualizar o banco de dados:
```bash
pnpm db:studio
```

Para resetar o banco de dados (desenvolvimento):
```bash
pnpm db:reset
```

## Scripts Disponíveis

### Desenvolvimento
- `pnpm dev` - Executa o servidor de desenvolvimento com Turbopack
- `pnpm build` - Gera build de produção
- `pnpm start` - Executa o servidor de produção
- `pnpm lint` - Executa verificação de linting
- `pnpm typecheck` - Executa verificação de tipos TypeScript

### Banco de Dados
- `pnpm db:generate` - Gera migrações do banco de dados
- `pnpm db:migrate` - Executa migrações do banco de dados
- `pnpm db:push` - Aplica mudanças no banco de dados
- `pnpm db:studio` - Abre interface do banco de dados (Drizzle Studio)
- `pnpm db:reset` - Reseta o banco de dados (desenvolvimento)

## Arquitetura

### Stack Tecnológica
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes + Drizzle ORM
- **Banco de Dados**: PostgreSQL (Supabase)
- **IA**: OpenAI GPT-4 + Agent Squad Framework
- **WhatsApp**: UAZAPI/Evolution API
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **Python**: Scripts de automação e processamento de dados
- **Testes**: Jest + pytest + Node.js scripts

### Estrutura do Projeto
```
src/
├── agents/           # Agentes especializados (Leo, Max, Lia)
├── app/             # Páginas e rotas da aplicação
├── components/      # Componentes React reutilizáveis
├── hooks/           # Custom hooks
├── lib/             # Utilitários e configurações
└── orchestrator/    # Sistema de orquestração de agentes

# Arquivos Python (em desenvolvimento)
├── main.py          # Script principal Python
├── test_main.py     # Testes Python
├── requirements.txt # Dependências Python
└── .env.python.example # Configurações Python
```

## Status do Projeto

### Milestone M1 - Fundação ✅ CONCLUÍDO
- ✅ Framework Agent Squad integrado
- ✅ Sistema de classificação multi-camada
- ✅ Integração WhatsApp via UAZAPI
- ✅ Base de conhecimento personalizada

### Milestone M2 - Especialização 🔄 EM ANDAMENTO
- 🔄 Perfil e memória persistente por agente
- ⏳ Integração profunda com dados financeiros
- ⏳ Avaliação de precisão e otimização
- ⏳ Integração Python para automação e processamento

## Contribuição

Para contribuir com o projeto, consulte a documentação em `docs/` e siga as diretrizes de desenvolvimento estabelecidas.

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.