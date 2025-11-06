#!/bin/bash
# Script para backup automático do DynamoDB

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_BUCKET="natal-menu-backups"

echo "🔄 Iniciando backup do DynamoDB..."

# Criar bucket de backup se não existir
aws s3 mb s3://$BACKUP_BUCKET 2>/dev/null || true

# Backup das tabelas
TABLES=("natal-products" "natal-orders" "natal-inventory")

for TABLE in "${TABLES[@]}"; do
  echo "📦 Backup da tabela: $TABLE"
  
  # Criar backup point-in-time
  aws dynamodb create-backup \
    --table-name $TABLE \
    --backup-name "${TABLE}-backup-${TIMESTAMP}"
  
  # Export para S3 (opcional)
  aws dynamodb scan \
    --table-name $TABLE \
    --output json > "${TABLE}-${TIMESTAMP}.json"
  
  aws s3 cp "${TABLE}-${TIMESTAMP}.json" \
    "s3://${BACKUP_BUCKET}/dynamodb/${TABLE}/${TIMESTAMP}.json"
  
  rm "${TABLE}-${TIMESTAMP}.json"
  
  echo "✅ Backup de $TABLE concluído"
done

echo "🎉 Backup completo!"
