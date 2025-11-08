# 🚀 Deploy - Sistema de Notificações

## Guia Passo a Passo para Produção

### 📋 Pré-requisitos

```bash
# Verificar ferramentas instaladas
aws --version          # AWS CLI 2.x
sam --version          # SAM CLI 1.x
npm --version          # Node.js 18+ / npm 9+
```

## 🔧 Fase 1: Configuração AWS (15 minutos)

### 1.1 - Amazon SES

```bash
# Verificar domínio
aws ses verify-domain-identity \
  --domain sweetbarchocolates.com.br \
  --region us-east-1

# Output mostrará registros DNS para adicionar
```

**Ação necessária:**
1. Copie os registros DKIM fornecidos
2. Adicione no DNS do seu domínio (ex: Registro.br, GoDaddy)
3. Aguarde propagação (5-30 minutos)

```bash
# Verificar status
aws ses get-identity-verification-attributes \
  --identities sweetbarchocolates.com.br \
  --region us-east-1

# Deve mostrar: "VerificationStatus": "Success"
```

```bash
# Verificar e-mails (para teste no sandbox)
aws ses verify-email-identity \
  --email-address noreply@sweetbarchocolates.com.br \
  --region us-east-1

aws ses verify-email-identity \
  --email-address contato@sweetbarchocolates.com.br \
  --region us-east-1

# Clique no link de confirmação nos e-mails recebidos
```

**Sair do Sandbox (Opcional - para produção):**
1. Console SES → https://console.aws.amazon.com/ses/
2. Menu: "Account dashboard"
3. Botão: "Request production access"
4. Preencher formulário:
   - **Use case:** Transactional emails (order confirmations)
   - **Website:** https://sweetbarchocolates.com.br
   - **Description:** E-commerce chocolate artesanal, confirmação de pedidos
   - **Monthly volume:** 5.000 e-mails
5. Submit e aguardar aprovação (~24h)

### 1.2 - Twilio WhatsApp

```bash
# 1. Criar conta Twilio
# Acesse: https://www.twilio.com/try-twilio
# Faça cadastro e verifique telefone
```

```bash
# 2. Console Twilio
# https://console.twilio.com
# Copie:
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```bash
# 3. WhatsApp Sandbox (Teste)
# Console → Messaging → Try it out → Send a WhatsApp message
# Anote o número: whatsapp:+14155238886 (pode variar)
# Anote o código: join XXXXX-XXXX
```

```bash
# 4. Enviar mensagem para ativar sandbox
# WhatsApp → Enviar para: +1 415 523 8886
# Mensagem: join XXXXX-XXXX
# Aguardar confirmação
```

```bash
# 5. Criar secret no AWS
aws secretsmanager create-secret \
  --name natal-menu/twilio \
  --description "Twilio WhatsApp API credentials" \
  --secret-string '{
    "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "auth_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "whatsapp_number": "whatsapp:+14155238886"
  }' \
  --region us-east-1
```

## 📦 Fase 2: Instalação (5 minutos)

```bash
# Navegar para pasta do projeto
cd "D:\Natal Menu Page\aws"

# Instalar dependências - Notifications
cd lambda\notifications
npm install
cd ..\..

# Instalar dependências - Payments (atualizado)
cd lambda\payments
npm install
cd ..\..
```

## 🏗️ Fase 3: Build e Deploy (10 minutos)

```bash
# Ainda na pasta aws/

# Build todas as funções
sam build

# Output esperado:
# ✓ Building Lambda functions
# ✓ SendConfirmationFunction
# ✓ PaymentWebhookFunction
# ✓ ...todas as outras funções
```

```bash
# Deploy
sam deploy \
  --stack-name natal-menu-backend-v2 \
  --capabilities CAPABILITY_IAM \
  --region us-east-1 \
  --no-confirm-changeset

# Aguardar conclusão (3-5 minutos)
```

**Output esperado:**
```
CloudFormation stack changeset
-------------------------------------
Operation    ResourceType                           LogicalResourceId
-------------------------------------
+ Add        AWS::Lambda::Function                  SendConfirmationFunction
* Update     AWS::Lambda::Function                  PaymentWebhookFunction
...
-------------------------------------

Deploying...
✓ Stack natal-menu-backend-v2 deployed successfully
```

```bash
# Anotar API URL
aws cloudformation describe-stacks \
  --stack-name natal-menu-backend-v2 \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text

# Exemplo output: https://xxxxxx.execute-api.us-east-1.amazonaws.com
```

## 🧪 Fase 4: Testes (10 minutos)

### 4.1 - Teste da Lambda Isoladamente

```bash
# Invocar função diretamente
aws lambda invoke \
  --function-name natal-menu-backend-v2-SendConfirmationFunction \
  --payload '{"orderId":"order-test"}' \
  --region us-east-1 \
  response.json

# Ver resposta
cat response.json

# Exemplo output:
# {"orderId":"order-test","email":{"sent":false,"error":"Order not found"},"whatsapp":{"sent":false,"error":null}}
```

### 4.2 - Ver Logs
```bash
# Logs em tempo real
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction \
  --follow \
  --region us-east-1

# Ver últimas 50 linhas
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction \
  --since 10m \
  --region us-east-1
