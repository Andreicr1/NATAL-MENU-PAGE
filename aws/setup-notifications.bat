@echo off
REM Setup de Notificações - Sweet Bar E-commerce (Windows)
REM Automatiza configuração de SES, Twilio e deploy

echo.
echo ========================================
echo Sweet Bar - Setup de Notificacoes
echo ========================================
echo.

set AWS_REGION=us-east-1
set DOMAIN=sweetbarchocolates.com.br

REM Validar AWS CLI
where aws >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] AWS CLI nao encontrado
    echo Instale: https://aws.amazon.com/cli/
    exit /b 1
)

REM Validar SAM CLI
where sam >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] SAM CLI nao encontrado
    echo Instale: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
    exit /b 1
)

echo [OK] Dependencias verificadas
echo.

echo Escolha uma opcao:
echo 1. Setup completo (SES + Twilio + Deploy)
echo 2. Apenas SES (E-mail)
echo 3. Apenas Twilio (WhatsApp)
echo 4. Apenas Deploy
echo 5. Testar notificacoes
echo.
set /p choice="Digite o numero da opcao: "

if "%choice%"=="1" goto SETUP_COMPLETO
if "%choice%"=="2" goto SETUP_SES
if "%choice%"=="3" goto SETUP_TWILIO
if "%choice%"=="4" goto DEPLOY
if "%choice%"=="5" goto TESTE
goto INVALIDO

:SETUP_COMPLETO
echo.
echo [Setup Completo Iniciado]
echo.

echo Configurando Amazon SES...
set /p verified="Ja verificou o dominio %DOMAIN% no SES? (s/n): "
if not "%verified%"=="s" (
    aws ses verify-domain-identity --domain %DOMAIN% --region %AWS_REGION%
    echo.
    echo [ATENCAO] Adicione os registros DNS fornecidos no seu provedor
    pause
)

aws ses verify-email-identity --email-address noreply@%DOMAIN% --region %AWS_REGION% 2>nul
aws ses verify-email-identity --email-address contato@%DOMAIN% --region %AWS_REGION% 2>nul
echo [OK] SES configurado
echo.

echo Configurando Twilio...
echo.
echo Acesse: https://www.twilio.com/console
echo.
set /p TWILIO_SID="Account SID: "
set /p TWILIO_TOKEN="Auth Token: "
set /p TWILIO_NUMBER="WhatsApp Number (ex: whatsapp:+14155238886): "

echo Criando secret no AWS...
aws secretsmanager create-secret --name natal-menu/twilio --secret-string "{\"account_sid\":\"%TWILIO_SID%\",\"auth_token\":\"%TWILIO_TOKEN%\",\"whatsapp_number\":\"%TWILIO_NUMBER%\"}" --region %AWS_REGION% 2>nul || aws secretsmanager update-secret --secret-id natal-menu/twilio --secret-string "{\"account_sid\":\"%TWILIO_SID%\",\"auth_token\":\"%TWILIO_TOKEN%\",\"whatsapp_number\":\"%TWILIO_NUMBER%\"}" --region %AWS_REGION%

echo [OK] Twilio configurado
echo.

goto DEPLOY

:SETUP_SES
echo Configurando SES...
aws ses verify-domain-identity --domain %DOMAIN% --region %AWS_REGION%
aws ses verify-email-identity --email-address noreply@%DOMAIN% --region %AWS_REGION%
aws ses verify-email-identity --email-address contato@%DOMAIN% --region %AWS_REGION%
echo [OK] SES configurado
goto FIM

:SETUP_TWILIO
echo Configurando Twilio...
set /p TWILIO_SID="Account SID: "
set /p TWILIO_TOKEN="Auth Token: "
set /p TWILIO_NUMBER="WhatsApp Number: "

aws secretsmanager create-secret --name natal-menu/twilio --secret-string "{\"account_sid\":\"%TWILIO_SID%\",\"auth_token\":\"%TWILIO_TOKEN%\",\"whatsapp_number\":\"%TWILIO_NUMBER%\"}" --region %AWS_REGION% 2>nul || aws secretsmanager update-secret --secret-id natal-menu/twilio --secret-string "{\"account_sid\":\"%TWILIO_SID%\",\"auth_token\":\"%TWILIO_TOKEN%\",\"whatsapp_number\":\"%TWILIO_NUMBER%\"}" --region %AWS_REGION%

echo [OK] Twilio configurado
goto FIM

:DEPLOY
echo.
echo Instalando dependencias...
cd lambda\notifications
call npm install
cd ..\payments
call npm install @aws-sdk/client-lambda
cd ..\..

echo.
echo Building...
call sam build

echo.
echo Deploying...
call sam deploy --stack-name natal-menu-backend-v2 --capabilities CAPABILITY_IAM --region %AWS_REGION% --no-confirm-changeset

echo.
echo [OK] Deploy concluido!
goto FIM

:TESTE
echo Testando notificacoes...
set /p ORDER_ID="Order ID para testar: "

aws lambda invoke --function-name natal-menu-backend-v2-SendConfirmationFunction --payload "{\"orderId\":\"%ORDER_ID%\"}" --region %AWS_REGION% response.json

echo.
echo Resposta:
type response.json
echo.

echo.
echo Logs:
aws logs tail /aws/lambda/natal-menu-backend-v2-SendConfirmationFunction --since 5m --region %AWS_REGION%
goto FIM

:INVALIDO
echo [ERRO] Opcao invalida
exit /b 1

:FIM
echo.
echo ========================================
echo Setup Concluido com Sucesso!
echo ========================================
echo.
echo Leia mais: aws\NOTIFICATIONS_SETUP.md
echo.
pause
