# 🔍 Guia de Debug do Onboarding

## 📊 Status da Investigação

✅ **Tabelas do banco:** Todas as tabelas necessárias existem  
✅ **Schema:** O schema está correto e atualizado  
✅ **API de onboarding:** A lógica da API está correta e melhorada  
✅ **Componentes frontend:** O código dos componentes está correto

## 🎯 Problema Identificado

O erro **401 (Não autorizado)** indica que o usuário não está logado quando tenta salvar os dados do onboarding.

## 🛠️ Correções Implementadas

### 1. **Sincronização Automática do Usuário**

- Adicionada sincronização automática do usuário do Supabase Auth para nossa tabela `user`
- Isso garante que o usuário existe na nossa base de dados antes de salvar o onboarding

### 2. **Logs Detalhados**

- Adicionados logs detalhados na API para facilitar o debug
- Cada etapa do processo é logada no console

### 3. **Tratamento de Erros Melhorado**

- Melhor tratamento de erros com mensagens mais específicas
- Validação aprimorada dos dados obrigatórios

## 🧪 Como Testar o Onboarding

### **Passo 1: Fazer Login**

1. Acesse `http://localhost:3000`
2. Clique em "Entrar" ou "Sign In"
3. Faça login com suas credenciais

### **Passo 2: Acessar o Onboarding**

1. Após o login, você será redirecionado para o dashboard
2. Se for um usuário novo, será automaticamente redirecionado para `/onboarding`
3. Ou acesse diretamente: `http://localhost:3000/onboarding`

### **Passo 3: Completar o Fluxo**

1. **Boas-vindas:** Selecione as áreas de interesse (Marketing, Vendas, Financeiro)
2. **Empresa:** Preencha as informações da sua empresa
3. **WhatsApp:** Configure o número do WhatsApp
4. **Categorias:** Selecione as categorias padrão e/ou crie categorias personalizadas
5. **Conclusão:** Clique em "Finalizar Configuração"

### **Passo 4: Verificar o Resultado**

- Se tudo der certo, você será redirecionado para o dashboard
- Se houver erro, verifique o console do navegador (F12) para ver os logs detalhados

## 🔍 Debug em Caso de Erro

### **Verificar Console do Navegador**

1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Procure por mensagens de erro ou logs da API

### **Verificar Network Tab**

1. No DevTools, vá para a aba "Network"
2. Tente completar o onboarding novamente
3. Procure pela requisição para `/api/onboarding`
4. Clique nela para ver:
   - Status da resposta
   - Dados enviados
   - Dados recebidos

### **Logs do Servidor**

Se você tiver acesso ao terminal onde o servidor está rodando, verifique os logs que agora incluem:

- ✅ Usuário sincronizado com sucesso
- ✅ Empresa criada/atualizada
- ✅ Preferências de onboarding criadas
- ✅ Configurações do usuário criadas
- ✅ Categorias criadas

## 🚨 Possíveis Problemas e Soluções

### **Problema 1: Erro 401 (Não autorizado)**

**Causa:** Usuário não está logado  
**Solução:** Fazer login antes de acessar o onboarding

### **Problema 2: Erro 400 (Dados obrigatórios faltando)**

**Causa:** Algum campo obrigatório não foi preenchido  
**Solução:** Verificar se todos os campos obrigatórios estão preenchidos

### **Problema 3: Erro 500 (Erro interno do servidor)**

**Causa:** Problema no banco de dados ou na lógica da API  
**Solução:** Verificar logs do servidor para mais detalhes

### **Problema 4: Redirecionamento não funciona**

**Causa:** Problema na navegação após sucesso  
**Solução:** Verificar se a página de destino existe

## 📋 Checklist de Verificação

- [ ] Usuário está logado
- [ ] Servidor está rodando (`pnpm run dev`)
- [ ] Banco de dados está acessível
- [ ] Todas as tabelas existem no banco
- [ ] Campos obrigatórios estão preenchidos
- [ ] Não há erros no console do navegador
- [ ] Não há erros nos logs do servidor

## 🎉 Resultado Esperado

Quando tudo funcionar corretamente, você deve ver:

1. **No frontend:** Mensagem de sucesso e redirecionamento para o dashboard
2. **No console do navegador:** Logs de sucesso da API
3. **No servidor:** Logs detalhados de cada etapa do processo
4. **No banco:** Dados salvos nas tabelas `companies`, `onboardingPreferences`, `userSettings` e `categories`

## 🔧 Scripts de Teste Disponíveis

- `./scripts/test-onboarding-detailed.sh` - Testa a API sem autenticação
- `./scripts/debug-onboarding.js` - Verifica configuração do Supabase
- `./scripts/check-tables.js` - Verifica se as tabelas existem

## 📞 Próximos Passos

Se ainda houver problemas após seguir este guia:

1. **Capture os logs** do console do navegador e do servidor
2. **Documente o erro** exato que está acontecendo
3. **Verifique se** todas as dependências estão instaladas
4. **Teste em** um ambiente limpo se necessário
