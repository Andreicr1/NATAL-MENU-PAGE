# Setup SendGrid para Emails - Sweet Bar

## Por que SendGrid?

- ✅ **100 emails/dia GRÁTIS** (suficiente para começar)
- ✅ Configuração em **5 minutos**
- ✅ Sem aprovação necessária
- ✅ Melhor deliverability que SES
- ✅ Interface visual para templates
- ✅ Analytics incluído

## Passo 1: Criar Conta SendGrid

1. Acesse: https://signup.sendgrid.com/
2. Preencha:
   - Email: seu email
   - Password: senha forte
   - Empresa: Sweet Bar Chocolates
   - Website: sweetbarchocolates.com.br

3. Verificar email (checar caixa de entrada)

## Passo 2: Criar API Key

1. Após login, vá em: **Settings** → **API Keys**
2. Clique em **Create API Key**
3. Nome: `sweet-bar-production`
4. Tipo: **Full Access** (ou Restricted com permissão de Mail Send)
5. **COPIE A API KEY** (só aparece uma vez!)

Formato: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Passo 3: Verificar Email de Envio

### Opção A: Verificar Email Único (Mais Rápido)

1. Vá em: **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Clique em **Create New Sender**
3. Preencha:
   ```
   From Name: Sweet Bar Chocolates
   From Email: noreply@sweetbarchocolates.com.br
   Reply To: contato@sweetbarchocolates.com.br
   Company Address: Seu endereço
   City: Florianópolis
   State: SC
   Zip Code: 88000-000
   Country: Brazil
   ```
4. Verificar email recebido

### Opção B: Verificar Domínio Completo (Melhor para Produção)

1. Vá em: **Settings** → **Sender Authentication** → **Domain Authentication**
2. Siga o wizard para adicionar registros DNS
3. Aguarde propagação (15-30 minutos)

## Passo 4: Adicionar API Key no AWS Secrets Manager

```powershell
# Adicionar SendGrid API Key ao Secrets Manager
aws secretsmanager update-secret \
  --secret-id natal-menu/mercadopago \
  --secret-string '{
    "access_token": "SEU_TOKEN_MERCADOPAGO",
    "sendgrid_api_key": "SG.xxxxxxxxxxxxxxxx"
  }'
```

Ou criar um secret separado:

```powershell
aws secretsmanager create-secret \
  --name natal-menu/sendgrid \
  --description "SendGrid API Key para emails" \
  --secret-string '{
    "api_key": "SG.xxxxxxxxxxxxxxxx",
    "from_email": "noreply@sweetbarchocolates.com.br",
    "from_name": "Sweet Bar Chocolates"
  }'
```

## Passo 5: Atualizar Lambda

Já vou implementar o código para você!

## Custos SendGrid

| Plano | Emails/mês | Preço |
|-------|------------|-------|
| Free | 100/dia (3.000/mês) | R$ 0 |
| Essentials | 50.000/mês | $19.95/mês |
| Pro | 100.000/mês | $89.95/mês |

Para começar, o plano FREE é suficiente!

## Vantagens vs AWS SES

| Recurso | SendGrid | AWS SES |
|---------|----------|---------|
| Aprovação | ❌ Não precisa | ✅ Precisa (demora dias) |
| Setup | 5 minutos | 1-3 dias |
| Plano Grátis | 100/dia | 62.000/mês* |
| Interface | ✅ Excelente | ⚠️ Básica |
| Templates | ✅ Visual | ⚠️ Código |
| Analytics | ✅ Completo | ⚠️ Básico |

*SES grátis só após aprovação

## Próximos Passos

1. ✅ Criar conta SendGrid
2. ✅ Gerar API Key
3. ✅ Verificar email
4. ✅ Adicionar no Secrets Manager
5. ⏳ Eu implemento o código
6. ✅ Deploy e teste

---

**Me avise quando tiver a API Key do SendGrid que eu implemento tudo!** 🚀
