# Configuração do Supabase

Este projeto utiliza Supabase para backend e armazenamento de dados.

## 📋 Pré-requisitos

1. **Instalar Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Criar projeto no Supabase:**
   - Acesse [supabase.com](https://supabase.com)
   - Crie uma nova conta ou faça login
   - Crie um novo projeto

## 🔧 Configuração Local

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Copie e configure com suas chaves do Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_APP_ENV=development
```

**Como obter as chaves:**
1. No dashboard do Supabase, vá para **Settings > API**
2. Copie o **Project URL** para `VITE_SUPABASE_URL`
3. Copie o **anon public** key para `VITE_SUPABASE_ANON_KEY`
4. Copie o **service_role** key para `SUPABASE_SERVICE_ROLE_KEY`

### 2. Inicializar Supabase Local

```bash
# Inicializar projeto local
supabase init

# Iniciar serviços locais
supabase start

# Aplicar migrações (se houver)
supabase db reset
```

### 3. Deploy das Edge Functions

```bash
# Fazer deploy da função
supabase functions deploy make-server-c42493b2
```

## 🚀 Deploy no Supabase

### 1. Configurar Secrets no Supabase

No dashboard do Supabase, vá para **Edge Functions > Secrets** e adicione:

- `SUPABASE_URL`: URL do seu projeto
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key

### 2. Fazer Deploy da Função

```bash
supabase functions deploy make-server-c42493b2 --project-ref your-project-ref
```

## 📁 Estrutura do Projeto

```
supabase/
├── config.toml          # Configuração do Supabase
└── functions/
    └── server/
        ├── index.tsx   # Edge Function principal
        └── kv_store.tsx # Utilitários de armazenamento
```

## 🔗 Endpoints da API

A Edge Function cria os seguintes endpoints:

- `GET /health` - Verificação de saúde
- `GET /products/:categoryId` - Buscar produtos por categoria
- `POST /products/:categoryId` - Atualizar produtos
- `PUT /product/:categoryId/:productId` - Atualizar produto específico
- `DELETE /product/:categoryId/:productId` - Deletar produto
- `POST /init-products` - Inicializar produtos
- `POST /upload-image` - Upload de imagens

## 🛠️ Desenvolvimento

Para desenvolvimento local:

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Iniciar Supabase local
supabase start

# Ver logs das funções
supabase functions logs
```

## 🔒 Segurança

- Nunca commite arquivos `.env*` no repositório
- Use apenas a chave `anon` no frontend
- Use a chave `service_role` apenas nas Edge Functions
- Configure CORS adequadamente para produção

## 📞 Suporte

Para mais informações, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Supabase CLI](https://supabase.com/docs/guides/cli)
