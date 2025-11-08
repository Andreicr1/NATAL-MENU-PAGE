#!/bin/bash
# Script de Deploy - Painel Administrativo Sweet Bar

set -e

echo "🚀 Iniciando deploy do painel admin..."

# Upload para S3
echo "☁️  Enviando admin.html para S3..."
aws s3 cp admin.html s3://admin-sweetbar-683373797860/ --region us-east-1

# Invalidar cache CloudFront
echo "🔄 Invalidando cache do CloudFront..."
aws cloudfront create-invalidation --distribution-id EOK8HGF3GINRD --paths "/*"

echo "✅ Deploy do admin concluído!"
echo "🌐 URL: https://admin.sweetbarchocolates.com.br"
echo "🔑 Senha: sweetbar2025"
echo "⏳ Aguarde 2-5 minutos para o cache ser invalidado."
