# 🚨 Configuração de Variáveis de Ambiente no Vercel

## Problema Identificado

O build está falhando com o erro:

```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

## ✅ Solução: Configurar Variáveis de Ambiente no Vercel

### 1. Acesse o Dashboard do Vercel

1. Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione o projeto `falachefe-v4`
3. Vá para **Settings** → **Environment Variables**

### 2. Adicione as seguintes variáveis de ambiente:

#### 🔐 Database (PostgreSQL)

```
POSTGRES_URL=[sua_url_do_postgres_supabase]
POSTGRES_URL_NON_POOLING=[sua_url_do_postgres_supabase_non_pooling]
```

#### 🔑 Supabase Authentication

```
NEXT_PUBLIC_SUPABASE_URL=https://mkkddckekpfvpszdtmkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ra2RkY2tla3BmdnBzemR0bWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODI4MzIsImV4cCI6MjA3MjE1ODgzMn0.CGPDa50FPiCUaa3FTU55bZZD3ywwZ2NefyfEg-bhZfM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ra2RkY2tla3BmdnBzemR0bWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU4MjgzMiwiZXhwIjoyMDcyMTU4ODMyfQ.05SzThBmHcma1lBKG3ttXXHtbtBC-lEh_RN3_P88jcc
```

#### 🗄️ Database

```
POSTGRES_URL=postgres://postgres.mkkddckekpfvpszdtmkm:7y5pnrBJYk6cjCp@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://postgres:7y5pnrBJYk6cjCp@db.mkkddckekpfvpszdtmkm.supabase.co:5432/postgres?sslmode=require
```

#### 🤖 OpenAI

```
OPENAI_API_KEY=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=
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
```

### ⚠️ **IMPORTANTE:**

- **NEXT*PUBLIC***: Essas variáveis são expostas para o cliente (browser)
- **Marque como**: Production, Preview, Development

#### 🤖 Google OAuth

```
GOOGLE_CLIENT_ID=[seu_google_client_id]
GOOGLE_CLIENT_SECRET=[seu_google_client_secret]
```

#### 🧠 AI Integration (OpenAI)

```
OPENAI_API_KEY=[sua_chave_da_openai]
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large
```

#### 🌐 App Configuration

```
NEXT_PUBLIC_APP_URL=https://falachefe-v4.vercel.app
```

#### 📁 File Storage (Vercel Blob)

```
BLOB_READ_WRITE_TOKEN=[seu_token_do_vercel_blob]
```

#### 📱 UAZAPI (WhatsApp Integration)

```
UAZAPI_BASE_URL=[sua_url_da_uazapi]
UAZAPI_ADMIN_TOKEN=[seu_token_admin_da_uazapi]
UAZAPI_TOKEN=[seu_token_da_uazapi]
UAZAPI_INSTANCE_TOKEN=[seu_token_de_instancia_da_uazapi]
```

### 📋 Valores das Variáveis (copie do seu arquivo .env local):

**IMPORTANTE**: Use os valores do seu arquivo `.env` local para preencher as variáveis acima.

### 3. ⚙️ Configurações Importantes:

Para cada variável:

- **Environment**: Selecione `Production`, `Preview` e `Development`
- **Sensitive**: ✅ Marque como sensível para chaves e tokens
- **Public**: ✅ Marque como público apenas para variáveis que começam com `NEXT_PUBLIC_`

### 4. 🚀 Após configurar:

1. Vá para **Deployments**
2. Clique em **Redeploy** no último deployment
3. Ou faça um novo push para triggerar um novo build

### 5. ✅ Verificação:

Após configurar as variáveis, o build deve ser bem-sucedido e a aplicação estará disponível em:
**https://falachefe-v4.vercel.app**

## 🔍 Troubleshooting:

Se ainda houver problemas:

1. Verifique se todas as variáveis foram adicionadas corretamente
2. Certifique-se de que não há espaços extras nas chaves/valores
3. Verifique se as variáveis `NEXT_PUBLIC_*` estão marcadas como públicas
4. Aguarde alguns minutos para as variáveis serem propagadas

## 📝 Lista de Variáveis Necessárias:

Copie os valores do seu arquivo `.env` local para estas variáveis no Vercel:

- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- `NEXT_PUBLIC_APP_URL`
- `BLOB_READ_WRITE_TOKEN`
- `UAZAPI_BASE_URL`
- `UAZAPI_ADMIN_TOKEN`
- `UAZAPI_TOKEN`
- `UAZAPI_INSTANCE_TOKEN`
