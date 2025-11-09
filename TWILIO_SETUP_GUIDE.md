# 📱 Guia de Configuração Twilio WhatsApp - Sweet Bar

## 🚀 Passo a Passo Completo

### **1️⃣ Obter Credenciais do Twilio (2 minutos)**

1. Acesse: https://console.twilio.com/
2. Faça login
3. No Dashboard, você verá:
   - **Account SID** (começa com "AC...")
   - **Auth Token** (clique em "Show" para revelar)

**Copie ambos!** Você vai precisar deles.

---

### **2️⃣ Ativar Sandbox WhatsApp (3 minutos)**

1. No Console Twilio, vá em:
   - **Messaging** → **Try it out** → **Send a WhatsApp message**

2. Você verá:
   - **Número Twilio:** +1 415 523 8886
   - **Código de ativação:** (ex: "join abc-xyz")

3. **No seu celular:**
   - Adicione o número: **+1 415 523 8886**
   - Envie mensagem: **join [seu-código]**
   - Aguarde resposta de confirmação

4. Adicione também o número de teste:
   - **Seu WhatsApp:** (48) 99196-0811
   - Envie a mesma mensagem: **join [seu-código]**

---

### **3️⃣ Criar Secret na AWS (1 minuto)**

**Substitua os valores abaixo** pelas suas credenciais:

```powershell
aws secretsmanager create-secret `
  --name natal-menu/twilio `
  --secret-string '{\"account_sid\":\"SEU_ACCOUNT_SID_AQUI\",\"auth_token\":\"SEU_AUTH_TOKEN_AQUI\",\"whatsapp_number\":\"whatsapp:+14155238886\"}' `
  --region us-east-1
```

**Exemplo:**
```powershell
aws secretsmanager create-secret `
  --name natal-menu/twilio `
  --secret-string '{\"account_sid\":\"ACa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p\",\"auth_token\":\"1234567890abcdef\",\"whatsapp_number\":\"whatsapp:+14155238886\"}' `
  --region us-east-1
```

---

### **4️⃣ Atualizar Template AWS (2 minutos)**

Edite o arquivo: `aws/template.yaml`

Procure por `SendConfirmationFunction` (linha ~355) e adicione as variáveis de ambiente:

```yaml
SendConfirmationFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: lambda/notifications/
    Handler: send-confirmation.handler
    Timeout: 30
    MemorySize: 512
    Environment:
      Variables:
        SES_FROM_EMAIL: noreply@sweetbarchocolates.com.br
        SES_REPLY_TO_EMAIL: contato@sweetbarchocolates.com.br
        BCC_EMAIL: contato@sweetbarchocolates.com.br
        # ADICIONE ESTAS 3 LINHAS ABAIXO:
        TWILIO_ACCOUNT_SID: !Sub '{{resolve:secretsmanager:natal-menu/twilio:SecretString:account_sid}}'
        TWILIO_AUTH_TOKEN: !Sub '{{resolve:secretsmanager:natal-menu/twilio:SecretString:auth_token}}'
        TWILIO_WHATSAPP_NUMBER: !Sub '{{resolve:secretsmanager:natal-menu/twilio:SecretString:whatsapp_number}}'
```

**Salve o arquivo!**

---

### **5️⃣ Redeploy do Backend (2 minutos)**

```powershell
cd "D:\Natal Menu Page\aws"
sam build
sam deploy --stack-name natal-menu-backend-v2 --capabilities CAPABILITY_IAM --region us-east-1 --resolve-s3 --no-confirm-changeset
```

Aguarde a mensagem: `Successfully created/updated stack`

---

### **6️⃣ Testar WhatsApp (1 minuto)**

Execute o script de teste:

```powershell
cd "D:\Natal Menu Page"
powershell -ExecutionPolicy Bypass -File test-twilio.ps1
```

**Verifique:**
- ✅ Email em: contato@sweetbarchocolates.com.br
- ✅ WhatsApp em: (48) 99196-0811

---

## ✅ CHECKLIST COMPLETO

- [ ] Copiar Account SID do Twilio
- [ ] Copiar Auth Token do Twilio
- [ ] Ativar sandbox WhatsApp (enviar "join")
- [ ] Criar secret na AWS
- [ ] Editar `template.yaml`
- [ ] Fazer redeploy (`sam build && sam deploy`)
- [ ] Testar com script
- [ ] Verificar email recebido
- [ ] Verificar WhatsApp recebido

---

## 🐛 TROUBLESHOOTING

### **Erro: "Twilio error 403"**
- Verifique se o Auth Token está correto
- Recrie o secret com credenciais corretas

### **Erro: "Unverified number"**
- O número precisa ter enviado "join" no sandbox
- Aguarde confirmação do Twilio

### **WhatsApp não chega:**
```bash
# Ver logs detalhados
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction-ianCzRc8F1yk --since 10m --region us-east-1 | findstr WHATSAPP
```

---

## 📞 NÚMEROS IMPORTANTES

**Twilio Sandbox:**
- **Número:** +1 415 523 8886
- **Para ativar:** Envie "join [código]"

**Sweet Bar:**
- **WhatsApp:** (48) 99196-0811

---

## 💡 ALTERNATIVA GRÁTIS

Se preferir não usar Twilio, use **Evolution API** (self-hosted):

```bash
# Docker
docker run -d -p 8080:8080 -e AUTHENTICATION_API_KEY=sua-chave atendai/evolution-api

# Secret AWS
aws secretsmanager create-secret --name natal-menu/evolution --secret-string "{\"api_url\":\"http://seu-ip:8080\",\"api_key\":\"sua-chave\",\"instance\":\"sweetbar\"}" --region us-east-1
```

---

**Próximo passo:** Copie suas credenciais Twilio e execute o Passo 3! 🚀





