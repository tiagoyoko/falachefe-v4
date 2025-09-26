# Configuração do Webhook no Supabase Dashboard

## 📋 Instruções Passo a Passo

### 1. Acessar o Dashboard do Supabase

- Acesse: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur
- Faça login com suas credenciais

### 2. Navegar para Webhooks

- No menu lateral, clique em **Database**
- Clique em **Webhooks**
- Clique em **Create a new hook**

### 3. Configurar o Webhook

Preencha os seguintes campos:

**Nome do Webhook:**

```
User Sync Webhook
```

**URL do Webhook:**

```
https://falachefe-v4.vercel.app/api/auth-webhook
```

**Eventos (Events):**

```
auth.users.created
auth.users.updated
auth.users.deleted
```

**Secret:**

```
your-webhook-secret-here
```

**Método HTTP:**

```
POST
```

### 4. Salvar Configuração

- Clique em **Save**
- Aguarde a confirmação de que o webhook foi criado

### 5. Testar o Webhook

Execute o script de teste:

```bash
node scripts/test-user-sync.js
```

## 🔧 Configurações Adicionais

### Variáveis de Ambiente no Vercel

Certifique-se de que as seguintes variáveis estão configuradas no Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://zpdartuyaergbxmbmtur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
POSTGRES_URL=postgres://postgres.zpdartuyaergbxmbmtur:...
POSTGRES_URL_NON_POOLING=postgres://postgres.zpdartuyaergbxmbmtur:...
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_APP_URL=https://falachefe-v4.vercel.app
OPENAI_API_KEY=sk-proj-...
```

## 🧪 Testes de Validação

### 1. Testar Status da Sincronização

```bash
curl -X GET https://falachefe-v4.vercel.app/api/user-sync
```

### 2. Testar Sincronização de Usuários Órfãos

```bash
curl -X POST https://falachefe-v4.vercel.app/api/user-sync \
  -H "Content-Type: application/json" \
  -d '{"action": "sync-orphaned"}'
```

### 3. Testar Criação de Usuário

- Acesse a aplicação
- Crie uma nova conta
- Verifique se o usuário foi sincronizado automaticamente

## 📊 Monitoramento

### Logs do Webhook

- Acesse o dashboard do Supabase
- Vá para **Database > Webhooks**
- Clique no webhook criado
- Verifique os logs de execução

### Logs da Aplicação

- Acesse o dashboard do Vercel
- Vá para **Functions**
- Verifique os logs da função `/api/auth-webhook`

## 🚨 Troubleshooting

### Webhook não está funcionando

1. Verifique se a URL está correta
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique os logs do webhook no Supabase
4. Teste a conectividade da URL

### Usuários não estão sendo sincronizados

1. Execute o script de sincronização manual
2. Verifique se há usuários órfãos
3. Confirme se o webhook está ativo
4. Verifique os logs da aplicação

### Erro de autenticação

1. Confirme se as chaves do Supabase estão corretas
2. Verifique se o service role key tem permissões adequadas
3. Teste a conexão com o Supabase

## ✅ Checklist de Validação

- [ ] Webhook configurado no Supabase Dashboard
- [ ] URL do webhook acessível
- [ ] Eventos configurados corretamente
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Teste de criação de usuário funcionando
- [ ] Sincronização automática ativa
- [ ] Logs sendo gerados corretamente
- [ ] Usuários órfãos sincronizados
