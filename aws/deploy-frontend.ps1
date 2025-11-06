$STACK_NAME = "natal-menu-frontend"
$REGION = "us-east-1"

Write-Host "Deploying frontend infrastructure..." -ForegroundColor Yellow

aws cloudformation deploy `
  --template-file frontend-stack.yaml `
  --stack-name $STACK_NAME `
  --region $REGION

Write-Host ""
Write-Host "Getting outputs..." -ForegroundColor Yellow

$BUCKET = aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' `
  --output text `
  --region $REGION

$CLOUDFRONT_URL = aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' `
  --output text `
  --region $REGION

$DISTRIBUTION_ID = aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' `
  --output text `
  --region $REGION

Write-Host ""
Write-Host "✅ Frontend Infrastructure Created!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 S3 Bucket: $BUCKET" -ForegroundColor Cyan
Write-Host "🌐 CloudFront URL: https://$CLOUDFRONT_URL" -ForegroundColor Cyan
Write-Host "🆔 Distribution ID: $DISTRIBUTION_ID" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Build frontend: npm run build"
Write-Host "2. Upload: npm run aws:upload"
Write-Host ""
Write-Host "Use this URL in Mercado Pago: https://$CLOUDFRONT_URL" -ForegroundColor Green
