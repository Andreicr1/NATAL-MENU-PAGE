#!/bin/bash
# Script de Deploy - Aplicação Principal Sweet Bar

set -e

echo "🚀 Iniciando deploy da aplicação principal..."

# Build
echo "📦 Fazendo build..."
npm run build

# Upload para S3
echo "☁️  Sincronizando com S3..."
aws s3 sync dist/ s3://natal-menu-683373797860/ --delete --region us-east-1

# Invalidar cache CloudFront
echo "🔄 Invalidando cache do CloudFront..."
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"

echo "✅ Deploy da aplicação concluído!"
echo "🌐 URL: https://menunatal.sweetbarchocolates.com.br"
echo "⏳ Aguarde 2-5 minutos para o cache ser invalidado."
