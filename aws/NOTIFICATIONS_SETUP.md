# 📧 Sistema de Notificações - E-mail e WhatsApp

## 🎯 Visão Geral

Sistema enterprise-grade de notificações automáticas para confirmação de pedidos, enviando:
- ✅ **E-mail profissional** via Amazon SES
- ✅ **Mensagem WhatsApp** via Twilio ou Evolution API
- ✅ **Retry automático** com exponential backoff
- ✅ **Error handling** robusto
- ✅ **Logging detalhado** para debugging

## 🏗️ Arquitetura

```
Cliente finaliza compra
    ↓
Mercado Pago processa pagamento
    ↓
Webhook recebe notificação "approved"
    ↓
PaymentWebhookFunction atualiza pedido
    ↓
Invoca SendConfirmationFunction (async)
    ↓
    ├─→ Amazon SES → E-mail ao cliente
    └─→ Twilio/Evolution → WhatsApp ao cliente
```

## 📋 Pré-requisitos

### 1. Amazon SES (E-mail)

#### a) Verificar Domínio
```bash
aws ses verify-domain-identity \
  --domain sweetbarchocolates.com.br \
  --region us-east-1
```

**Importante:** Adicione os registros DNS fornecidos pela AWS no seu provedor de domínio.

#### b) Verificar E-mail (Para Teste)
```bash
aws ses verify-email-identity \
  --email-address noreply@sweetbarchocolates.com.br \
  --region us-east-1

aws ses verify-email-identity \
  --email-address contato@sweetbarchocolates.com.br \
  --region us-east-1
```

#### c) Sair do Sandbox (Produção)

1. Acesse: https://console.aws.amazon.com/ses/
2. Menu: "Account dashboard"
3. Clique em "Request production access"
4. Preencha o formulário explicando o uso (e-commerce, confirmação de pedidos)
5. Aguarde aprovação (geralmente 24h)

**Enquanto no sandbox:**
- Só pode enviar para e-mails verificados
- Limite: 200 e-mails/dia

**Após aprovação:**
- Pode enviar para qualquer e-mail
- Limite inicial: 50.000 e-mails/dia

### 2. WhatsApp - Opção A: Twilio (Recomendado)

#### a) Criar Conta Twilio
1. Acesse: https://www.twilio.com/try-twilio
2. Crie uma conta
3. Verifique seu número de telefone

#### b) Ativar WhatsApp Sandbox (Teste)
1. Console Twilio → Messaging → Try it out → Send a WhatsApp message
2. Envie mensagem de teste para o número Twilio
3. Use o código fornecido

#### c) Produção: WhatsApp Business API
1. Console Twilio → Messaging → WhatsApp → Get Started
2. Siga o processo de aprovação (requer empresa registrada)
3. Custo: ~$0.005 USD por mensagem

#### d) Obter Credenciais
```bash
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WhatsApp Number: whatsapp:+14155238886 (sandbox) ou seu número aprovado
```

#### e) Criar Secret no AWS
```bash
aws secretsmanager create-secret \
  --name natal-menu/twilio \
  --description "Twilio WhatsApp credentials" \
  --secret-string '{
    "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "auth_token": "your-auth-token-here",
    "whatsapp_number": "whatsapp:+14155238886"
  }' \
  --region us-east-1
```

### 3. WhatsApp - Opção B: Evolution API (Gratuito)

#### a) Instalar Evolution API
```bash
# Docker
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua-chave-segura \
  atendai/evolution-api:latest

# Ou seguir: https://evolution-api.com/docs/install
```

#### b) Conectar WhatsApp
1. Acesse: http://seu-servidor:8080
2. Crie uma instância (ex: "sweetbar")
3. Escaneie QR Code com WhatsApp Business
4. Anote a API Key

#### c) Criar Secret no AWS
```bash
aws secretsmanager create-secret \
  --name natal-menu/evolution \
  --description "Evolution API WhatsApp credentials" \
  --secret-string '{
    "api_url": "https://seu-servidor.com",
    "api_key": "sua-api-key",
    "instance": "sweetbar"
  }' \
  --region us-east-1
```

## 🚀 Deploy

### 1. Instalar Dependências
```bash
cd aws/lambda/notifications
npm install
cd ../..
```

### 2. Atualizar package.json do payments (adicionar Lambda SDK)
```bash
cd lambda/payments
npm install @aws-sdk/client-lambda
cd ../..
```

### 3. Build e Deploy
```bash
# Build all functions
sam build

# Deploy com prompt
sam deploy \
  --stack-name natal-menu-backend-v2 \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Ou sem prompt
sam deploy \
  --stack-name natal-menu-backend-v2 \
  --capabilities CAPABILITY_IAM \
  --region us-east-1 \
  --no-confirm-changeset
```

## 🧪 Testar

### 1. Testar E-mail Localmente
```bash
# Invocar função diretamente
aws lambda invoke \
  --function-name natal-menu-backend-v2-SendConfirmationFunction \
  --payload '{"orderId": "order-xxxxx-xxxxx"}' \
  response.json

cat response.json
```

### 2. Testar WhatsApp
```bash
# Mesma invocação acima
# Verifique logs no CloudWatch
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow
```

### 3. Testar Fluxo Completo
1. Faça uma compra de teste no site
2. Use cartão de teste do Mercado Pago
3. Aguarde webhook ser chamado
4. Verifique e-mail e WhatsApp

## 📊 Monitoramento

### CloudWatch Logs
```bash
# Logs da função de notificações
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow

# Logs do webhook
aws logs tail /aws/lambda/natal-menu-backend-v2-PaymentWebhookFunction --follow
```

