# Guia do Painel Administrativo - Sweet Bar Chocolates

## Acesso ao Painel de Administração

### 1. Autenticação
1. Na página principal (Landing Page), clique **uma vez** no título "Menu Especial de Natal 2025" (no header bordô)
2. Digite a senha quando solicitado: `sweetbar2025`
3. Após autenticação bem-sucedida, um painel administrativo aparecerá abaixo do header

## Funcionalidades do Backend

### Inicializar Backend
**Importante: Execute esta ação apenas uma vez ao começar a usar o sistema**

1. Após autenticar, clique em **"Inicializar Backend"**
2. Isso migrará todos os produtos atuais para o banco de dados
3. O sistema mudará automaticamente para "Modo: Backend ✓"

### Alternar entre Modo Backend e Estático
- **Modo Backend**: Produtos são carregados e gerenciados no banco de dados
- **Modo Estático**: Produtos usam dados fixos do código
- Clique em **"Modo: Backend ✓"** ou **"Modo: Estático"** para alternar

## Gerenciar Produtos

### Abrir Painel de Gerenciamento
1. Certifique-se de estar em "Modo: Backend"
2. Navegue para qualquer categoria (Calendário do Advento, Panetone, etc.)
3. Clique em **"Gerenciar Produtos"** no painel administrativo

### Editar Produtos
1. No painel lateral que abre, você verá todos os produtos da categoria
2. Clique no ícone de **lápis (Editar)** ao lado do produto desejado
3. Edite os campos:
   - **Nome do Produto**: Nome exibido
   - **Preço**: Formato visual (ex: R$ 99,90)
   - **Valor Numérico**: Valor usado para cálculos (auto-atualiza ao digitar o preço)
   - **Peso**: Informação de peso (ex: 250g)
   - **Descrição**: Descrição do produto
4. Clique em **"Salvar"** para confirmar as alterações
5. Clique em **"Cancelar"** para descartar as alterações

### Deletar Produtos
1. No painel de gerenciamento, clique no ícone de **lixeira (Deletar)**
2. Confirme a exclusão quando solicitado
3. O produto será removido permanentemente

## Estrutura de Dados

### Categorias Disponíveis
- **calendario-advento**: Calendário do Advento
- **panetone**: Panetone
- **barras**: Barras de chocolate
- **doces**: Doces Especiais
- **trufas**: Trufas
- **caixas**: Caixas de Presente
- **cartoes**: Cartões de Natal

### Formato de Produto
```javascript
{
  id: "produto-1",           // Identificador único
  name: "Nome do Produto",   // Nome exibido
  description: "Descrição",  // Descrição do produto
  price: "R$ 99,90",         // Formato visual do preço
  priceValue: 99.90,         // Valor numérico
  image: "url-da-imagem",    // URL da imagem
  weight: "250g",            // Peso do produto
  ingredients: [...],        // Lista de ingredientes
  tags: [...],               // Tags para filtros
  deliveryOptions: [...]     // Opções de entrega
}
```

## Dicas Importantes

1. **Backup**: O sistema usa KV Store do Supabase, mas considere manter backup dos produtos importantes
2. **Preços**: Ao alterar o campo "Preço", o "Valor Numérico" é atualizado automaticamente
3. **Imagens**: As imagens não podem ser alteradas pelo painel (use Unsplash ou URLs diretas)
4. **Sincronização**: Alterações são refletidas imediatamente após salvar
5. **Senha**: A senha de admin é `sweetbar2025` (recomenda-se alterá-la em produção)

## Solução de Problemas

### Produtos não aparecem após edição
- Verifique se está em "Modo: Backend"
- Recarregue a página
- Verifique o console do navegador para erros

### Erro ao salvar
- Verifique sua conexão com a internet
- Confirme que todos os campos obrigatórios estão preenchidos
- Verifique os logs no console

### Resetar para dados estáticos
- Clique em "Modo: Backend ✓" para voltar ao modo estático
- Os dados originais permanecerão intactos no código

## API Endpoints (para desenvolvedores)

```
GET    /make-server-c42493b2/products/:categoryId       - Buscar produtos
POST   /make-server-c42493b2/products/:categoryId       - Atualizar todos os produtos
PUT    /make-server-c42493b2/product/:categoryId/:id    - Atualizar um produto
DELETE /make-server-c42493b2/product/:categoryId/:id    - Deletar um produto
POST   /make-server-c42493b2/init-products              - Inicializar produtos
```

## Segurança

- A senha de admin está no código do frontend (apenas para protótipo)
- Para produção, implemente autenticação adequada via Supabase Auth
- Considere adicionar níveis de permissão (admin, editor, visualizador)
