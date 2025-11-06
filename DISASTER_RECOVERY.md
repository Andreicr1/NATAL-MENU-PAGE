# 🚨 Plano de Recuperação de Desastres

## Cenários e Soluções

### 1. Site Fora do Ar

**Diagnóstico:**
```bash
# Verificar status do CloudFront
aws cloudfront get-distribution --id E3VP7VX4XVPPIO --query "Distribution.Status"

# Verificar S3
aws s3 ls s3://natal-menu-683373797860/
```

**Solução:**
```bash
# Redeploy rápido
.\deploy-frontend.bat
```

### 2. Perda de Dados no DynamoDB

**Restaurar de backup:**
```bash
# Listar backups disponíveis
aws dynamodb list-backups --table-name natal-products

# Restaurar backup
aws dynamodb restore-table-from-backup ^
  --target-table-name natal-products ^
  --backup-arn arn:aws:dynamodb:us-east-1:xxx:table/natal-products/backup/xxx
```

**Restaurar de S3:**
```bash
# Download do backup
aws s3 cp s3://natal-menu-backups/dynamodb/natal-products/latest.json ./backup.json

# Importar dados (script necessário)
node restore-dynamodb.js backup.json natal-products
```

### 3. Imagens de Produtos Perdidas

**Verificar bucket:**
```bash
aws s3 ls s3://natal-menu-products-images/ --recursive
```

**Restaurar de backup (se configurado):**
```bash
# Habilitar versionamento (prevenção)
aws s3api put-bucket-versioning ^
  --bucket natal-menu-products-images ^
  --versioning-configuration Status=Enabled

# Restaurar versão anterior
aws s3api list-object-versions --bucket natal-menu-products-images
aws s3api copy-object --copy-source natal-menu-products-images/file.jpg?versionId=xxx
```

### 4. API Gateway Não Responde

**Diagnóstico:**
```bash
# Testar endpoint
curl https://963pa03698.execute-api.us-east-1.amazonaws.com/products/advent

# Verificar logs
aws logs tail /aws/lambda/natal-menu-backend-v2-GetProductsFunction --follow
```

**Solução:**
- Verificar throttling no API Gateway
- Verificar limites de Lambda
- Verificar DynamoDB capacity

### 5. CloudFront Cache Corrompido

**Solução:**
```bash
# Invalidar todo o cache
aws cloudfront create-invalidation --distribution-id E3VP7VX4XVPPIO --paths "/*"

# Aguardar 2-5 minutos
```

## Contatos de Emergência

- **AWS Support**: https://console.aws.amazon.com/support/
- **Status AWS**: https://status.aws.amazon.com/

## Backups Automáticos

### Configurar backup diário:
```bash
# Windows Task Scheduler
schtasks /create /tn "DynamoDB Backup" /tr "D:\Natal Menu Page\aws\backup-dynamodb.bat" /sc daily /st 03:00
```

### Verificar backups:
```bash
aws dynamodb list-backups --table-name natal-products
aws s3 ls s3://natal-menu-backups/dynamodb/ --recursive
```

## Checklist de Recuperação

- [ ] Identificar o problema
- [ ] Verificar logs do CloudWatch
- [ ] Testar endpoints da API
- [ ] Verificar status dos serviços AWS
- [ ] Restaurar de backup se necessário
- [ ] Validar funcionamento
- [ ] Documentar incidente
- [ ] Implementar prevenção

## Prevenção

1. **Backups diários automáticos** ✅
2. **Versionamento de S3** (configurar)
3. **Alarmes do CloudWatch** ✅
4. **Testes regulares de restore**
5. **Documentação atualizada** ✅

## Tempo de Recuperação (RTO)

- Site fora do ar: **5-10 minutos**
- Perda de dados: **30-60 minutos**
- Imagens perdidas: **15-30 minutos**
- API Gateway: **5-15 minutos**

## Ponto de Recuperação (RPO)

- DynamoDB: **24 horas** (backup diário)
- Imagens: **Sem backup** (implementar versionamento)
- Código: **Tempo real** (GitHub)
