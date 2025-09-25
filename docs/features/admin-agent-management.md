# Sistema de Administração de Agentes

## Visão Geral

O sistema de administração de agentes permite que usuários com permissões de administrador gerenciem dinamicamente os agentes de IA do FalaChefe. Isso inclui criar, editar, ativar/desativar e deletar agentes, além de personalizar suas personalidades e capacidades.

## Funcionalidades Implementadas

### 1. Sistema de Permissões

#### Roles de Usuário

- **`user`**: Usuário comum (padrão)
- **`admin`**: Administrador com acesso ao painel de admin
- **`super_admin`**: Super administrador com acesso total

#### Middleware de Proteção

- Rotas `/admin/*` são protegidas por middleware
- Verificação automática de permissões
- Redirecionamento para login se não autenticado
- Redirecionamento para dashboard se não for admin

### 2. Gerenciamento de Agentes

#### Estrutura de Dados

```typescript
interface AgentData {
  id: string;
  name: string; // ID único (ex: "leo", "max")
  displayName: string; // Nome de exibição
  description: string; // Descrição do agente
  tone: string; // Tom de voz/personalidade
  persona: AgentPersona; // Objeto com personalidade
  capabilities?: AgentCapability[]; // Capacidades do agente
  isActive: boolean; // Status ativo/inativo
  isSystem: boolean; // Agente do sistema (não deletável)
  createdBy: string; // ID do usuário que criou
  createdAt: Date;
  updatedAt: Date;
}
```

#### Operações CRUD

- **Criar**: Novo agente com personalidade customizada
- **Listar**: Todos os agentes com filtros e busca
- **Atualizar**: Editar personalidade e configurações
- **Deletar**: Remover agentes (exceto do sistema)
- **Toggle Status**: Ativar/desativar agentes

### 3. Interface de Administração

#### Página Principal (`/admin/agents`)

- Lista todos os agentes com cards informativos
- Barra de busca por nome, descrição ou ID
- Filtros por status (ativo/inativo) e tipo (sistema/usuário)
- Ações rápidas: editar, ativar/desativar, deletar

#### Formulários

- **Criação**: Formulário com abas para informações básicas e personalidade
- **Edição**: Formulário similar com dados pré-preenchidos
- **Validação**: Campos obrigatórios e validação de nomes únicos

#### Componentes UI

- Cards responsivos para exibição de agentes
- Modais para criação e edição
- Alertas de confirmação para ações destrutivas
- Badges para status e tipos de agente
- Tabs para organização de formulários

### 4. APIs de Backend

#### Endpoints Implementados

```
GET    /api/admin/agents           # Listar agentes
POST   /api/admin/agents           # Criar agente
GET    /api/admin/agents/[id]      # Obter agente específico
PUT    /api/admin/agents/[id]      # Atualizar agente
DELETE /api/admin/agents/[id]      # Deletar agente
POST   /api/admin/agents/[id]/toggle # Toggle status
```

#### Validações

- Verificação de permissões de admin
- Validação de dados de entrada
- Verificação de nomes únicos
- Proteção contra deleção de agentes do sistema

### 5. Serviços e Hooks

#### AgentManagementService

- Singleton para gerenciar agentes
- Métodos para todas as operações CRUD
- Verificação de permissões
- Inicialização de agentes do sistema

#### useAgentManagement Hook

- Hook React para gerenciar estado
- Operações assíncronas com loading/error states
- Integração com APIs
- Atualização automática da UI

### 6. Agentes do Sistema

#### Agentes Pré-configurados

1. **Leo (Financeiro)**
   - Especialidade: Gestão financeira
   - Tom: Racional, objetivo, claro
   - Capacidades: Fluxo de caixa, categorização, relatórios

2. **Max (Marketing/Vendas)**
   - Especialidade: Marketing e vendas
   - Tom: Inspirador, animado, positivo
   - Capacidades: Marketing digital, vendas, redes sociais

3. **Lia (RH)**
   - Especialidade: Recursos humanos
   - Tom: Calmo, compreensivo, próximo
   - Capacidades: Gestão de pessoas, recrutamento, mediação

#### Características dos Agentes do Sistema

- Não podem ser deletados (`isSystem: true`)
- Inicializados automaticamente
- Personalidades pré-definidas
- Capacidades específicas

## Instalação e Configuração

### 1. Migração do Banco de Dados

```bash
# Executar migração para adicionar campos de role
node scripts/migrate-user-roles.js
```

### 2. Inicialização dos Agentes

```bash
# Inicializar agentes do sistema
node scripts/initialize-system-agents.js
```

### 3. Teste das Funcionalidades

```bash
# Testar funcionalidades de admin
node scripts/test-admin-features.js
```

## Uso

### 1. Acesso ao Painel Admin

- Fazer login como usuário admin
- Navegar para `/admin/agents`
- O link "Admin" aparece no menu para usuários admin

### 2. Gerenciar Agentes

- **Criar**: Clique em "Novo Agente" e preencha o formulário
- **Editar**: Clique no ícone de edição no card do agente
- **Ativar/Desativar**: Clique no ícone de olho no card do agente
- **Deletar**: Clique no ícone de lixeira (não disponível para agentes do sistema)

### 3. Personalizar Agentes

- Edite o nome de exibição, descrição e tom de voz
- Configure capacidades específicas
- Ative/desative conforme necessário

## Segurança

### 1. Controle de Acesso

- Middleware protege rotas de admin
- Verificação de permissões em todas as operações
- Validação de dados de entrada

### 2. Proteções

- Agentes do sistema não podem ser deletados
- Validação de nomes únicos
- Sanitização de dados do usuário

### 3. Auditoria

- Log de todas as operações
- Rastreamento de quem criou/modificou agentes
- Timestamps de criação e atualização

## Extensibilidade

### 1. Adicionar Novos Tipos de Agente

- Crie novos agentes via interface
- Configure personalidades específicas
- Defina capacidades customizadas

### 2. Integração com Sistema Existente

- Agentes criados são automaticamente disponíveis no chat
- Personalidades são aplicadas nas respostas
- Capacidades podem ser usadas para roteamento

### 3. Configurações Avançadas

- Sistema de configurações por usuário
- Personalização de comportamento
- Integração com RAG e contextos

## Monitoramento

### 1. Logs

- Todas as operações são logadas
- Erros são capturados e reportados
- Métricas de uso podem ser implementadas

### 2. Métricas

- Número de agentes ativos/inativos
- Agentes mais utilizados
- Tempo de resposta das operações

## Troubleshooting

### 1. Problemas Comuns

- **Erro de permissão**: Verificar se usuário tem role de admin
- **Agente não aparece**: Verificar se está ativo
- **Erro de validação**: Verificar campos obrigatórios

### 2. Debug

- Verificar logs do console
- Testar APIs diretamente
- Verificar permissões no banco de dados

## Próximos Passos

### 1. Melhorias Planejadas

- Interface de drag-and-drop para reordenar agentes
- Templates de agentes para criação rápida
- Sistema de versionamento de personalidades
- Métricas de performance por agente

### 2. Integrações

- Webhooks para notificações
- API externa para gerenciamento
- Integração com sistemas de monitoramento

### 3. Recursos Avançados

- A/B testing de personalidades
- Machine learning para otimização
- Análise de sentimento das respostas
