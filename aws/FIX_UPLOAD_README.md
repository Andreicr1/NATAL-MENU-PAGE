# 🔧 Correção do Sistema de Upload de Produtos

Este documento descreve como corrigir o problema de upload de imagens no painel administrativo.

## 📋 Resumo do Problema

O sistema de upload de produtos não estava funcionando devido a:
1. **Bucket S3 incorreto**: O código estava usando buckets diferentes
2. **Configurações CORS ausentes**: O bucket não permitia uploads do navegador
3. **Permissões incorretas**: As imagens não eram públicas após o upload
4. **Variáveis de ambiente inconsistentes**: Lambda usando bucket diferente

## 🛠️ Correções Aplicadas

### 1. Padronização do Bucket S3
- Nome do bucket: `natal-menu-products-images`
- Configurado em todos os lugares:
  - `admin.html`
  - `aws/template.yaml`
  - `aws/lambda/upload/presigned-url.js`

### 2. Configuração CORS do S3
- Arquivo: `aws/cors-config.json`
- Permite origens do admin, frontend e localhost
- Métodos: GET, PUT, POST, DELETE, HEAD

### 3. Políticas de Acesso Público
- Bucket configurado para permitir leitura pública
- Imagens com ACL `public-read`
- Bloqueio de acesso público desativado

### 4. Melhorias no Código
- Logs detalhados no `admin.html` para debug
- Tratamento de erros melhorado
- Headers corretos nas requisições

## 🚀 Como Executar a Correção

### Passo 1: Configurar o S3
```powershell
# Executar o script de configuração do S3
.\aws\configure-s3-cors.ps1
```

### Passo 2: Deploy Completo
```powershell
# Executar o script de correção completo
.\aws\fix-product-upload.ps1
```

Este script irá:
1. Configurar CORS do bucket S3
2. Instalar dependências das Lambdas
3. Fazer build e deploy do backend
4. Atualizar o painel admin

### Passo 3: Testar o Upload
```powershell
# Abrir o arquivo de teste no navegador
start test-upload.html
```

Ou acesse diretamente: https://admin.sweetbarchocolates.com.br

## 🧪 Testando o Sistema

### Teste Manual com test-upload.html
1. Abra `test-upload.html` no navegador
2. Selecione uma imagem
3. Clique em "Testar Upload"
4. Verifique o console de debug

### Teste no Painel Admin
1. Acesse https://admin.sweetbarchocolates.com.br
2. Faça login com a senha: `sweetbar2025`
3. Clique em "Adicionar Novo Produto"
4. Preencha os dados e faça upload de uma imagem
5. Salve o produto

## ✅ Verificações

### 1. Verificar CORS do Bucket
```bash
aws s3api get-bucket-cors --bucket natal-menu-products-images
```

### 2. Verificar Política do Bucket
```bash
aws s3api get-bucket-policy --bucket natal-menu-products-images
```

### 3. Verificar Função Lambda
```bash
# Testar a função diretamente
aws lambda invoke \
  --function-name natal-menu-backend-GetPresignedUrlFunction-XXXXX \
  --payload '{"body": "{\"fileName\": \"test.jpg\", \"fileType\": \"image/jpeg\"}"}' \
  response.json
```

### 4. Verificar API Gateway
```bash
# Testar endpoint de presigned URL
curl -X POST https://963pa03698.execute-api.us-east-1.amazonaws.com/upload/presigned-url \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.jpg", "fileType": "image/jpeg"}'
```

## 🐛 Troubleshooting

### Erro: "Access Denied" no S3
- Verificar se o bucket existe
- Verificar políticas do bucket
- Confirmar que o CORS está configurado

### Erro: "Failed to get upload URL"
- Verificar se a Lambda tem as permissões corretas
- Confirmar que a variável S3_BUCKET está correta
- Verificar logs do CloudWatch

### Erro: "CORS policy"
- Executar novamente `configure-s3-cors.ps1`
- Limpar cache do navegador
- Verificar se a origem está na lista permitida

### Imagem não aparece após upload
- Verificar se o ACL está como `public-read`
- Confirmar que a política do bucket permite GetObject
- Testar acessar a URL diretamente

## 📊 Monitoramento

### CloudWatch Logs
```bash
# Ver logs da função de upload
aws logs tail /aws/lambda/natal-menu-backend-GetPresignedUrlFunction-XXXXX --follow
```

### Verificar Uploads Recentes
```bash
# Listar arquivos recentes no bucket
aws s3 ls s3://natal-menu-products-images/products/ --recursive | tail -20
```

## 🔐 Segurança

### Recomendações Futuras
1. **Autenticação JWT**: Substituir senha hardcoded por autenticação JWT
2. **CloudFront**: Servir imagens via CDN para melhor performance
3. **Validação de Imagens**: Validar tipo e tamanho no backend
4. **Rate Limiting**: Implementar limite de uploads por sessão
5. **Backup**: Configurar replicação do bucket S3

## 📞 Suporte

Se encontrar problemas após seguir este guia:
1. Verifique os logs do CloudWatch
2. Use o `test-upload.html` para debug detalhado
3. Confirme que todos os scripts foram executados com sucesso
4. Verifique as permissões IAM da sua conta AWS
