# 📧 Notification Service - Order Confirmations

Sistema de notificações automáticas para confirmação de pedidos.

## 📁 Estrutura

```
notifications/
├── send-confirmation.js    # Lambda principal
├── package.json           # Dependências
└── README.md             # Esta documentação
```

## 🔧 Funcionalidades

### E-mail (Amazon SES)
- Template HTML responsivo e profissional
- Versão texto plain para clientes antigos
- Retry automático (3 tentativas)
- BCC para admin
- Tags para tracking

### WhatsApp (Twilio ou Evolution API)
- Mensagem formatada com emojis
- Suporte a múltiplos provedores
- Retry automático (3 tentativas)
- Detecção automática do provedor disponível

## 🎯 Triggers

A função é invocada **automaticamente** quando:
1. Webhook do Mercado Pago recebe `status: "approved"`
2. `PaymentWebhookFunction` invoca `SendConfirmationFunction` (async)

Pode também ser invocada **manualmente**:
```bash
aws lambda invoke \
  --function-name natal-menu-backend-v2-SendConfirmationFunction \
  --payload '{"orderId": "order-xxxxx"}' \
  response.json
```

## 📊 Logs

```bash
# Ver logs em tempo real
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow

# Ver últimas 30 linhas
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --since 1h

# Filtrar por tipo
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow --filter-pattern "[EMAIL]"
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow --filter-pattern "[WHATSAPP]"
```

## 🧪 Testes

### Teste Local (com Docker)
```bash
# Simular evento
sam local invoke SendConfirmationFunction -e test-event.json

# test-event.json
{
  "orderId": "order-test-12345"
}
```

### Teste em Produção
```bash
# 1. Fazer compra de teste
# 2. Ver logs
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow

# 3. Verificar e-mail e WhatsApp
```

## ⚙️ Variáveis de Ambiente

Configuradas no `template.yaml`:

```yaml
SES_FROM_EMAIL: noreply@sweetbarchocolates.com.br
SES_REPLY_TO_EMAIL: contato@sweetbarchocolates.com.br
BCC_EMAIL: admin@sweetbarchocolates.com.br
TWILIO_ACCOUNT_SID: (from Secrets Manager)
TWILIO_AUTH_TOKEN: (from Secrets Manager)
TWILIO_WHATSAPP_NUMBER: (from Secrets Manager)
EVOLUTION_API_URL: (optional)
EVOLUTION_API_KEY: (optional)
EVOLUTION_INSTANCE: (optional)
```

## 🔄 Fluxo de Retry

```
Tentativa 1 → Falha → Aguarda 1s
Tentativa 2 → Falha → Aguarda 2s
Tentativa 3 → Falha → Loga erro e continua
```

**Comportamento:**
- Se e-mail falhar, WhatsApp ainda é tentado
- Se WhatsApp falhar, não impacta o webhook
- Webhook sempre retorna 200 OK (não reenviar)

## 📝 Personalizar Templates

### E-mail
Edite função `generateEmailTemplate()` em `send-confirmation.js`

### WhatsApp
Edite função `generateWhatsAppMessage()` em `send-confirmation.js`

## 🐛 Debug

### E-mail não está enviando

```bash
# 1. Verificar se SES está configurado
aws ses get-identity-verification-attributes \
  --identities sweetbarchocolates.com.br \
  --region us-east-1

# 2. Verificar se e-mail está verificado (sandbox)
aws ses list-verified-email-addresses --region us-east-1

# 3. Ver logs de erro
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction \
  --filter-pattern "[ERROR]" \
  --since 1h
```

### WhatsApp não está enviando

```bash
# 1. Verificar se secret existe
aws secretsmanager get-secret-value \
  --secret-id natal-menu/twilio \
  --region us-east-1

# 2. Ver logs específicos
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction \
  --filter-pattern "[WHATSAPP]" \
  --since 1h
```

## 💡 Dicas

1. **Use Twilio Sandbox para testes** - Grátis e rápido
2. **Ative SES Production** - Para enviar para qualquer e-mail
3. **Configure BCC** - Para receber cópia de todos os e-mails
4. **Monitore CloudWatch** - Para detectar problemas rapidamente
5. **Use Evolution API** - Se quiser evitar custos do Twilio

## 📈 Métricas de Sucesso

Acesse CloudWatch → Métricas → Lambda → Por Função:

- **SendConfirmationFunction**
  - Invocations: Quantas notificações enviadas
  - Errors: Quantas falharam
  - Duration: Tempo médio de envio
  - Success rate: % de sucesso

Target: **>95% success rate**

## 🎉 Resultado

Após setup completo, cliente recebe em **segundos**:

1. ✅ E-mail profissional com todos os detalhes
2. ✅ WhatsApp confirmando entrega
3. ✅ Experiência premium e profissional

**Sweet Bar - E-commerce de Alto Padrão** 🍫
