# 🔧 Configuração do Redirect URI do Supabase no Google Console

## ❌ **Erro Atual:**

```
Erro 400: redirect_uri_mismatch
redirect_uri=https://zpdartuyaergbxmbmtur.supabase.co/auth/v1/callback
```

## 🔍 **Problema Identificado:**

O Supabase usa seu próprio redirect URI padrão que **DEVE** estar configurado no Google Console:

```
https://zpdartuyaergbxmbmtur.supabase.co/auth/v1/callback
```

## ✅ **Solução:**

### **PASSO 1: Acessar o Google Console**

1. Vá para: https://console.cloud.google.com/apis/credentials
2. Faça login com sua conta Google
3. Selecione o projeto correto

### **PASSO 2: Encontrar o OAuth 2.0 Client ID**

1. Na página de credenciais, procure por "OAuth 2.0 Client IDs"
2. Encontre o Client ID: `560103977575-vfd9s09l6it6ve9f5t3dnrmvj40ef58f.apps.googleusercontent.com`
3. Clique no **ícone de lápis** (Editar) ao lado

### **PASSO 3: Configurar o Redirect URI do Supabase**

1. Na seção **"URIs de redirecionamento autorizados"**
2. **ADICIONE** o redirect URI do Supabase:
   ```
   https://zpdartuyaergbxmbmtur.supabase.co/auth/v1/callback
   ```

### **PASSO 4: Salvar as Alterações**

1. Clique em **"SALVAR"** no final da página
2. Aguarde a confirmação de que as alterações foram salvas

### **PASSO 5: Aguardar Propagação**

1. **Aguarde 5-10 minutos** para a propagação das alterações
2. As alterações no Google Console podem levar alguns minutos para serem aplicadas

### **PASSO 6: Testar o Login**

1. Acesse: http://localhost:3000/auth/signin
2. Clique em "Entrar com Google"
3. Deve funcionar sem o erro de redirect_uri_mismatch

## 📋 **Redirect URIs que DEVEM estar configurados:**

### **Obrigatório (Supabase):**

- `https://zpdartuyaergbxmbmtur.supabase.co/auth/v1/callback`

### **Opcional (Aplicação):**

- `http://localhost:3000/auth/callback`
- `https://falachefe-v4.vercel.app/auth/callback`

## 🔗 **Links Diretos:**

- **Google Console**: https://console.cloud.google.com/apis/credentials
- **Login Local**: http://localhost:3000/auth/signin
- **Login Produção**: https://falachefe-v4.vercel.app/auth/signin

## ⚠️ **Importante:**

1. **O redirect URI do Supabase é OBRIGATÓRIO** - sem ele, o OAuth não funciona
2. **Os redirect URIs da aplicação são opcionais** - apenas para redirects customizados
3. **Aguarde a propagação** - pode levar até 10 minutos
4. **Teste em ambos os ambientes** após configurar

## 🧪 **Como Testar Após Configurar:**

1. **Teste Local**: http://localhost:3000/auth/signin
2. **Teste Produção**: https://falachefe-v4.vercel.app/auth/signin
3. Clique em "Entrar com Google"
4. Se funcionar, você será redirecionado para o Google
5. Após autorizar, será redirecionado de volta para a aplicação

## 📞 **Se Ainda Não Funcionar:**

1. **Verifique se o redirect URI do Supabase está configurado**
2. **Aguarde mais alguns minutos** para a propagação
3. **Verifique se o Client ID está correto**
4. **Verifique se o Google OAuth está habilitado no Supabase Dashboard**

## 🎯 **Checklist Final:**

- [ ] Acessei o Google Console
- [ ] Encontrei o OAuth 2.0 Client ID correto
- [ ] Adicionei `https://zpdartuyaergbxmbmtur.supabase.co/auth/v1/callback`
- [ ] Salvei as alterações
- [ ] Aguardei 5-10 minutos
- [ ] Testei o login local
- [ ] Testei o login em produção

## 🔄 **Fluxo do OAuth:**

1. **Usuário clica em "Entrar com Google"**
2. **Aplicação redireciona para o Supabase**
3. **Supabase redireciona para o Google** (usando seu redirect URI)
4. **Google redireciona de volta para o Supabase** (usando o redirect URI do Supabase)
5. **Supabase processa a autenticação**
6. **Supabase redireciona para a aplicação** (usando o redirectTo)

---

**Após configurar o redirect URI do Supabase no Google Console, o Google OAuth deve funcionar perfeitamente!** 🚀
