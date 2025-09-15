# Fluxo de Onboarding - Fala Chefe!

## Visão Geral

O fluxo de onboarding do Fala Chefe foi projetado para configurar rapidamente novos usuários com informações essenciais sobre sua empresa, preferências e categorias de fluxo de caixa. O processo é dividido em 4 etapas principais e utiliza redirecionamento condicional para garantir que todos os usuários passem pela configuração antes de acessar funcionalidades avançadas.

## Arquitetura

### Componentes Principais

1. **OnboardingFlow** (`/src/components/onboarding/onboarding-flow.tsx`)

   - Componente orquestrador principal
   - Gerencia estado e navegação entre etapas
   - Integra com APIs para salvar dados

2. **OnboardingWelcome** (`/src/components/onboarding/onboarding-welcome.tsx`)

   - Tela de boas-vindas
   - Seleção de áreas de interesse (Marketing, Vendas, Financeiro)
   - Interface intuitiva com cards selecionáveis

3. **CompanyInfoForm** (`/src/components/onboarding/company-info-form.tsx`)

   - Formulário de informações da empresa
   - Campos obrigatórios e opcionais
   - Validação em tempo real

4. **CategoriesSetup** (`/src/components/onboarding/categories-setup.tsx`)

   - Configuração de categorias de receitas e despesas
   - Categorias padrão baseadas no segmento
   - Criação de categorias personalizadas

5. **OnboardingCompletion** (`/src/components/onboarding/onboarding-completion.tsx`)
   - Tela de conclusão com animação de progresso
   - Resumo das configurações
   - Próximos passos sugeridos

### Sistema de Redirecionamento

- **OnboardingGuard** (`/src/components/auth/onboarding-guard.tsx`)

  - Componente wrapper para proteção de rotas
  - Verifica status de autenticação e onboarding
  - Redireciona automaticamente quando necessário

- **useOnboarding** (`/src/hooks/use-onboarding.ts`)
  - Hook personalizado para gerenciar estado do onboarding
  - Integração com API para verificar status
  - Cache de status para performance

## Fluxo de Dados

### Schema do Banco de Dados

O onboarding utiliza 4 tabelas principais:

1. **companies** - Informações da empresa
2. **onboardingPreferences** - Preferências e status do onboarding
3. **categories** - Categorias de receitas/despesas do usuário
4. **userSettings** - Configurações gerais do usuário

### APIs

1. **POST /api/onboarding**

   - Salva todos os dados do onboarding em transação
   - Cria categorias padrão e personalizadas
   - Marca onboarding como concluído

2. **GET /api/onboarding**

   - Verifica status atual do onboarding
   - Retorna etapa atual se incompleto

3. **GET/POST /api/default-categories**
   - Gerencia categorias padrão do sistema
   - Permite inicialização de categorias base

## Etapas do Onboarding

### 1. Boas-vindas (Welcome)

- Apresentação da plataforma
- Seleção de áreas de interesse
- Explicação dos benefícios
- **Obrigatório**: Pelo menos uma área selecionada

### 2. Informações da Empresa (Company)

- Nome da empresa (obrigatório)
- Segmento de atuação (obrigatório)
- Porte da empresa (obrigatório)
- Localização (cidade/estado obrigatório)
- Informações adicionais (opcionais)

### 3. Configuração de Categorias (Categories)

- Categorias padrão baseadas no segmento
- Seleção de categorias relevantes
- Criação de categorias personalizadas
- Separação entre receitas e despesas

### 4. Conclusão (Completion)

- Animação de progresso da configuração
- Resumo das configurações realizadas
- Sugestões de próximos passos
- Redirecionamento para dashboard

## Validação e Feedback

### Validação de Formulários

- Validação em tempo real nos campos obrigatórios
- Mensagens de erro específicas
- Prevenção de envio com dados inválidos

### Feedback do Usuário

- **Toast notifications** usando Sonner
- Estados de carregamento visuais
- Indicadores de progresso
- Mensagens de sucesso/erro

### Tratamento de Erros

- Try/catch em todas as operações assíncronas
- Mensagens de erro user-friendly
- Fallbacks para cenários de falha
- Log detalhado para debugging

## Características Técnicas

### Performance

- Lazy loading de componentes
- Otimização de re-renders
- Cache de dados do onboarding
- Transações de banco atomicas

### Responsividade

- Design mobile-first
- Layouts adaptativos
- Componentes otimizados para touch
- Navegação simplificada em dispositivos móveis

### Acessibilidade

- Labels semânticos em formulários
- Navegação por teclado
- Contraste adequado
- Feedback visual e textual

## Integração com Sistema

### Redirecionamento Condicional

```typescript
// Exemplo de uso no Dashboard
const { needsOnboarding } = useOnboarding();

useEffect(() => {
  if (needsOnboarding) {
    router.push("/onboarding");
  }
}, [needsOnboarding]);
```

### Verificação de Status

```typescript
// Hook para verificar se onboarding foi concluído
const { onboardingStatus, isLoading } = useOnboarding();

if (onboardingStatus?.onboardingCompleted) {
  // Usuário pode acessar funcionalidades completas
}
```

## Personalização por Segmento

### Sugestões Automáticas

- Categorias recomendadas baseadas no segmento
- Objetivos específicos por tipo de negócio
- Dicas personalizadas

### Segmentos Suportados

- Alimentação e Bebidas
- Varejo e Comércio
- Serviços Gerais
- Beleza e Estética
- Saúde e Bem-estar
- Educação e Treinamento
- Tecnologia
- Consultoria
- Construção e Reformas
- Transporte e Logística
- E outros...

## Próximas Melhorias

### Curto Prazo

- [ ] Integração com WhatsApp para validação de número
- [ ] Preview de categorias com ícones personalizados
- [ ] Importação de dados de planilhas existentes

### Médio Prazo

- [ ] Onboarding guiado com tooltips
- [ ] Configuração de lembretes durante onboarding
- [ ] Templates por segmento mais específicos

### Longo Prazo

- [ ] Onboarding progressivo (configuração em etapas menores)
- [ ] IA para sugestão automática de categorias
- [ ] Integração com APIs de dados empresariais

## Troubleshooting

### Problemas Comuns

1. **Usuário fica em loop no onboarding**

   - Verificar se `onboardingCompleted` está sendo salvo corretamente
   - Checar cache do hook `useOnboarding`

2. **Categorias não aparecem**

   - Verificar se as categorias padrão foram criadas
   - Executar `POST /api/default-categories` se necessário

3. **Redirecionamento não funciona**
   - Verificar se o middleware de autenticação está funcionando
   - Checar status de sessão do usuário

### Logs Importantes

- Erros de salvamento: Console do navegador e logs do servidor
- Status de onboarding: Response da API `/api/onboarding`
- Problemas de redirecionamento: Network tab do DevTools
