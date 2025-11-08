# Configuração do Webhook Mercado Pago

## URL do Webhook
```
https://963pa03698.execute-api.us-east-1.amazonaws.com/payments/webhook
```

## Como Configurar no Painel do Mercado Pago

### 1. Acessar Painel
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Login com sua conta Mercado Pago
3. Selecione sua aplicação

### 2. Configurar Webhook
1. No menu lateral, clique em **"Webhooks"** ou **"Notificações"**
2. Clique em **"Configurar notificações"** ou **"Adicionar webhook"**
3. Cole a URL: `https://963pa03698.execute-api.us-east-1.amazonaws.com/payments/webhook`
4. Selecione os eventos:
   - ✅ **Pagamentos** (payment)
   - ✅ **payment.created**
   - ✅ **payment.updated**
5. Clique em **"Salvar"**

### 3. Testar Webhook

#### Teste Manual via cURL:
```bash
curl -X POST https://963pa03698.execute-api.us-east-1.amazonaws.com/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "action": "payment.updated",
    "data": {
      "id": "1234567890"
    }
  }'
```

#### Teste via PowerShell:
```powershell
$body = @{
    type = "payment"
    action = "payment.updated"
    data = @{
        id = "1234567890"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://963pa03698.execute-api.us-east-1.amazonaws.com/payments/webhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### 4. Verificar Logs

#### Ver logs do webhook:
```bash
aws logs tail /aws/lambda/natal-menu-backend-v2-PaymentWebhookFunction --follow
```

#### Ver logs de notificação:
```bash
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow
```

## Fluxo Completo

1. **Cliente finaliza compra** → Cria pedido no DynamoDB (status: pending)
2. **Cliente paga no Mercado Pago** → Pagamento processado
3. **Mercado Pago envia webhook** → Lambda webhook recebe notificação
4. **Webhook atualiza pedido** → DynamoDB (paymentStatus: approved)
5. **Webhook dispara notificação** → Lambda SendConfirmation
6. **Cliente recebe email** → Confirmação com número do pedido
7. **Cliente recebe WhatsApp** → Mensagem de confirmação

## Troubleshooting

### Webhook não está sendo chamado
- ✅ Verificar se URL está configurada no painel do Mercado Pago
- ✅ Verificar se eventos estão selecionados (payment)
- ✅ Testar manualmente com cURL

### Email não está sendo enviado
1. Verificar logs do webhook:
   ```bash
   aws logs tail /aws/lambda/natal-menu-backend-v2-PaymentWebhookFunction --follow
   ```
2. Procurar por: `[WEBHOOK] ========== PAYMENT APPROVED ==========`
3. Verificar se função de notificação foi invocada
4. Verificar logs da função de notificação:
   ```bash
   aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow
   ```

### Verificar se SES está configurado
```bash
aws ses verify-email-identity --email-address noreply@sweetbarchocolates.com.br
aws ses verify-domain-identity --domain sweetbarchocolates.com.br
```

### Testar envio de email manualmente
```bash
aws lambda invoke \
  --function-name natal-menu-backend-v2-SendConfirmationFunction \
  --payload '{"orderId":"order-test-123"}' \
  response.json
```

## Formato do Webhook do Mercado Pago

### Exemplo de payload recebido:
```json
{
  "type": "payment",
  "action": "payment.updated",
  "data": {
    "id": "1234567890"
  },
  "date_created": "2024-12-20T10:00:00Z",
  "user_id": "123456"
}
```

### Resposta esperada:
```json
{
  "received": true
}
```

## Logs Esperados

### Webhook recebe notificação:
```
[WEBHOOK] ========== WEBHOOK RECEIVED ==========
[WEBHOOK] Full event: {...}
[WEBHOOK] Payment ID: 1234567890
[WEBHOOK] Status: approved
[WEBHOOK] External Reference (orderId): order-abc123
```

### Pagamento aprovado:
```
[WEBHOOK] ========== PAYMENT APPROVED ==========
[WEBHOOK] Triggering confirmation notification...
[WEBHOOK] Notification triggered successfully
```

### Email enviado:
```
[NOTIFICATION] Processing order: order-abc123
[NOTIFICATION] Email sent successfully to: cliente@email.com
[NOTIFICATION] WhatsApp sent successfully to: 5548999999999
```

## URLs Importantes

- **Painel Mercado Pago**: https://www.mercadopago.com.br/developers/panel
- **Documentação Webhooks**: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- **API Gateway**: https://963pa03698.execute-api.us-east-1.amazonaws.com
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups
