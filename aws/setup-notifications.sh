#!/bin/bash
# Setup de Notificações - Sweet Bar E-commerce
# Automatiza configuração de SES, Twilio e deploy

set -e

echo "🚀 Sweet Bar - Setup de Notificações"
echo "====================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Região AWS
AWS_REGION="us-east-1"
DOMAIN="sweetbarchocolates.com.br"

# Função auxiliar
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 não encontrado. Instale antes de continuar.${NC}"
        exit 1
    fi
}

# Validar dependências
echo "📋 Verificando dependências..."
check_command "aws"
check_command "npm"
check_command "sam"
echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

# Menu principal
echo "Escolha uma opção:"
echo "1. Setup completo (SES + Twilio + Deploy)"
echo "2. Apenas SES (E-mail)"
echo "3. Apenas Twilio (WhatsApp)"
echo "4. Apenas Deploy"
echo "5. Testar notificações"
echo ""
read -p "Digite o número da opção: " choice

case $choice in
  1)
    echo -e "${YELLOW}🔧 Setup Completo Iniciado${NC}"

    # SES
    echo ""
    echo "📧 Configurando Amazon SES..."

    read -p "Já verificou o domínio ${DOMAIN} no SES? (s/n): " verified
    if [ "$verified" != "s" ]; then
      echo "Verificando domínio..."
      aws ses verify-domain-identity --domain $DOMAIN --region $AWS_REGION
      echo -e "${YELLOW}⚠️  Adicione os registros DNS fornecidos no seu provedor${NC}"
      echo "   Aguarde verificação antes de continuar..."
      read -p "Pressione ENTER quando o domínio estiver verificado"
    fi

    echo "Verificando e-mails..."
    aws ses verify-email-identity --email-address noreply@${DOMAIN} --region $AWS_REGION || true
    aws ses verify-email-identity --email-address contato@${DOMAIN} --region $AWS_REGION || true
    echo -e "${GREEN}✅ SES configurado${NC}"

    # Twilio
    echo ""
    echo "📱 Configurando Twilio..."
    echo ""
    echo "Acesse: https://www.twilio.com/console"
    echo ""
    read -p "Account SID: " TWILIO_SID
    read -p "Auth Token: " TWILIO_TOKEN
    read -p "WhatsApp Number (ex: whatsapp:+14155238886): " TWILIO_NUMBER

    echo "Criando secret no AWS Secrets Manager..."
    aws secretsmanager create-secret \
      --name natal-menu/twilio \
      --secret-string "{\"account_sid\":\"$TWILIO_SID\",\"auth_token\":\"$TWILIO_TOKEN\",\"whatsapp_number\":\"$TWILIO_NUMBER\"}" \
      --region $AWS_REGION || \
    aws secretsmanager update-secret \
      --secret-id natal-menu/twilio \
      --secret-string "{\"account_sid\":\"$TWILIO_SID\",\"auth_token\":\"$TWILIO_TOKEN\",\"whatsapp_number\":\"$TWILIO_NUMBER\"}" \
      --region $AWS_REGION

    echo -e "${GREEN}✅ Twilio configurado${NC}"

    # Deploy
    echo ""
    echo "🚀 Instalando dependências..."
    cd lambda/notifications
    npm install
    cd ../payments
    npm install @aws-sdk/client-lambda
    cd ../..

    echo ""
    echo "🏗️  Building..."
    sam build

    echo ""
    echo "☁️  Deploying..."
    sam deploy \
      --stack-name natal-menu-backend-v2 \
      --capabilities CAPABILITY_IAM \
      --region $AWS_REGION \
      --no-confirm-changeset

    echo -e "${GREEN}✅ Deploy concluído!${NC}"
    ;;

  2)
    echo "📧 Configurando apenas SES..."
    aws ses verify-domain-identity --domain $DOMAIN --region $AWS_REGION
    aws ses verify-email-identity --email-address noreply@${DOMAIN} --region $AWS_REGION
    aws ses verify-email-identity --email-address contato@${DOMAIN} --region $AWS_REGION
    echo -e "${GREEN}✅ SES configurado${NC}"
    ;;

  3)
    echo "📱 Configurando apenas Twilio..."
    read -p "Account SID: " TWILIO_SID
    read -p "Auth Token: " TWILIO_TOKEN
    read -p "WhatsApp Number: " TWILIO_NUMBER

    aws secretsmanager create-secret \
      --name natal-menu/twilio \
      --secret-string "{\"account_sid\":\"$TWILIO_SID\",\"auth_token\":\"$TWILIO_TOKEN\",\"whatsapp_number\":\"$TWILIO_NUMBER\"}" \
      --region $AWS_REGION || \
    aws secretsmanager update-secret \
      --secret-id natal-menu/twilio \
      --secret-string "{\"account_sid\":\"$TWILIO_SID\",\"auth_token\":\"$TWILIO_TOKEN\",\"whatsapp_number\":\"$TWILIO_NUMBER\"}" \
      --region $AWS_REGION

    echo -e "${GREEN}✅ Twilio configurado${NC}"
    ;;

  4)
    echo "🚀 Deploy das funções..."
    cd lambda/notifications
    npm install
    cd ../payments
    npm install @aws-sdk/client-lambda
    cd ../..

    sam build
    sam deploy \
      --stack-name natal-menu-backend-v2 \
      --capabilities CAPABILITY_IAM \
      --region $AWS_REGION \
      --no-confirm-changeset

    echo -e "${GREEN}✅ Deploy concluído!${NC}"
    ;;

  5)
    echo "🧪 Testando notificações..."
    read -p "Order ID para testar: " ORDER_ID

    aws lambda invoke \
      --function-name natal-menu-backend-v2-SendConfirmationFunction \
      --payload "{\"orderId\":\"$ORDER_ID\"}" \
      --region $AWS_REGION \
      response.json

    echo ""
    echo "Resposta:"
    cat response.json
    echo ""

    echo "Logs (últimas 10 linhas):"
    aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction \
      --since 5m \
      --region $AWS_REGION | tail -10
    ;;

  *)
    echo -e "${RED}❌ Opção inválida${NC}"
    exit 1
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Setup Concluído com Sucesso!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Leia mais: aws/NOTIFICATIONS_SETUP.md"
echo ""