```

### 4.3 - Teste End-to-End

```bash
# 1. Acesse o site
https://d3c3no9shu6bly.cloudfront.net

# 2. Adicione produto ao carrinho
# 3. Preencha dados de checkout
#    Email: SEU-EMAIL-VERIFICADO@gmail.com (deve estar verificado no SES se sandbox)
#    Telefone: 48991960811 (ou seu WhatsApp que enviou join)

# 4. Use cartão de teste Mercado Pago
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO

# 5. Aguarde 10-30 segundos

# 6. Verificar logs do webhook
aws logs tail /aws/lambda/natal-menu-backend-v2-PaymentWebhookFunction \
  --since 1m \
  --region us-east-1

# Procurar: "Notification triggered successfully"

# 7. Verificar logs da notification
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction \
  --since 1m \
  --region us-east-1

# Procurar:
# "[EMAIL] Email sent successfully"
# "[WHATSAPP] WhatsApp sent successfully"

# 8. Verificar e-mail e WhatsApp recebidos
```

## 🎯 Fase 5: Validação (5 minutos)

### Checklist de Validação

#### E-mail
- [ ] E-mail chegou na caixa de entrada (não spam)
- [ ] Template HTML renderizou corretamente
- [ ] Informações do pedido estão corretas
- [ ] Links funcionam (WhatsApp, Instagram)
- [ ] Design está responsivo (testar no celular)

#### WhatsApp
- [ ] Mensagem chegou
- [ ] Formatação está correta (negrito, emojis)
- [ ] Informações estão corretas
- [ ] Não foi para spam/bloqueado

#### Logs
- [ ] Nenhum erro nos logs
- [ ] Latência aceitável (< 3s total)
- [ ] CloudWatch mostra invocação bem-sucedida

## 🔄 Fase 6: Rollback (Se necessário)

```bash
# Se algo der errado, fazer rollback

# Opção 1: Rollback do CloudFormation
aws cloudformation rollback-stack \
  --stack-name natal-menu-backend-v2 \
  --region us-east-1

# Opção 2: Deploy da versão anterior
git checkout HEAD~1
sam build
sam deploy --stack-name natal-menu-backend-v2 --capabilities CAPABILITY_IAM --region us-east-1
```

## 📊 Fase 7: Monitoramento (Contínuo)

### Setup de Alarmes

```bash
# Alarme para erros
aws cloudwatch put-metric-alarm \
  --alarm-name "SendConfirmation-HighErrors" \
  --alarm-description "Alert when notification errors exceed threshold" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=natal-menu-backend-v2-SendConfirmationFunction \
  --treat-missing-data notBreaching \
  --region us-east-1

# Alarme para throttling
aws cloudwatch put-metric-alarm \
  --alarm-name "SendConfirmation-Throttling" \
  --metric-name Throttles \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 60 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=natal-menu-backend-v2-SendConfirmationFunction \
  --region us-east-1
```

### Dashboard CloudWatch

```bash
# Criar dashboard
aws cloudwatch put-dashboard \
  --dashboard-name SweetBar-Notifications \
  --dashboard-body file://monitoring-notifications-dashboard.json \
  --region us-east-1
```

## 🎉 Fase 8: Go Live!

### Production Checklist Final

- [ ] SES fora do sandbox (ou e-mails verificados)
- [ ] Twilio WhatsApp ativo (sandbox ou produção)
- [ ] Deploy concluído sem erros
- [ ] Teste end-to-end passou
- [ ] Alarmes configurados
- [ ] Documentação revisada
- [ ] Equipe treinada

### Comunicação

```markdown
📢 Anúncio para Equipe:

Sistema de notificações automáticas ATIVO! ✅

🎯 O que mudou:
• Clientes recebem e-mail de confirmação automaticamente
• Clientes recebem WhatsApp de confirmação automaticamente
• Processo 100% automático após pagamento aprovado

📊 Monitoramento:
• CloudWatch: [link do dashboard]
• Logs: aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction

🐛 Suporte:
• Se cliente não receber: verificar logs e reenviar manualmente
• Comando: aws lambda invoke --function-name ... --payload '{"orderId":"xxx"}'

🎉 Go Live: [DATA]
```

## 📞 Suporte Pós-Deploy

### Problemas Comuns

**"E-mail não chegou"**
1. Verificar se está no spam
2. Verificar logs: `[EMAIL]`
3. Verificar SES sending statistics
4. Reenviar manualmente se necessário

**"WhatsApp não chegou"**
1. Verificar se número está correto
2. Verificar se sandbox está ativo (Twilio)
3. Verificar logs: `[WHATSAPP]`
4. Reenviar manualmente se necessário

**"Lambda timeout"**
1. Aumentar timeout (max 30s já configurado)
2. Verificar se SES/Twilio estão respondendo
3. Adicionar mais memória (aumentar de 512MB)

## 🎊 Conclusão

Após completar todas as fases:
- ✅ Sistema 100% funcional
- ✅ Clientes recebem confirmações instantâneas
- ✅ Experiência premium garantida
- ✅ Monitoramento ativo
- ✅ Pronto para escalar

**Parabéns! Sistema enterprise implementado com sucesso!** 🎉

---

**Tempo total estimado:** 45-60 minutos
**Complexidade:** Média
**Resultado:** Sistema de notificações de classe mundial 🌟
