@echo off
REM Script para backup automático do DynamoDB (Windows)

set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_BUCKET=natal-menu-backups

echo Iniciando backup do DynamoDB...

REM Criar bucket de backup se não existir
aws s3 mb s3://%BACKUP_BUCKET% 2>nul

REM Backup das tabelas
for %%T in (natal-products natal-orders natal-inventory) do (
  echo Backup da tabela: %%T
  
  REM Criar backup point-in-time
  aws dynamodb create-backup --table-name %%T --backup-name %%T-backup-%TIMESTAMP%
  
  REM Export para S3
  aws dynamodb scan --table-name %%T --output json > %%T-%TIMESTAMP%.json
  aws s3 cp %%T-%TIMESTAMP%.json s3://%BACKUP_BUCKET%/dynamodb/%%T/%TIMESTAMP%.json
  del %%T-%TIMESTAMP%.json
  
  echo Backup de %%T concluido
)

echo Backup completo!
