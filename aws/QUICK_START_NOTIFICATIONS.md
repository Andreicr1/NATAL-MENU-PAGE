# 🚀 Quick Start - Notificações (5 minutos)

## Modo Express - Setup Rápido

### 1️⃣ Configurar SES (E-mail) - 2 minutos

```bash
# Windows (PowerShell)
aws ses verify-email-identity --email-address noreply@sweetbarchocolates.com.br --region us-east-1
aws ses verify-email-identity --email-address contato@sweetbarchocolates.com.br --region us-east-1

# Verifique os e-mails na caixa de entrada e clique no link de confirmação
```

⚠️ **Importante:** No sandbox, só pode enviar para e-mails verificados. Para produção, solicite saída do sandbox no console SES.

### 2️⃣ Configurar Twilio (WhatsApp) - 2 minutos

```bash
# 1. Acesse: https://www.twilio.com/console
# 2. Copie as credenciais

# 3. Criar secret
aws secretsmanager create-secret ^
  --name natal-menu/twilio ^
  --secret-string "{\"account_sid\":\"ACxxxxx\",\"auth_token\":\"xxxxx\",\"whatsapp_number\":\"whatsapp:+14155238886\"}" ^
  --region us-east-1
```

**Teste WhatsApp Sandbox:**
1. Envie mensagem para o número Twilio
2. Digite: `join <código-fornecido>`

### 3️⃣ Deploy - 1 minuto

```bash
cd aws

# Instalar dependências
cd lambda\notifications
npm install
cd ..\payments
npm install @aws-sdk/client-lambda
cd ..\..

# Build e Deploy
sam build
sam deploy --stack-name natal-menu-backend-v2 --capabilities CAPABILITY_IAM --region us-east-1 --no-confirm-changeset
```

### ✅ Pronto!

Agora toda compra aprovada enviará:
- ✅ E-mail de confirmação
- ✅ WhatsApp de confirmação

## 🧪 Testar

```bash
# Fazer uma compra de teste
# Usar cartão: 5031 4332 1540 6351

# Ver logs
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow
```

## 📱 WhatsApp Alternativo (Grátis)

Se não quiser usar Twilio, use Evolution API:

```bash
# Docker
docker run -d -p 8080:8080 -e AUTHENTICATION_API_KEY=sua-chave atendai/evolution-api

# Criar secret
aws secretsmanager create-secret ^
  --name natal-menu/evolution ^
  --secret-string "{\"api_url\":\"http://seu-servidor:8080\",\"api_key\":\"sua-chave\",\"instance\":\"sweetbar\"}" ^
  --region us-east-1
```

## 🔥 Comandos Úteis

```bash
# Ver secrets configurados
aws secretsmanager list-secrets --region us-east-1 | findstr natal-menu

# Atualizar secret Twilio
aws secretsmanager update-secret --secret-id natal-menu/twilio --secret-string "{...}" --region us-east-1

# Ver função Lambda
aws lambda get-function --function-name natal-menu-backend-v2-SendConfirmationFunction

# Ver últimas notificações (logs)
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --since 1h --region us-east-1

# Testar função diretamente
aws lambda invoke --function-name natal-menu-backend-v2-SendConfirmationFunction --payload "{\"orderId\":\"order-xxx\"}" response.json
```

---

**Tempo total:** ~5 minutos
**Documentação completa:** `NOTIFICATIONS_SETUP.md`
