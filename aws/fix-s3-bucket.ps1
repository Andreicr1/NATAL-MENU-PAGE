# Script para corrigir configuracao do bucket S3 de imagens
# Garante que o bucket aceita uploads via presigned URL

$BUCKET = "natal-menu-products-images"
$REGION = "us-east-1"

Write-Host "Corrigindo configuracao do bucket S3: $BUCKET" -ForegroundColor Cyan

# 1. Verificar se o bucket existe
Write-Host "`n1. Verificando bucket..." -ForegroundColor Yellow
aws s3api head-bucket --bucket $BUCKET --region $REGION 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Bucket nao encontrado. Criando..." -ForegroundColor Red
    aws s3api create-bucket --bucket $BUCKET --region $REGION
}
Write-Host "OK - Bucket existe" -ForegroundColor Green

# 2. Remover Block Public Access
Write-Host "`n2. Configurando acesso publico..." -ForegroundColor Yellow
aws s3api put-public-access-block --bucket $BUCKET --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" --region $REGION
Write-Host "OK - Acesso publico configurado" -ForegroundColor Green

# 3. Aplicar politica do bucket
Write-Host "`n3. Aplicando politica do bucket..." -ForegroundColor Yellow
@'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::natal-menu-products-images/*"
    }
  ]
}
'@ | Out-File -FilePath "bucket-policy.json" -Encoding ASCII
aws s3api put-bucket-policy --bucket $BUCKET --policy file://bucket-policy.json --region $REGION
Remove-Item "bucket-policy.json"
Write-Host "OK - Politica aplicada" -ForegroundColor Green

# 4. Configurar CORS
Write-Host "`n4. Configurando CORS..." -ForegroundColor Yellow
@'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
'@ | Out-File -FilePath "cors-config.json" -Encoding ASCII
aws s3api put-bucket-cors --bucket $BUCKET --cors-configuration file://cors-config.json --region $REGION
Remove-Item "cors-config.json"
Write-Host "OK - CORS configurado" -ForegroundColor Green

Write-Host "`nOK - Configuracao do bucket concluida!" -ForegroundColor Green
Write-Host "Bucket URL: https://$BUCKET.s3.$REGION.amazonaws.com" -ForegroundColor Cyan
