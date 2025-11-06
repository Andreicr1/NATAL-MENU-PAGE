# Script de Deploy Otimizado com Validações
$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploy Otimizado - Natal Menu" -ForegroundColor Cyan
Write-Host ""

# Configurações
$STACK_NAME = "natal-menu-frontend"
$BACKEND_STACK = "natal-menu-backend-v2"
$REGION = "us-east-1"
$BUCKET = "natal-menu-683373797860"
$DISTRIBUTION_ID = "E3VP7VX4XVPPIO"

# Função para verificar se comando existe
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

# Validar dependências
Write-Host "📋 Validando dependências..." -ForegroundColor Yellow
if (-not (Test-Command "aws")) {
    Write-Host "❌ AWS CLI não encontrado. Instale: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm não encontrado. Instale Node.js: https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências OK" -ForegroundColor Green
Write-Host ""

# Menu de opções
Write-Host "Escolha o que deseja fazer:" -ForegroundColor Cyan
Write-Host "1. Deploy completo (Backend + Frontend)"
Write-Host "2. Deploy apenas Backend (Lambda)"
Write-Host "3. Deploy apenas Frontend (S3 + CloudFront)"
Write-Host "4. Apenas build do Frontend"
Write-Host "5. Invalidar cache do CloudFront"
Write-Host ""
$choice = Read-Host "Digite o número da opção"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔧 Deploy Completo Iniciado" -ForegroundColor Cyan
        
        # Backend
        Write-Host ""
        Write-Host "📦 1/4 - Atualizando Backend (Lambda)..." -ForegroundColor Yellow
        cd aws
        sam build --use-container
        sam deploy --no-confirm-changeset --region $REGION
        cd ..
        Write-Host "✅ Backend atualizado" -ForegroundColor Green
        
        # Frontend Build
        Write-Host ""
        Write-Host "🏗️ 2/4 - Build do Frontend..." -ForegroundColor Yellow
        npm run build
        Write-Host "✅ Build concluído" -ForegroundColor Green
        
        # Upload S3
        Write-Host ""
        Write-Host "☁️ 3/4 - Upload para S3..." -ForegroundColor Yellow
        aws s3 sync dist/ s3://$BUCKET/ --delete --cache-control "public,max-age=31536000,immutable" --exclude "*.html"
        aws s3 sync dist/ s3://$BUCKET/ --exclude "*" --include "*.html" --cache-control "public,max-age=300"
        Write-Host "✅ Upload concluído" -ForegroundColor Green
        
        # Invalidação CloudFront
        Write-Host ""
        Write-Host "🔄 4/4 - Invalidando cache do CloudFront..." -ForegroundColor Yellow
        $invalidation = aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --query 'Invalidation.Id' --output text
        Write-Host "✅ Invalidação criada: $invalidation" -ForegroundColor Green
        Write-Host "⏳ Aguarde 2-5 minutos para propagação completa" -ForegroundColor Yellow
    }
    
    "2" {
        Write-Host ""
        Write-Host "📦 Deploy Backend (Lambda)" -ForegroundColor Cyan
        cd aws
        sam build --use-container
        sam deploy --no-confirm-changeset --region $REGION
        cd ..
        Write-Host "✅ Backend atualizado" -ForegroundColor Green
    }
    
    "3" {
        Write-Host ""
        Write-Host "🌐 Deploy Frontend" -ForegroundColor Cyan
        
        # Build
        Write-Host ""
        Write-Host "🏗️ 1/3 - Build..." -ForegroundColor Yellow
        npm run build
        Write-Host "✅ Build concluído" -ForegroundColor Green
        
        # Upload
        Write-Host ""
        Write-Host "☁️ 2/3 - Upload para S3..." -ForegroundColor Yellow
        aws s3 sync dist/ s3://$BUCKET/ --delete --cache-control "public,max-age=31536000,immutable" --exclude "*.html"
        aws s3 sync dist/ s3://$BUCKET/ --exclude "*" --include "*.html" --cache-control "public,max-age=300"
        Write-Host "✅ Upload concluído" -ForegroundColor Green
        
        # Invalidação
        Write-Host ""
        Write-Host "🔄 3/3 - Invalidando cache..." -ForegroundColor Yellow
        $invalidation = aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --query 'Invalidation.Id' --output text
        Write-Host "✅ Invalidação criada: $invalidation" -ForegroundColor Green
    }
    
    "4" {
        Write-Host ""
        Write-Host "🏗️ Build do Frontend" -ForegroundColor Cyan
        npm run build
        Write-Host "✅ Build concluído em: dist/" -ForegroundColor Green
    }
    
    "5" {
        Write-Host ""
        Write-Host "🔄 Invalidando cache do CloudFront..." -ForegroundColor Yellow
        $invalidation = aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --query 'Invalidation.Id' --output text
        Write-Host "✅ Invalidação criada: $invalidation" -ForegroundColor Green
        Write-Host "⏳ Aguarde 2-5 minutos para propagação" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Deploy Concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Site: https://d3c3no9shu6bly.cloudfront.net" -ForegroundColor Cyan
Write-Host "📊 Métricas: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=natal-menu-dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Yellow
Write-Host "  - Teste em modo anônimo para ver mudanças sem cache local"
Write-Host "  - Use Lighthouse para medir performance"
Write-Host "  - Monitore CloudWatch para erros"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
