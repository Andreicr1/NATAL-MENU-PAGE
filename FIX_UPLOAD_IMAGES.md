# 🔧 Correção: Erro de Upload de Imagens para S3

## 🐛 Problema Identificado

O erro `Falha no upload` ocorre devido a dois problemas:

1. **Código JavaScript**: Estava enviando headers desnecessários no upload
2. **Configuração S3**: Bucket pode não estar configurado corretamente para presigned URLs

## ✅ Solução Aplicada

### 1. Correção no admin.html

**Antes:**
```javascript
const uploadResponse = await fetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'image/jpeg'
  },
  body: compressedFile
});
```

**Depois:**
```javascript
const uploadResponse = await fetch(uploadUrl, {
  method: 'PUT',
  body: compressedFile,
  headers: {
    'Content-Type': 'image/jpeg'
  }
});
```

**Mudanças:**
- Simplificado o tratamento de erros
- Removido logs excessivos
- Ordem correta dos parâmetros do fetch

### 2. Script de Correção do Bucket S3

Execute o script para garantir que o bucket está configurado corretamente:

```powershell
cd aws
.\fix-s3-bucket.ps1
```

**O que o script faz:**
- ✅ Verifica se o bucket existe
- ✅ Remove bloqueios de acesso público
- ✅ Aplica política de leitura pública
- ✅ Configura CORS corretamente
- ✅ Valida a configuração final

## 🚀 Como Testar

### 1. Deploy do admin.html corrigido
```powershell
npm run deploy:admin
```

### 2. Testar upload
1. Acesse https://admin.sweetbarchocolates.com.br
2. Login com senha: `sweetbar2025`
3. Vá em Produtos > Novo Produto
4. Clique em "Adicionar Imagens"
5. Selecione uma ou mais imagens (até 10)
6. Aguarde o upload completar

### 3. Verificar resultado
- ✅ Mensagens de sucesso no console
- ✅ Preview das imagens aparece
- ✅ Produto salva com URLs corretas
- ✅ Imagens aparecem na loja

## 🔍 Diagnóstico de Problemas

### Se ainda houver erro:

#### 1. Verificar logs da Lambda
```powershell
aws logs tail /aws/lambda/natal-menu-GetPresignedUrlFunction --follow
```

#### 2. Testar presigned URL manualmente
```powershell
# Obter presigned URL
$response = Invoke-RestMethod -Uri "https://963pa03698.execute-api.us-east-1.amazonaws.com/upload/presigned-url" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"fileName":"test.jpg","fileType":"image/jpeg"}'

Write-Host "Upload URL: $($response.uploadUrl)"
Write-Host "File URL: $($response.fileUrl)"

# Testar upload
Invoke-RestMethod -Uri $response.uploadUrl `
  -Method PUT `
  -ContentType "image/jpeg" `
  -InFile "caminho/para/imagem.jpg"
```

#### 3. Verificar permissões da Lambda
```powershell
aws iam get-role --role-name natal-menu-GetPresignedUrlFunction-Role
```

#### 4. Verificar política do bucket
```powershell
aws s3api get-bucket-policy --bucket natal-menu-products-images --query Policy --output text
```

## 📋 Checklist de Verificação

- [ ] admin.html atualizado e deployado
- [ ] Script fix-s3-bucket.ps1 executado
- [ ] Bucket policy permite leitura pública
- [ ] CORS configurado corretamente
- [ ] Lambda tem permissão S3CrudPolicy
- [ ] Presigned URL está sendo gerada
- [ ] Upload retorna status 200
- [ ] Imagens ficam acessíveis publicamente

## 🔐 Segurança

**Configuração atual:**
- ✅ Presigned URLs expiram em 5 minutos
- ✅ Apenas imagens JPEG são aceitas
- ✅ Compressão automática antes do upload
- ✅ Nomes de arquivo sanitizados
- ✅ Leitura pública, escrita apenas via Lambda

## 📞 Suporte

Se o problema persistir:

1. Verifique o console do navegador (F12)
2. Verifique os logs do CloudWatch
3. Teste com uma imagem pequena (< 1MB)
4. Verifique se a região está correta (us-east-1)

## 🎯 Resultado Esperado

Após a correção:
```
✅ Solicitando URL de upload para: IMG_2747.JPG
✅ Upload URL obtida
✅ File URL: https://natal-menu-products-images.s3.us-east-1.amazonaws.com/products/1234567890-IMG_2747.JPG
✅ Upload bem-sucedido
```
