# 🔧 Configuração Google Console - Passo a Passo

## ❌ **Erro Atual:**

```
Erro 400: redirect_uri_mismatch
Não é possível fazer login porque vibecodeapp enviou uma solicitação inválida
```

## 🎯 **Solução Detalhada:**

### **PASSO 1: Acessar o Google Console**

1. Vá para: https://console.cloud.google.com/apis/credentials
2. Faça login com sua conta Google
3. Selecione o projeto correto (ou crie um novo se necessário)

### **PASSO 2: Encontrar o OAuth 2.0 Client ID**

1. Na página de credenciais, procure por "OAuth 2.0 Client IDs"
2. Encontre o Client ID: `560103977575-vfd9s09l6it6ve9f5t3dnrmvj40ef58f.apps.googleusercontent.com`
3. Clique no **ícone de lápis** (Editar) ao lado

### **PASSO 3: Configurar os Redirect URIs**

1. Na seção **"URIs de redirecionamento autorizados"**
2. **ADICIONE** as seguintes URLs (uma por linha):
   ```
   http://localhost:3000/auth/callback
   https://falachefe-v4.vercel.app/auth/callback
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

## 📋 **URLs que DEVEM estar configuradas:**

### **Desenvolvimento:**

- `http://localhost:3000/auth/callback`

### **Produção:**

- `https://falachefe-v4.vercel.app/auth/callback`

## 🔗 **Links Diretos:**

- **Google Console**: https://console.cloud.google.com/apis/credentials
- **Login Local**: http://localhost:3000/auth/signin
- **Login Produção**: https://falachefe-v4.vercel.app/auth/signin

## ⚠️ **Importante:**

1. **Certifique-se de adicionar AMBAS as URLs** (local e produção)
2. **Aguarde a propagação** - pode levar até 10 minutos
3. **Teste em ambos os ambientes** após configurar
4. **Verifique se não há espaços extras** nas URLs

## 🧪 **Como Verificar se Funcionou:**

1. **Teste Local**: http://localhost:3000/auth/signin
2. **Teste Produção**: https://falachefe-v4.vercel.app/auth/signin
3. Clique em "Entrar com Google"
4. Se funcionar, você será redirecionado para o Google
5. Após autorizar, será redirecionado de volta para a aplicação

## 📞 **Se Ainda Não Funcionar:**

1. **Verifique se as URLs estão exatamente como mostrado acima**
2. **Aguarde mais alguns minutos** para a propagação
3. **Verifique se o Client ID está correto**
4. **Verifique se o Google OAuth está habilitado no Supabase Dashboard**

## 🎯 **Checklist Final:**

- [ ] Acessei o Google Console
- [ ] Encontrei o OAuth 2.0 Client ID correto
- [ ] Adicionei `http://localhost:3000/auth/callback`
- [ ] Adicionei `https://falachefe-v4.vercel.app/auth/callback`
- [ ] Salvei as alterações
- [ ] Aguardei 5-10 minutos
- [ ] Testei o login local
- [ ] Testei o login em produção

---

**Após seguir todos os passos, o Google OAuth deve funcionar perfeitamente!** 🚀
