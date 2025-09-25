# Exemplos de Uso - Base de Conhecimento com pgvector

## 1. Cenários de Uso

### 1.1 Agente Financeiro (Leo) - Documentos Específicos

**Cenário**: Administrador quer que o Leo tenha acesso a manuais de contabilidade e legislação fiscal.

**Passo a passo**:

1. Administrador acessa `/admin/knowledge-base`
2. Clica em "Novo Documento"
3. Faz upload do arquivo `manual-contabilidade-2024.pdf`
4. Preenche título: "Manual de Contabilidade 2024"
5. Seleciona agente: "Leo - Agente Financeiro"
6. Adiciona metadados: `{ "categoria": "contabilidade", "ano": 2024, "versao": "1.0" }`
7. Confirma upload

**Resultado**: Leo agora pode responder perguntas baseadas no manual de contabilidade.

**Exemplo de conversa**:

```
Usuário: "Como calcular o IRPJ trimestral?"
Leo: "Baseado no Manual de Contabilidade 2024, o IRPJ trimestral é calculado da seguinte forma:
1. Aplique a alíquota de 15% sobre o lucro real
2. Adicione 10% sobre a parcela que exceder R$ 20.000,00
3. O cálculo deve ser feito considerando..."
```

### 1.2 Agente de Marketing (Max) - Documentos Globais

**Cenário**: Administrador quer que todos os agentes tenham acesso a políticas da empresa.

**Passo a passo**:

1. Administrador acessa `/admin/knowledge-base`
2. Faz upload do arquivo `politicas-empresa.md`
3. Marca como "Documento Global"
4. Define título: "Políticas Internas da Empresa"

**Resultado**: Todos os agentes podem referenciar as políticas da empresa.

**Exemplo de conversa**:

```
Usuário: "Qual é o horário de funcionamento?"
Max: "De acordo com as Políticas Internas da Empresa, nosso horário de funcionamento é de segunda a sexta, das 8h às 18h, com intervalo de 1h para almoço."
```

### 1.3 Agente de RH (Lia) - Múltiplos Documentos

**Cenário**: Administrador quer que Lia tenha acesso a manuais de RH, legislação trabalhista e políticas de benefícios.

**Passo a passo**:

1. Upload de `manual-rh-2024.pdf`
2. Upload de `clt-atualizada.pdf`
3. Upload de `beneficios-empresa.docx`
4. Associa todos ao agente "Lia - Agente de RH"

**Resultado**: Lia tem conhecimento abrangente sobre recursos humanos.

## 2. Exemplos de Busca Semântica

### 2.1 Busca por Conceito

**Query**: "Como calcular férias proporcionais?"

**Resultados**:

```
1. CLT Atualizada - Capítulo 3, Art. 130
   Similaridade: 0.89
   Contexto: "As férias proporcionais são calculadas considerando 1/12 do salário por mês trabalhado..."

2. Manual RH 2024 - Seção 4.2
   Similaridade: 0.85
   Contexto: "Para funcionários com menos de 12 meses de trabalho, o cálculo das férias proporcionais..."

3. Políticas Internas - Benefícios
   Similaridade: 0.72
   Contexto: "Nossa empresa oferece férias proporcionais conforme legislação vigente..."
```

### 2.2 Busca por Agente Específico

**Query**: "Qual é o prazo para entrega do IRPF?"
**Agente**: Leo (Financeiro)

**Resultados**:

```
1. Manual Contabilidade 2024 - Capítulo 8
   Similaridade: 0.92
   Contexto: "O prazo para entrega da Declaração do IRPF é até 31 de maio de cada ano..."

2. Legislação Fiscal 2024 - Art. 150
   Similaridade: 0.88
   Contexto: "Conforme estabelecido na legislação, o contribuinte deve entregar sua declaração..."
```

## 3. Interface de Usuário

### 3.1 Página Principal

