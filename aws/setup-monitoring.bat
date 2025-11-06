@echo off
REM Configurar alarmes do CloudWatch

echo Configurando monitoramento AWS...

REM Alarme para erros na Lambda
aws cloudwatch put-metric-alarm ^
  --alarm-name natal-lambda-errors ^
  --alarm-description "Alerta quando Lambda tem muitos erros" ^
  --metric-name Errors ^
  --namespace AWS/Lambda ^
  --statistic Sum ^
  --period 300 ^
  --threshold 5 ^
  --comparison-operator GreaterThanThreshold ^
  --evaluation-periods 1

REM Alarme para throttling na API Gateway
aws cloudwatch put-metric-alarm ^
  --alarm-name natal-api-throttle ^
  --alarm-description "Alerta quando API Gateway está throttling" ^
  --metric-name Count ^
  --namespace AWS/ApiGateway ^
  --statistic Sum ^
  --period 60 ^
  --threshold 10 ^
  --comparison-operator GreaterThanThreshold ^
  --evaluation-periods 2

REM Alarme para erros 5xx no CloudFront
aws cloudwatch put-metric-alarm ^
  --alarm-name natal-cloudfront-5xx ^
  --alarm-description "Alerta para erros 5xx no CloudFront" ^
  --metric-name 5xxErrorRate ^
  --namespace AWS/CloudFront ^
  --statistic Average ^
  --period 300 ^
  --threshold 5 ^
  --comparison-operator GreaterThanThreshold ^
  --evaluation-periods 1

REM Dashboard do CloudWatch
aws cloudwatch put-dashboard ^
  --dashboard-name natal-menu-dashboard ^
  --dashboard-body file://monitoring-dashboard.json

echo Monitoramento configurado!
echo Acesse: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=natal-menu-dashboard
