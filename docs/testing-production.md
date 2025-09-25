# 🚀 Guia de Teste em Produção - FalaChefe v4

## ✅ Status Atual do Webhook

O webhook está **FUNCIONANDO** em produção com as seguintes configurações:

- **URL**: `https://falachefe-v4.vercel.app/api/uazapi/webhook`
- **Status**: ✅ ATIVO
- **Eventos**: `messages`, `connection`, `messages_update`
- **ID**: `r821983499fdc51`

## 🧪 Como Testar

### 1. Teste Automático Completo

Execute o script de teste completo:

```bash
node scripts/test-production-webhook.js
```

Este script testa:

- ✅ Acessibilidade do webhook
- ✅ Configuração na UAZAPI
- ✅ Recebimento de mensagens de texto
- ✅ Eventos de conexão
- ✅ Mensagens de mídia

### 2. Teste Manual com WhatsApp

1. **Conecte o WhatsApp** na instância da UAZAPI
2. **Envie uma mensagem** para o número conectado
3. **Verifique se a mensagem é processada**:
   - Acesse: `https://falachefe-v4.vercel.app/dashboard`
   - Verifique se a mensagem aparece no chat

### 3. Verificar Mensagens no Banco

```bash
node scripts/check-whatsapp-messages.js
```

### 4. Habilitar Webhook (se necessário)

Se o webhook estiver desabilitado:

```bash
node scripts/enable-webhook.js
```

## 🔍 URLs de Teste

- **Webhook**: https://falachefe-v4.vercel.app/api/uazapi/webhook
- **Dashboard**: https://falachefe-v4.vercel.app/dashboard
- **Chat**: https://falachefe-v4.vercel.app/chat
- **Onboarding**: https://falachefe-v4.vercel.app/onboarding

## 📊 Monitoramento

### Logs do Webhook

O webhook registra logs para cada evento recebido:

```javascript
console.log("[UAZAPI Webhook]", { event, instanceId, handled: true });
```

### Verificar Status da UAZAPI

```bash
curl -X GET "https://falachefe.uazapi.com/webhook" \
  -H "Content-Type: application/json" \
  -H "token: 6818e86e-ddf2-436c-952c-0d190b627624"
```

## 🐛 Troubleshooting

### Webhook não recebe mensagens

1. **Verificar se está habilitado**:

   ```bash
   node scripts/enable-webhook.js
   ```

2. **Verificar URL na UAZAPI**:

   - Acesse o painel da UAZAPI
   - Confirme se a URL está correta

3. **Verificar logs do Vercel**:
   - Acesse o dashboard do Vercel
   - Verifique os logs da função

### Mensagens não são processadas

1. **Verificar configuração do usuário**:

   - O número do WhatsApp deve estar cadastrado no `userSettings`
   - O usuário deve ter completado o onboarding

2. **Verificar banco de dados**:
   ```bash
   node scripts/check-whatsapp-messages.js
   ```

### Erro de autenticação

1. **Verificar tokens**:

   - `UAZAPI_TOKEN` deve estar configurado
   - `UAZAPI_BASE_URL` deve estar correto

2. **Verificar variáveis de ambiente no Vercel**:
   - Acesse as configurações do projeto no Vercel
   - Verifique se todas as variáveis estão definidas

## 📈 Métricas de Sucesso

- ✅ Webhook responde com status 200
- ✅ Mensagens são salvas no banco de dados
- ✅ Respostas automáticas são enviadas
- ✅ Eventos de conexão são processados
- ✅ Logs são gerados corretamente

## 🔄 Fluxo Completo de Teste

1. **Execute o teste automático**
2. **Conecte o WhatsApp na UAZAPI**
3. **Envie uma mensagem de teste**
4. **Verifique se a mensagem aparece no dashboard**
5. **Confirme se a resposta automática foi enviada**
6. **Verifique os logs no banco de dados**

---

**Status**: ✅ Webhook funcionando em produção
**Última verificação**: $(date)
**Próxima verificação**: Recomendado a cada 24h