```
┌─────────────────────────────────────────────────────────────┐
│ 📚 Base de Conhecimento                    [➕ Novo Documento] │
├─────────────────────────────────────────────────────────────┤
│ 🔍 [Buscar documentos...] [Filtros ▼] [Agente: Todos ▼]     │
├─────────────────────────────────────────────────────────────┤
│ 📄 Manual Contabilidade 2024                    [Editar] [🗑] │
│    Leo • PDF • 2.3MB • Ativo • 15/01/2024                  │
│    📊 45 buscas • 89% relevância                            │
├─────────────────────────────────────────────────────────────┤
│ 📄 Políticas da Empresa                      [Editar] [🗑]   │
│    Global • MD • 156KB • Ativo • 10/01/2024                │
│    📊 128 buscas • 92% relevância                           │
├─────────────────────────────────────────────────────────────┤
│ 📄 CLT Atualizada                           [Editar] [🗑]   │
│    Lia • PDF • 5.1MB • Ativo • 08/01/2024                  │
│    📊 67 buscas • 85% relevância                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Modal de Upload

```
┌─────────────────────────────────────────────────────────────┐
│ 📤 Upload de Documento                                      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Arraste arquivos aqui ou clique para selecionar       │ │
│ │  Formatos: PDF, DOCX, TXT, MD, HTML                    │ │
│ │  Tamanho máximo: 10MB                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Título: [Manual de Contabilidade 2024        ]             │
│                                                             │
│ Associação: ○ Global  ● Específico                         │
│ Agentes: [Leo ▼] [Max ▼] [Lia ▼]                          │
│                                                             │
│ Metadados:                                                  │
│ Categoria: [Contabilidade ▼]                               │
│ Ano: [2024] Versão: [1.0]                                  │
├─────────────────────────────────────────────────────────────┤
│                    [Cancelar] [Upload]                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Resultados de Busca

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Resultados para "cálculo de férias" (3 encontrados)     │
├─────────────────────────────────────────────────────────────┤
│ 📄 CLT Atualizada - Capítulo 3, Art. 130                   │
│    Similaridade: 89% • Lia • PDF • 5.1MB                  │
│    "As férias proporcionais são calculadas considerando    │
│    1/12 do salário por mês trabalhado, conforme estabelecido│
│    na Consolidação das Leis do Trabalho..."                │
├─────────────────────────────────────────────────────────────┤
│ 📄 Manual RH 2024 - Seção 4.2                              │
│    Similaridade: 85% • Lia • PDF • 2.8MB                  │
│    "Para funcionários com menos de 12 meses de trabalho,   │
│    o cálculo das férias proporcionais deve considerar..."  │
├─────────────────────────────────────────────────────────────┤
│ 📄 Políticas Internas - Benefícios                         │
│    Similaridade: 72% • Global • MD • 156KB                 │
│    "Nossa empresa oferece férias proporcionais conforme    │
│    legislação vigente, com pagamento em até 30 dias..."    │
└─────────────────────────────────────────────────────────────┘
```

## 4. Casos de Uso Avançados

### 4.1 Upload em Lote

**Cenário**: Administrador quer carregar toda a documentação de um departamento.

**Processo**:

1. Seleciona múltiplos arquivos (Ctrl+Click)
2. Define configurações globais
3. Sistema processa em background
4. Notifica conclusão por email

**Exemplo**:

```
📁 Documentos Selecionados (5 arquivos):
├── manual-contabilidade-2024.pdf
├── planilha-demonstrativos.xlsx
├── guia-fiscal-2024.pdf
├── procedimentos-internos.docx
└── checklist-auditoria.md

Configurações:
- Agente: Leo (Financeiro)
- Categoria: Contabilidade
- Ano: 2024
- Processamento: Background
```

### 4.2 Reindexação de Documentos

**Cenário**: Documento foi atualizado e precisa ser reprocessado.

**Processo**:

1. Administrador acessa detalhes do documento
2. Clica em "Reindexar"
3. Sistema reprocessa chunks e embeddings
4. Mantém histórico de versões

**Exemplo**:

```
📄 Manual Contabilidade 2024
Status: Ativo • Última atualização: 15/01/2024

Ações:
[📝 Editar] [🔄 Reindexar] [📊 Estatísticas] [🗑 Deletar]

Reindexação:
- Chunks: 45 → 52 (novos parágrafos)
- Embeddings: Atualizados
- Status: Concluído em 2m 30s
```

### 4.3 Analytics e Métricas

**Cenário**: Administrador quer entender o uso da base de conhecimento.

**Métricas disponíveis**:

```
📊 Estatísticas de Uso

Documentos:
- Total: 47 documentos
- Ativos: 45 (96%)
- Processando: 1 (2%)
- Erro: 1 (2%)