### Métricas CloudWatch
- **Invocations**: Quantas vezes foi chamada
- **Errors**: Falhas na execução
- **Duration**: Tempo de execução
- **Throttles**: Requisições limitadas

### SES Metrics (Console AWS)
- Emails enviados
- Bounces (e-mails inválidos)
- Complaints (marcados como spam)

## 🔧 Troubleshooting

### E-mail não chegando

1. **Verificar SES Sandbox**
```bash
aws ses get-account-sending-enabled --region us-east-1
```

2. **Verificar e-mail do destinatário**
```bash
# Se no sandbox, verificar e-mail
aws ses verify-email-identity \
  --email-address cliente@exemplo.com \
  --region us-east-1
```

3. **Verificar logs**
```bash
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow
```

4. **Verificar bounces/rejeições**
- Console SES → Email Sending → Reputation Dashboard

### WhatsApp não chegando

1. **Twilio: Verificar Sandbox**
- Cliente precisa ter enviado mensagem para número Twilio primeiro
- Envie: `join <código>` para o número sandbox

2. **Verificar formato do telefone**
- Deve estar no formato internacional: 5548991960811
- Brasil: código 55 + DDD + número

3. **Verificar logs**
```bash
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --follow | grep WHATSAPP
```

4. **Testar API manualmente**
```bash
# Twilio
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json" \
  --data-urlencode "From=whatsapp:+14155238886" \
  --data-urlencode "To=whatsapp:+5548991960811" \
  --data-urlencode "Body=Teste" \
  -u ${ACCOUNT_SID}:${AUTH_TOKEN}
```

### Lambda timeout

Se ocorrer timeout:
1. Aumentar timeout no template.yaml (max: 900s)
2. Otimizar código (usar Promise.all para paralelizar)

## 💰 Custos

### Amazon SES
- **Grátis**: Primeiros 62.000 e-mails/mês (EC2/Lambda)
- **Depois**: $0.10 USD por 1.000 e-mails
- **Estimativa**: ~R$ 0,50 por mês para 5.000 e-mails

### Amazon Lambda
- **Grátis**: 1 milhão de invocações/mês
- **Depois**: $0.20 USD por 1M invocações
- **Estimativa**: Grátis para maioria dos casos

### Twilio WhatsApp
- **Sandbox**: Grátis (limitado)
- **Produção**: ~$0.005 USD por mensagem
- **Estimativa**: $25 USD/mês para 5.000 mensagens = R$ 125/mês

### Evolution API
- **Custo**: Grátis (self-hosted)
- **Infraestrutura**: VPS (~R$ 20-50/mês)
- **Estimativa**: R$ 35/mês

## 🎨 Personalização

### Customizar Templates de E-mail

Edite `aws/lambda/notifications/send-confirmation.js`:

```javascript
function generateEmailTemplate(order) {
  // Modificar HTML aqui
  // Adicionar logo, cores diferentes, etc
}
```

### Customizar Mensagem WhatsApp

```javascript
function generateWhatsAppMessage(order) {
  // Modificar mensagem aqui
  // Adicionar emojis, links, etc
}
```

### Adicionar Mais Notificações

Exemplos de gatilhos:
- Pedido enviado para entrega
- Pedido entregue
- Pedido cancelado
- Lembrete de entrega

Criar novas funções ou adicionar lógica no webhook.

## 📈 Melhorias Futuras

### Curto Prazo
- [ ] Template de e-mail com imagens dos produtos
- [ ] Enviar comprovante em PDF anexado
- [ ] Rastreamento de entrega por link

### Médio Prazo
- [ ] SMS para backup (AWS SNS)
- [ ] Push notifications (OneSignal/Firebase)
- [ ] Integração com CRM

### Longo Prazo
- [ ] IA para resposta automática WhatsApp
- [ ] Chatbot de atendimento
- [ ] Sistema de avaliação pós-compra

## 🔐 Segurança

### Secrets Manager
Nunca commite credenciais! Use AWS Secrets Manager:

```bash
# Criar secret
aws secretsmanager create-secret --name natal-menu/SERVICE --secret-string '{...}'

# Atualizar secret
aws secretsmanager update-secret --secret-id natal-menu/SERVICE --secret-string '{...}'

# Ver secret (admin apenas)
aws secretsmanager get-secret-value --secret-id natal-menu/SERVICE
```

### IAM Policies
- Princípio do menor privilégio
- Apenas recursos necessários
- Logs auditáveis

## 📞 Suporte

Problemas? Contato:
- **E-mail:** contato@sweetbarchocolates.com.br
- **WhatsApp:** (48) 99196-0811

## ✅ Checklist de Deploy

- [ ] SES domínio verificado
- [ ] SES saiu do sandbox (produção)
- [ ] E-mails verificados (teste)
- [ ] Twilio conta criada (ou Evolution instalada)
- [ ] Secrets configurados no AWS
- [ ] package.json instalado (npm install)
- [ ] SAM build executado
- [ ] SAM deploy concluído
- [ ] Teste com compra real
- [ ] Monitoramento CloudWatch ativado

## 🎉 Pronto!

Após seguir todos os passos, o sistema estará enviando confirmações automaticamente para todos os pedidos aprovados!

**Tempo estimado de setup:** 2-3 horas (primeira vez)
**Tempo de setup posterior:** 15 minutos

---

_Documentação criada em: 07/11/2024_
_Versão: 1.0.0_
_Sweet Bar Chocolates - E-commerce Premium_
