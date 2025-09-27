# 🔧 Configuração do Google Console - Redirect URI

## ❌ **Erro Atual:**

```
Acesso bloqueado: a solicitação do app vibecodeapp é inválida
```

## 🔍 **Causa:**

O redirect URI `http://localhost:3000/auth/callback` não está configurado no Google Console.

## ✅ **Solução Passo a Passo:**

### 1. **Acesse o Google Console**

- Vá para: https://console.cloud.google.com/apis/credentials
- Faça login com sua conta Google

### 2. **Encontre o OAuth 2.0 Client ID**

- Procure pelo Client ID: `560103977575-vfd9s09l6it6ve9f5t3dnrmvj40ef58f.apps.googleusercontent.com`
- Clique em **"Editar"** (ícone de lápis)

### 3. **Configure os URIs de Redirecionamento**

Na seção **"URIs de redirecionamento autorizados"**, adicione:

```
http://localhost:3000/auth/callback
https://falachefe-v4.vercel.app/auth/callback
```

### 4. **Salve as Alterações**

- Clique em **"Salvar"**
- Aguarde 5-10 minutos para a propagação

### 5. **Teste o Login**

- Acesse: http://localhost:3000/auth/signin
- Clique em "Entrar com Google"
- Deve funcionar corretamente!

## 📋 **URLs que Devem Estar Configuradas:**

### **Desenvolvimento:**

- `http://localhost:3000/auth/callback`

### **Produção:**

- `https://falachefe-v4.vercel.app/auth/callback`

## 🔗 **Links Diretos:**

- **Google Console**: https://console.cloud.google.com/apis/credentials
- **Supabase Dashboard**: https://supabase.com/dashboard/project/zpdartuyaergbxmbmtur/auth/providers
- **Aplicação Local**: http://localhost:3000/auth/signin

## ⚠️ **Importante:**

1. **Aguarde a propagação**: As alterações podem levar alguns minutos
2. **Teste em ambos os ambientes**: Local e produção
3. **Verifique o domínio**: Certifique-se de que o domínio está autorizado

## 🧪 **Como Testar Após Configurar:**

1. **Local**: http://localhost:3000/auth/signin
2. **Produção**: https://falachefe-v4.vercel.app/auth/signin
3. Clique em "Entrar com Google"
4. Faça login com sua conta Google
5. Verifique se o redirecionamento funciona

## 📞 **Se Ainda Não Funcionar:**

1. Verifique se o Client ID está correto
2. Verifique se o Client Secret está configurado no Supabase
3. Verifique se o Google OAuth está habilitado no Supabase Dashboard
4. Aguarde mais alguns minutos para a propagação

---

**Após configurar o redirect URI no Google Console, o Google OAuth deve funcionar perfeitamente em ambos os ambientes!** 🚀
