# Agente Especialista em Fluxo de Caixa

## Visão Geral
Agente especializado em gestão de fluxo de caixa via WhatsApp, capaz de criar e gerenciar planilhas no Google Sheets, categorizar transações e manter registros financeiros com memória persistente.

## Funcionalidades Principais

### 1. Gestão de Planilhas Google Sheets
- **Criação automática** de planilhas de fluxo de caixa
- **Estrutura padronizada** com colunas: Data, Descrição, Categoria, Tipo (Receita/Despesa), Valor
- **Formatação automática** com cores e estilos para melhor visualização
- **Backup automático** e versionamento de planilhas

### 2. Sistema de Categorias Dinâmicas
- **Categorias padrão**: Receitas (Vendas, Serviços, Outros) e Despesas (Fornecedores, Marketing, Operacionais)
- **Criação de novas categorias** via comando de voz/texto
- **Edição e exclusão** de categorias existentes
- **Validação** para evitar categorias duplicadas

### 3. CRUD de Lançamentos
- **Inserção**: "Registre uma receita de R$ 500,00 da venda para cliente X"
- **Edição**: "Altere o valor da despesa de ontem para R$ 300,00"
- **Remoção**: "Remova o lançamento de ontem às 14h"
- **Consulta**: "Mostre me as receitas do mês atual"

### 4. Memória Persistente
- **Histórico completo** de transações no Supabase
- **Contexto de conversa** mantido entre sessões
- **Preferências do usuário** (categorias favoritas, formatação)
- **Backup automático** diário dos dados

### 5. Integração WhatsApp (UAZAPI)
- **Comandos de voz** para inserção rápida de lançamentos
- **Confirmações visuais** com emojis e formatação
- **Relatórios resumidos** via mensagem
- **Lembretes** de lançamentos pendentes

## Arquitetura Técnica

### Stack Tecnológica
- **Backend**: NestJS (TypeScript) - Orquestrador principal
- **IA/Agente**: Flowise - Processamento de linguagem natural
- **Banco de Dados**: Supabase (PostgreSQL) - Memória persistente
- **Planilhas**: Google Sheets API - Interface visual
- **WhatsApp**: UAZAPI - Canal de comunicação
- **Filas**: BullMQ (Redis) - Processamento assíncrono

### Módulos Necessários
```
src/modules/
├── cashflow/
│   ├── cashflow.service.ts          # Lógica principal do agente
│   ├── cashflow.controller.ts       # Endpoints da API
│   ├── google-sheets.service.ts     # Integração Google Sheets
│   ├── categories.service.ts        # Gestão de categorias
│   └── transactions.service.ts      # CRUD de transações
├── uazapi/
│   ├── uazapi.service.ts            # Integração UAZAPI
│   └── uazapi.controller.ts         # Webhook UAZAPI
└── flowise/
    └── cashflow-flow.service.ts     # Fluxo específico do agente
```

## Fluxo de Interação

### 1. Inicialização
```
Usuário: "Quero criar um fluxo de caixa"
Agente: "Perfeito! Vou criar sua planilha de fluxo de caixa. 
         Qual o nome da sua empresa?"
Usuário: "Minha Empresa LTDA"
Agente: "Planilha criada com sucesso! 📊
         Link: https://sheets.google.com/...
         Agora você pode registrar receitas e despesas."
```

### 2. Registro de Transação
```
Usuário: "Registre uma receita de R$ 1.500,00 da venda para João"
Agente: "✅ Receita registrada:
         📅 Data: 27/01/2025
         💰 Valor: R$ 1.500,00
         📝 Descrição: Venda para João
         🏷️ Categoria: Vendas
         📊 Atualizada na planilha!"
```

### 3. Consulta de Dados
```
Usuário: "Quanto eu tenho de receita este mês?"
Agente: "📊 Resumo do mês de Janeiro:
         💰 Total Receitas: R$ 5.200,00
         💸 Total Despesas: R$ 2.800,00
         📈 Saldo: R$ 2.400,00
         📋 Últimas 3 transações:
         - R$ 1.500,00 - Venda para João
         - R$ 800,00 - Serviço consultoria
         - R$ 300,00 - Despesa fornecedor"
```

## Comandos Suportados

### Criação e Configuração
- "Criar fluxo de caixa"
- "Configurar categorias"
- "Definir moeda (BRL/USD/EUR)"

### Registro de Transações
- "Registre receita de R$ X da [descrição]"
- "Registre despesa de R$ X para [descrição]"
- "Adicione lançamento: [tipo] R$ [valor] [descrição]"

### Consultas e Relatórios
- "Quanto tenho de receita este mês?"
- "Mostre minhas despesas da semana"
- "Qual meu saldo atual?"
- "Relatório do mês passado"

### Gestão de Categorias
- "Criar categoria [nome]"
- "Listar minhas categorias"
- "Remover categoria [nome]"
- "Editar categoria [nome] para [novo nome]"

### Edição de Lançamentos
- "Alterar valor da transação de ontem"
- "Editar descrição da receita de R$ 500"
- "Remover lançamento de [data/hora]"

## Configurações de Segurança

### Google Sheets API
- **OAuth 2.0** para autenticação
- **Scopes limitados**: apenas planilhas específicas
- **Rate limiting** para evitar sobrecarga
- **Backup automático** antes de modificações

### UAZAPI Integration
- **Webhook verification** para segurança
- **Rate limiting** por usuário
- **Logs de auditoria** para todas as transações
- **Validação de entrada** para prevenir ataques

### Supabase (Memória Persistente)
- **RLS (Row Level Security)** habilitado
- **Criptografia** de dados sensíveis
- **Backup diário** automático
- **Monitoramento** de acesso

## Métricas de Sucesso

### Funcionais
- ✅ Criação de planilha em < 30 segundos
- ✅ Registro de transação em < 10 segundos
- ✅ Consulta de dados em < 5 segundos
- ✅ 95% de precisão na interpretação de comandos

### Técnicas
- ✅ Disponibilidade > 99.5%
- ✅ Tempo de resposta < 2 segundos
- ✅ Zero perda de dados
- ✅ Suporte a 100+ usuários simultâneos

## Próximos Passos de Implementação

1. **Configurar Google Sheets API** e credenciais OAuth
2. **Implementar módulo cashflow** no NestJS
3. **Criar fluxo no Flowise** para processamento de comandos
4. **Integrar UAZAPI** para comunicação WhatsApp
5. **Configurar memória persistente** no Supabase
6. **Implementar testes** unitários e e2e
7. **Deploy e monitoramento** em produção