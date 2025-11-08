# Migração de AWS SES para SendGrid

## 🎯 Por Que Migrar?

**Problema:** AWS SES está em sandbox e precisa de aprovação (demora dias/semanas)  
**Solução:** SendGrid funciona imediatamente, sem aprovação!

## ✅ O Que Foi Preparado

1. ✅ Código atualizado para suportar SendGrid
2. ✅ Fallback para SES (caso seja aprovado depois)
3. ✅ Script de configuração automático
4. ✅ Dependências adicionadas

## 🚀 Passos para Ativar SendGrid

### Passo 1: Criar Conta SendGrid (5 minutos)

1. Acesse: https://signup.sendgrid.com/
2. Preencha seus dados:
   ```
   Email: seu-email@gmail.com
   Password: (senha forte)
   First Name: Seu Nome
   Last Name: Sobrenome
   Company: Sweet Bar Chocolates
   Website: sweetbarchocolates.com.br
   ```
3. Confirme o email recebido

### Passo 2: Criar API Key (2 minutos)

1. Faça login no SendGrid
2. Vá em: **Settings** → **API Keys** (menu lateral esquerdo)
3. Clique em **Create API Key**
4. Configure:
   ```
   API Key Name: sweet-bar-production
   API Key Permissions: Full Access
   ```
5. Clique em **Create & View**
6. **COPIE A API KEY** (formato: SG.xxxxxxxx...)
   - ⚠️ Ela só aparece uma vez!
   - Salve em local seguro

### Passo 3: Verificar Email de Envio (3 minutos)

1. No SendGrid, vá em: **Settings** → **Sender Authentication**
2. Clique em **Get Started** na seção **Single Sender Verification**
3. Clique em **Create New Sender**
4. Preencha o formulário:
   ```
   From Name: Sweet Bar Chocolates
   From Email Address: noreply@sweetbarchocolates.com.br
   Reply To: contato@sweetbarchocolates.com.br
   
   Company Address: Rua Exemplo, 123
   City: Florianópolis
   State: Santa Catarina
   Zip Code: 88000-000
   Country: Brazil
   ```
5. Clique em **Create**
6. **Verifique o email** recebido em `noreply@sweetbarchocolates.com.br`
7. Clique no link de verificação

### Passo 4: Configurar no AWS (1 minuto)

Execute o script de configuração:

```powershell
cd "D:\Natal Menu Page\aws"
.\setup-sendgrid.ps1
```

O script vai:
- ✅ Solicitar sua API Key
- ✅ Adicionar ao AWS Secrets Manager
- ✅ Instalar dependências
- ✅ Configurar tudo automaticamente

### Passo 5: Deploy (2 minutos)

```powershell
cd "D:\Natal Menu Page\aws"
sam build --parallel
sam deploy --stack-name natal-menu-backend-v2 --capabilities CAPABILITY_IAM --region us-east-1 --resolve-s3 --no-confirm-changeset
```

### Passo 6: Testar (1 minuto)

Faça um novo pedido e pague. O email deve chegar em **menos de 10 segundos**!

## 📊 Comparação de Custos

| Provedor | Plano Grátis | Custo Adicional | Aprovação |
|----------|--------------|-----------------|-----------|
| **SendGrid** | 100 emails/dia | $0.0001/email | ❌ Não precisa |
| AWS SES | 62.000/mês* | $0.0001/email | ✅ Precisa (dias) |

*Só após aprovação

## 🔧 Configuração Técnica

### Variáveis de Ambiente (template.yaml)

```yaml
Environment:
  Variables:
    EMAIL_PROVIDER: sendgrid  # 'sendgrid' ou 'ses'
    SENDGRID_FROM_EMAIL: noreply@sweetbarchocolates.com.br
    SENDGRID_FROM_NAME: Sweet Bar Chocolates
```

### Secrets Manager

```json
{
  "access_token": "seu_token_mercadopago",
  "sendgrid_api_key": "SG.xxxxxxxxxxxxxxxx"
}
```

## 🎨 Features SendGrid

- ✅ **Templates Visuais:** Criar emails sem código
- ✅ **Analytics:** Ver taxas de abertura e cliques
- ✅ **A/B Testing:** Testar diferentes assuntos
- ✅ **Scheduled Sends:** Agendar envios
- ✅ **Unsubscribe Management:** Gerenciar descadastros
- ✅ **Bounce Handling:** Tratamento automático de bounces

## 🔄 Rollback para SES

Se quiser voltar para SES depois:

```powershell
# Atualizar variável de ambiente
aws lambda update-function-configuration \
  --function-name natal-menu-backend-v2-SendConfirmationFunction-XXX \
  --environment "Variables={EMAIL_PROVIDER=ses,...}"
```

## 📝 Logs e Monitoramento

```powershell
# Ver logs de envio
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction-XXX --follow

# Ver no SendGrid Dashboard
# https://app.sendgrid.com/email_activity
```

## ⚡ Status Atual

- ✅ Código implementado
- ⏳ Aguardando API Key do SendGrid
- ⏳ Aguardando deploy

---

**Tempo total de configuração: ~15 minutos**  
**Implementado por:** Engenharia Sweet Bar  
**Data:** 08/11/2024

