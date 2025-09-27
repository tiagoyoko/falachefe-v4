# 🔧 Correção do Google OAuth - redirect_uri_mismatch

## ❌ **Erro Atual:**

```
Erro 400: redirect_uri_mismatch
Acesso bloqueado: a solicitação do app vibecodeapp é inválida
```

## 🔍 **Causa do Problema:**

O redirect URI `https://falachefe-v4.vercel.app/auth/callback` não está configurado no Google Console.

## ✅ **Solução:**

### 1. **Acesse o Google Console**

- Vá para: https://console.cloud.google.com/apis/credentials
- Faça login com sua conta Google

### 2. **Encontre o OAuth 2.0 Client ID**

- Procure pelo Client ID: `560103977575-vfd9s09l6it6ve9f5t3dnrmvj40ef58f.apps.googleusercontent.com`
- Clique em **"Editar"** (ícone de lápis)

### 3. **Configure os URIs de Redirecionamento**

Na seção **"URIs de redirecionamento autorizados"**, adicione:

```
https://falachefe-v4.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### 4. **Salve as Alterações**

- Clique em **"Salvar"**
- Aguarde alguns minutos para a propagação das alterações

### 5. **Teste o Login**

- Acesse: https://falachefe-v4.vercel.app/auth/signin
- Clique em "Entrar com Google"
- O login deve funcionar corretamente

## 📋 **URLs que Devem Estar Configuradas:**

### **Produção:**

- `https://falachefe-v4.vercel.app/auth/callback`

### **Desenvolvimento:**

- `http://localhost:3000/auth/callback`

## 🔗 **Links Úteis:**

- **Google Console**: https://console.cloud.google.com/apis/credentials
- **Supabase Dashboard**: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers
- **Aplicação**: https://falachefe-v4.vercel.app/auth/signin

## ⚠️ **Importante:**

1. **Aguarde a propagação**: As alterações no Google Console podem levar alguns minutos para serem aplicadas
2. **Verifique o domínio**: Certifique-se de que o domínio `falachefe-v4.vercel.app` está autorizado
3. **Teste em produção**: Sempre teste o login em produção após fazer as alterações

## 🧪 **Como Testar:**

1. Acesse a página de login
2. Clique em "Entrar com Google"
3. Se funcionar, você será redirecionado para o Google
4. Após autorizar, será redirecionado de volta para a aplicação

## 📞 **Se Ainda Não Funcionar:**

1. Verifique se o Client ID está correto
2. Verifique se o Client Secret está configurado no Supabase
3. Verifique se o Google OAuth está habilitado no Supabase Dashboard
4. Aguarde mais alguns minutos para a propagação

---

**Após configurar o redirect URI, o Google OAuth deve funcionar perfeitamente!** 🚀
