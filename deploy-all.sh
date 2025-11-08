#!/bin/bash
# Script de Deploy Completo - Sweet Bar

set -e

echo "🚀 Iniciando deploy completo..."
echo ""

# Deploy App Principal
echo "📱 1/2 - Deployando aplicação principal..."
npm run build
aws s3 sync dist/ s3://natal-menu-683373797860/ --delete --region us-east-1
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"
echo "✅ App principal deployado!"
echo ""

# Deploy Admin
echo "👨‍💼 2/2 - Deployando painel admin..."
aws s3 cp admin.html s3://admin-sweetbar-683373797860/ --region us-east-1
aws cloudfront create-invalidation --distribution-id EOK8HGF3GINRD --paths "/*"
echo "✅ Admin deployado!"
echo ""

echo "🎉 Deploy completo finalizado!"
echo ""
echo "📍 URLs:"
echo "   App:   https://menunatal.sweetbarchocolates.com.br"
echo "   Admin: https://admin.sweetbarchocolates.com.br"
echo ""
echo "⏳ Aguarde 2-5 minutos para o cache ser invalidado."