Busca:
- Buscas hoje: 156
- Buscas esta semana: 1,234
- Taxa de sucesso: 94%
- Tempo médio: 1.2s

Agentes:
- Leo: 23 documentos, 456 buscas
- Max: 15 documentos, 234 buscas
- Lia: 18 documentos, 345 buscas
- Global: 12 documentos, 199 buscas

Top Documentos:
1. Manual Contabilidade 2024 (89 buscas)
2. Políticas da Empresa (67 buscas)
3. CLT Atualizada (45 buscas)
```

## 5. Integração com Agentes

### 5.1 Contexto Enriquecido

**Antes da base de conhecimento**:

```
Usuário: "Como calcular o IRPJ?"
Leo: "O IRPJ é um imposto sobre a renda das pessoas jurídicas. Para calcular, você precisa..."
```

**Depois da base de conhecimento**:

```
Usuário: "Como calcular o IRPJ?"
Leo: "Baseado no Manual de Contabilidade 2024 e na Legislação Fiscal vigente, o IRPJ é calculado da seguinte forma:

1. **Lucro Real**: Aplique a alíquota de 15% sobre o lucro real
2. **Adicional**: Adicione 10% sobre a parcela que exceder R$ 20.000,00
3. **Prazo**: A declaração deve ser entregue até 31 de maio

**Exemplo prático**:
- Lucro Real: R$ 100.000,00
- IRPJ: R$ 100.000 × 15% = R$ 15.000,00
- Adicional: (R$ 100.000 - R$ 20.000) × 10% = R$ 8.000,00
- Total: R$ 23.000,00

*Fonte: Manual de Contabilidade 2024, Capítulo 8, Seção 3.2*"
```

### 5.2 Busca Automática

**Fluxo interno**:

1. Usuário faz pergunta
2. Sistema gera embedding da pergunta
3. Busca documentos relevantes
4. Injeta contexto no prompt do agente
5. Agente gera resposta enriquecida

**Exemplo técnico**:

```typescript
// Busca automática durante conversa
const searchResults = await knowledgeBaseService.searchKnowledge(
  "Como calcular IRPJ trimestral?",
  "leo" // ID do agente
);

// Contexto enriquecido
const enrichedContext = searchResults
  .map((result) => `**${result.document.title}**: ${result.context}`)
  .join("\n\n");

// Prompt final para o agente
const prompt = `
Contexto da base de conhecimento:
${enrichedContext}

Pergunta do usuário: ${userQuestion}
`;
```

## 6. Troubleshooting

### 6.1 Problemas Comuns

**Documento não processa**:

- Verificar formato suportado
- Validar tamanho do arquivo
- Verificar logs de erro
- Tentar reindexar

**Busca não retorna resultados**:

- Verificar threshold de similaridade
- Confirmar associações com agente
- Validar status do documento
- Testar com query mais específica

**Performance lenta**:

- Verificar índices do banco
- Monitorar uso de CPU/memória
- Otimizar configurações de chunking
- Considerar cache de embeddings

### 6.2 Logs e Debugging

```typescript
// Exemplo de log estruturado
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "knowledge-base",
  "action": "document_upload",
  "userId": "admin-123",
  "documentId": "doc-456",
  "metadata": {
    "fileName": "manual-contabilidade.pdf",
    "fileSize": 2300000,
    "fileType": "pdf",
    "agentIds": ["leo-789"],
    "processingTime": 45000
  }
}
```

## 7. Roadmap de Funcionalidades

### 7.1 Próximas Versões

**v1.1 - Upload em Lote**

- Interface para múltiplos arquivos
- Processamento em background
- Notificações de progresso

**v1.2 - Versionamento**

- Histórico de versões
- Comparação de documentos
- Rollback para versões anteriores

**v1.3 - Analytics Avançado**

- Dashboard de métricas
- Relatórios de uso
- Insights de performance

**v1.4 - Integração Externa**

- Sincronização com Google Drive
- Importação de Confluence
- Webhooks para atualizações

### 7.2 Funcionalidades Futuras

- **IA para Categorização**: Classificação automática de documentos
- **Busca por Imagem**: OCR e busca em documentos escaneados
- **Colaboração**: Comentários e anotações em documentos
- **API Pública**: Integração com sistemas externos
- **Mobile**: App para gerenciamento móvel
