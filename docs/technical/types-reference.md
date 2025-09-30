# Guia Central de Tipos

Este documento descreve a estratégia unificada para criação, manutenção e uso de tipos no projeto `FalaChefe v4`. A padronização garante que toda adição ou alteração em tipos TypeScript seja rastreável, evitando divergências entre módulos e prevenindo erros de tipagem.

## Estrutura Centralizada

- `src/lib/types.ts`: Define tipos de domínio compartilhados (ex.: `User`, `AgentData`).
- `src/types/`: Armazena declarações auxiliares e arquivos `.d.ts` criados para o projeto (ex.: `vitest.d.ts`).
- `@/lib/orchestrator`: Concentra tipos relacionados ao fluxo de orquestração dos agentes (ex.: `ClassificationResult`).

> Toda criação de tipo compartilhado deve ser adicionada ao arquivo de domínio correspondente e documentada aqui.

## Fluxo de Governança de Tipos

1. **Criar/Atualizar Tipo**: adicionar no módulo correto seguindo convenções existentes.
2. **Documentar**: registrar a mudança neste arquivo e, quando aplicável, atualizar seções específicas (ex.: orquestração, memórias persistentes).
3. **Validar**: executar `pnpm typecheck` para garantir que não há regressões.
4. **Referenciar**: utilizar `Paths` do `tsconfig.json` (`@/*`) para importações consistentes.

## Convenções Gerais

- Preferir `interface` para estruturas de objetos compartilhados.
- Utilizar `type` para unions, interseções e alias específicos.
- Exportar apenas tipos públicos; detalhes internos ficam em módulos localizados.
- Evitar duplicação: reutilizar tipos existentes antes de criar novos.

## Tipos de Domínio Principais

- `User`, `Session`, `AgentData`: representam entidades centrais do sistema (definidos em `src/lib/types.ts`).
- `MultiLayerClassification`, `ClassificationResult`: encapsulam resposta do classificador multi-camada (`src/lib/orchestrator/multi-layer-classifier.ts`).
- `EnhancedAgentResponse`: resposta unificada da orquestração (`src/lib/orchestrator/enhanced-agent-squad.ts`).

## Tipos Auxiliares

- `src/types/vitest.d.ts`: declarações locais para módulos de teste (`vitest`). Devem ser atualizadas sempre que novas funções utilitárias forem utilizadas nas suítes de teste.

## Checklist ao Introduzir um Novo Tipo

- [ ] O tipo representa uma regra de negócio compartilhada?
- [ ] Ele está localizado no módulo correto?
- [ ] A mudança foi adicionada a este documento?
- [ ] Foram executados `pnpm lint` e `pnpm typecheck`?
- [ ] Documentação no ClickUp foi atualizada (quando aplicável)?

## Histórico de Atualizações

- `2025-09-29` — Criação do documento e consolidação inicial das diretrizes de tipos.
